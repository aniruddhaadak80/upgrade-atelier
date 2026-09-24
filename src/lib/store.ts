import { neon } from "@neondatabase/serverless";
import { makeSeal, verifySeal } from "./canonical";
import { analyzeUpgrade } from "./engine";
import { getFallbackPackage } from "./fallback";
import { resolvePackage } from "./npm";
import type {
  AuditAction,
  AuditEvent,
  VerifyResult,
  WatchItem,
  WatchStatus,
} from "./types";

type SqlClient = ReturnType<typeof neon>;

type SeedBundle = {
  items: WatchItem[];
  audit: AuditEvent[];
};

export interface CreateWatchInput {
  packageName: string;
  currentVersion: string;
  status?: WatchStatus;
  note?: string;
}

export interface UpdateWatchInput {
  currentVersion?: string;
  status?: WatchStatus;
  note?: string;
  refresh?: boolean;
}

const memoryItems: WatchItem[] = [];
const memoryAudit: AuditEvent[] = [];
let memorySeeded = false;
let readyPromise: Promise<void> | null = null;
let sqlClient: SqlClient | null = null;

const packagePattern = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i;
const statuses: WatchStatus[] = ["watching", "ready", "paused"];

function getSqlClient(): SqlClient | null {
  if (!process.env.DATABASE_URL) return null;
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL);
  return sqlClient;
}

async function dbQuery<T>(statement: string, params: unknown[] = []): Promise<T[]> {
  const client = getSqlClient();
  if (!client) throw new Error("Neon is not configured");
  const result = await client.query(statement, params);
  return result as unknown as T[];
}

function itemPayload(item: WatchItem): Record<string, unknown> {
  return {
    id: item.id,
    packageName: item.packageName,
    ecosystem: item.ecosystem,
    currentVersion: item.currentVersion,
    latestVersion: item.latestVersion,
    status: item.status,
    note: item.note,
    snapshot: item.snapshot,
    analysis: item.analysis,
    source: item.source,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function createPayload(action: AuditAction, item: WatchItem): Record<string, unknown> {
  return { action, item: itemPayload(item) };
}

function updatePayload(before: WatchItem, after: WatchItem): Record<string, unknown> {
  return { action: "update", before: itemPayload(before), after: itemPayload(after) };
}

function deletePayload(item: WatchItem, deletedAt: string): Record<string, unknown> {
  return { action: "delete", item: itemPayload(item), deletedAt };
}

function seedBundle(): SeedBundle {
  const specs = [
    {
      packageName: "next",
      currentVersion: "15.5.7",
      status: "watching" as WatchStatus,
      note: "Check the App Router cache semantics before the next release train.",
      createdAt: "2026-09-21T09:10:00.000Z",
    },
    {
      packageName: "react",
      currentVersion: "18.3.1",
      status: "ready" as WatchStatus,
      note: "Candidate for a small canary after the type suite passes.",
      createdAt: "2026-09-19T15:40:00.000Z",
    },
    {
      packageName: "typescript",
      currentVersion: "5.8.3",
      status: "paused" as WatchStatus,
      note: "Hold until the editor plugin migration is tested on Windows.",
      createdAt: "2026-09-17T11:25:00.000Z",
    },
  ];
  const items: WatchItem[] = [];
  const audit: AuditEvent[] = [];
  let previousSeal = "";

  for (const spec of specs) {
    const snapshot = getFallbackPackage(spec.packageName);
    if (!snapshot) continue;
    const analysis = analyzeUpgrade({
      packageName: spec.packageName,
      currentVersion: spec.currentVersion,
      snapshot,
      now: new Date(spec.createdAt),
    });
    const base: WatchItem = {
      id: crypto.randomUUID(),
      packageName: spec.packageName,
      ecosystem: "npm",
      currentVersion: spec.currentVersion,
      latestVersion: snapshot.latestVersion,
      status: spec.status,
      note: spec.note,
      snapshot,
      analysis,
      source: "fallback",
      createdAt: spec.createdAt,
      updatedAt: spec.createdAt,
      previousSeal,
      seal: "",
    };
    const payload = createPayload("seed", base);
    const seal = makeSeal(payload, previousSeal);
    const item = { ...base, seal };
    items.push(item);
    audit.push({
      id: crypto.randomUUID(),
      entityId: item.id,
      action: "seed",
      payload,
      previousSeal,
      seal,
      createdAt: spec.createdAt,
    });
    previousSeal = seal;
  }

  return { items, audit };
}

async function insertItem(item: WatchItem): Promise<void> {
  await dbQuery(
    `INSERT INTO watch_items
      (id, package_name, current_version, status, item, created_at, updated_at, previous_seal, seal)
     VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9)`,
    [
      item.id,
      item.packageName,
      item.currentVersion,
      item.status,
      JSON.stringify(item),
      item.createdAt,
      item.updatedAt,
      item.previousSeal,
      item.seal,
    ],
  );
}

async function insertAudit(event: AuditEvent): Promise<void> {
  await dbQuery(
    `INSERT INTO audit_events
      (id, entity_id, action, payload, previous_seal, seal, created_at)
     VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)`,
    [
      event.id,
      event.entityId,
      event.action,
      JSON.stringify(event.payload),
      event.previousSeal,
      event.seal,
      event.createdAt,
    ],
  );
}

async function seedDatabase(): Promise<void> {
  const countRows = await dbQuery<{ count: number | string }>(
    "SELECT COUNT(*)::int AS count FROM watch_items",
  );
  if (Number(countRows[0]?.count ?? 0) > 0) return;
  const bundle = seedBundle();
  for (const item of bundle.items) {
    await insertItem(item);
  }
  for (const event of bundle.audit) {
    await insertAudit(event);
  }
}

async function initialize(): Promise<void> {
  if (!getSqlClient()) {
    if (!memorySeeded) {
      const bundle = seedBundle();
      memoryItems.push(...bundle.items);
      memoryAudit.push(...bundle.audit);
      memorySeeded = true;
    }
    return;
  }

  await dbQuery(
    `CREATE TABLE IF NOT EXISTS watch_items (
      id TEXT PRIMARY KEY,
      package_name TEXT NOT NULL,
      current_version TEXT NOT NULL,
      status TEXT NOT NULL,
      item JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL,
      previous_seal TEXT NOT NULL,
      seal TEXT NOT NULL
    )`,
  );
  await dbQuery(
    `CREATE TABLE IF NOT EXISTS audit_events (
      sequence BIGSERIAL PRIMARY KEY,
      id TEXT UNIQUE NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      payload JSONB NOT NULL,
      previous_seal TEXT NOT NULL,
      seal TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )`,
  );
  await dbQuery("CREATE INDEX IF NOT EXISTS watch_items_updated_at_idx ON watch_items (updated_at DESC)");
  await seedDatabase();
}

async function ensureReady(): Promise<void> {
  if (!readyPromise) readyPromise = initialize();
  await readyPromise;
}

function parseItem(value: unknown): WatchItem {
  if (typeof value === "string") return JSON.parse(value) as WatchItem;
  return value as WatchItem;
}

function parseAudit(row: Record<string, unknown>): AuditEvent {
  const payload = row.payload;
  return {
    sequence: typeof row.sequence === "number" ? row.sequence : Number(row.sequence ?? 0),
    id: String(row.id),
    entityId: String(row.entity_id),
    action: row.action as AuditAction,
    payload: (typeof payload === "string" ? JSON.parse(payload) : payload) as Record<string, unknown>,
    previousSeal: String(row.previous_seal),
    seal: String(row.seal),
    createdAt: new Date(String(row.created_at)).toISOString(),
  };
}

async function latestAuditSeal(): Promise<string> {
  if (!getSqlClient()) return memoryAudit.at(-1)?.seal ?? "";
  const rows = await dbQuery<{ seal: string }>(
    "SELECT seal FROM audit_events ORDER BY sequence DESC LIMIT 1",
  );
  return rows[0]?.seal ?? "";
}

function normalizedPackageName(value: string): string {
  const name = value.trim().toLowerCase();
  if (!packagePattern.test(name)) throw new Error("Enter a valid npm package name.");
  return name;
}

function normalizedVersion(value: string): string {
  const version = value.trim();
  if (!/^\d+(?:\.\d+){0,2}(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error("Enter a version such as 5.8.3 or 5.8.3-rc.1.");
  }
  return version;
}

function normalizedStatus(value: WatchStatus | undefined, fallback: WatchStatus = "watching"): WatchStatus {
  if (!value) return fallback;
  if (!statuses.includes(value)) throw new Error("Status must be watching, ready, or paused.");
  return value;
}

export function getStorageKind(): "neon" | "memory" {
  return getSqlClient() ? "neon" : "memory";
}

export async function listWatchItems(): Promise<WatchItem[]> {
  await ensureReady();
  if (!getSqlClient()) {
    return [...memoryItems].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  }
  const rows = await dbQuery<{ item: unknown }>(
    "SELECT item FROM watch_items ORDER BY updated_at DESC",
  );
  return rows.map((row) => parseItem(row.item));
}

export async function getWatchItem(id: string): Promise<WatchItem | null> {
  await ensureReady();
  if (!getSqlClient()) return memoryItems.find((item) => item.id === id) ?? null;
  const rows = await dbQuery<{ item: unknown }>("SELECT item FROM watch_items WHERE id = $1", [id]);
  return rows[0] ? parseItem(rows[0].item) : null;
}

export async function createWatchItem(input: CreateWatchInput): Promise<WatchItem> {
  await ensureReady();
  const packageName = normalizedPackageName(input.packageName);
  const currentVersion = normalizedVersion(input.currentVersion);
  const snapshot = await resolvePackage(packageName);
  if (!snapshot) throw new Error("That package was not found in npm and is not in the offline sample set.");
  const analysis = analyzeUpgrade({ packageName, currentVersion, snapshot });
  const createdAt = new Date().toISOString();
  const previousSeal = await latestAuditSeal();
  const base: WatchItem = {
    id: crypto.randomUUID(),
    packageName,
    ecosystem: "npm",
    currentVersion,
    latestVersion: snapshot.latestVersion,
    status: normalizedStatus(input.status),
    note: input.note?.trim() ?? "",
    snapshot,
    analysis,
    source: snapshot.source,
    createdAt,
    updatedAt: createdAt,
    previousSeal,
    seal: "",
  };
  const payload = createPayload("create", base);
  const seal = makeSeal(payload, previousSeal);
  const item = { ...base, seal };
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    entityId: item.id,
    action: "create",
    payload,
    previousSeal,
    seal,
    createdAt,
  };
  if (getSqlClient()) {
    await insertItem(item);
    await insertAudit(event);
  } else {
    memoryItems.push(item);
    memoryAudit.push(event);
  }
  return item;
}

export async function updateWatchItem(id: string, input: UpdateWatchInput): Promise<WatchItem> {
  await ensureReady();
  const existing = await getWatchItem(id);
  if (!existing) throw new Error("Watch item not found.");
  const currentVersion = input.currentVersion === undefined
    ? existing.currentVersion
    : normalizedVersion(input.currentVersion);
  let snapshot = existing.snapshot;
  if (input.refresh || currentVersion !== existing.currentVersion) {
    snapshot = (await resolvePackage(existing.packageName)) ?? snapshot;
  }
  const analysis = input.refresh || currentVersion !== existing.currentVersion
    ? analyzeUpgrade({ packageName: existing.packageName, currentVersion, snapshot })
    : existing.analysis;
  const updatedAt = new Date().toISOString();
  const afterBase: WatchItem = {
    ...existing,
    currentVersion,
    latestVersion: snapshot.latestVersion,
    status: normalizedStatus(input.status, existing.status),
    note: input.note === undefined ? existing.note : input.note.trim(),
    snapshot,
    analysis,
    source: snapshot.source,
    updatedAt,
  };
  const previousSeal = await latestAuditSeal();
  const payload = updatePayload(existing, afterBase);
  const seal = makeSeal(payload, previousSeal);
  const item = { ...afterBase, previousSeal, seal };
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    entityId: item.id,
    action: "update",
    payload,
    previousSeal,
    seal,
    createdAt: updatedAt,
  };
  if (getSqlClient()) {
    await dbQuery(
      `UPDATE watch_items
       SET package_name = $1, current_version = $2, status = $3, item = $4::jsonb,
           updated_at = $5, previous_seal = $6, seal = $7
       WHERE id = $8`,
      [item.packageName, item.currentVersion, item.status, JSON.stringify(item), item.updatedAt, item.previousSeal, item.seal, item.id],
    );
    await insertAudit(event);
  } else {
    const index = memoryItems.findIndex((entry) => entry.id === id);
    if (index >= 0) memoryItems[index] = item;
    memoryAudit.push(event);
  }
  return item;
}

export async function deleteWatchItem(id: string): Promise<WatchItem> {
  await ensureReady();
  const existing = await getWatchItem(id);
  if (!existing) throw new Error("Watch item not found.");
  const deletedAt = new Date().toISOString();
  const previousSeal = await latestAuditSeal();
  const payload = deletePayload(existing, deletedAt);
  const seal = makeSeal(payload, previousSeal);
  const event: AuditEvent = {
    id: crypto.randomUUID(),
    entityId: id,
    action: "delete",
    payload,
    previousSeal,
    seal,
    createdAt: deletedAt,
  };
  if (getSqlClient()) {
    await insertAudit(event);
    await dbQuery("DELETE FROM watch_items WHERE id = $1", [id]);
  } else {
    const index = memoryItems.findIndex((entry) => entry.id === id);
    if (index >= 0) memoryItems.splice(index, 1);
    memoryAudit.push(event);
  }
  return existing;
}

export async function listAuditEvents(limit = 50): Promise<AuditEvent[]> {
  await ensureReady();
  if (!getSqlClient()) return memoryAudit.slice(-limit).reverse();
  const rows = await dbQuery<Record<string, unknown>>(
    "SELECT sequence, id, entity_id, action, payload, previous_seal, seal, created_at FROM audit_events ORDER BY sequence DESC LIMIT $1",
    [limit],
  );
  return rows.map(parseAudit);
}

export async function verifyAuditChain(): Promise<VerifyResult> {
  await ensureReady();
  const events = getSqlClient()
    ? (await dbQuery<Record<string, unknown>>(
        "SELECT sequence, id, entity_id, action, payload, previous_seal, seal, created_at FROM audit_events ORDER BY sequence ASC",
      )).map(parseAudit)
    : [...memoryAudit];
  let previousSeal = "";
  let brokenAt: string | null = null;
  for (const event of events) {
    if (event.previousSeal !== previousSeal || !verifySeal(event.payload, previousSeal, event.seal)) {
      brokenAt = event.id;
      break;
    }
    previousSeal = event.seal;
  }
  return {
    valid: brokenAt === null,
    checked: events.length,
    headSeal: previousSeal,
    brokenAt,
  };
}

export async function countWatchItems(): Promise<number> {
  const items = await listWatchItems();
  return items.length;
}
