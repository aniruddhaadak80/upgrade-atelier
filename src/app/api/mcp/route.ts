import { NextResponse } from "next/server";
import { errorResponse, isRecord } from "@/lib/api";
import { analysisSeal, analyzeUpgrade } from "@/lib/engine";
import { resolvePackage } from "@/lib/npm";
import {
  createWatchItem,
  deleteWatchItem,
  listWatchItems,
  updateWatchItem,
  verifyAuditChain,
} from "@/lib/store";
import type { McpToolDefinition } from "@/lib/types";

interface JsonRpcRequest {
  id?: unknown;
  method?: unknown;
  params?: unknown;
}

const tools: McpToolDefinition[] = [
  {
    name: "analyze_package",
    description: "Score an npm upgrade and return explainable factors plus an analysis seal.",
    inputSchema: {
      type: "object",
      required: ["packageName", "currentVersion"],
      properties: { packageName: { type: "string" }, currentVersion: { type: "string" } },
    },
  },
  {
    name: "list_watches",
    description: "List the persisted package watch records in the shared workspace.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "create_watch",
    description: "Create a persisted watch record for an npm package.",
    inputSchema: {
      type: "object",
      required: ["packageName", "currentVersion"],
      properties: {
        packageName: { type: "string" },
        currentVersion: { type: "string" },
        note: { type: "string" },
        status: { type: "string", enum: ["watching", "ready", "paused"] },
      },
    },
  },
  {
    name: "update_watch",
    description: "Update the status, note, installed version, or refresh a persisted watch record.",
    inputSchema: {
      type: "object",
      required: ["id"],
      properties: {
        id: { type: "string" },
        currentVersion: { type: "string" },
        note: { type: "string" },
        status: { type: "string", enum: ["watching", "ready", "paused"] },
        refresh: { type: "boolean" },
      },
    },
  },
  {
    name: "delete_watch",
    description: "Delete a persisted watch record while preserving its audit event.",
    inputSchema: { type: "object", required: ["id"], properties: { id: { type: "string" } } },
  },
  {
    name: "verify_chain",
    description: "Replay the SHA-384 audit chain and report the first broken event, if any.",
    inputSchema: { type: "object", properties: {} },
  },
];

function result(id: unknown, value: unknown): NextResponse {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, result: value });
}

function failure(id: unknown, code: number, message: string): NextResponse {
  return NextResponse.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
}

function toolContent(value: unknown): { content: Array<{ type: "text"; text: string }> } {
  return { content: [{ type: "text", text: JSON.stringify(value, null, 2) }] };
}

function argsRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function stringArg(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || !value.trim()) throw new Error(`${key} is required.`);
  return value;
}

async function callTool(name: string, rawArgs: unknown): Promise<unknown> {
  const args = argsRecord(rawArgs);
  if (name === "analyze_package") {
    const packageName = stringArg(args, "packageName");
    const currentVersion = stringArg(args, "currentVersion");
    const snapshot = await resolvePackage(packageName);
    if (!snapshot) throw new Error("Package not found in npm or the offline set.");
    const analysis = analyzeUpgrade({ packageName: packageName.trim().toLowerCase(), currentVersion, snapshot });
    return { analysis, snapshot, seal: analysisSeal(analysis, snapshot) };
  }
  if (name === "list_watches") return { items: await listWatchItems() };
  if (name === "create_watch") {
    return {
      item: await createWatchItem({
        packageName: stringArg(args, "packageName"),
        currentVersion: stringArg(args, "currentVersion"),
        note: typeof args.note === "string" ? args.note : undefined,
        status: args.status === "watching" || args.status === "ready" || args.status === "paused" ? args.status : undefined,
      }),
    };
  }
  if (name === "update_watch") {
    return {
      item: await updateWatchItem(stringArg(args, "id"), {
        currentVersion: typeof args.currentVersion === "string" ? args.currentVersion : undefined,
        note: typeof args.note === "string" ? args.note : undefined,
        status: args.status === "watching" || args.status === "ready" || args.status === "paused" ? args.status : undefined,
        refresh: args.refresh === true,
      }),
    };
  }
  if (name === "delete_watch") return { deleted: await deleteWatchItem(stringArg(args, "id")) };
  if (name === "verify_chain") return await verifyAuditChain();
  throw new Error(`Unknown tool: ${name}`);
}

export async function POST(request: Request) {
  let requestBody: JsonRpcRequest;
  try {
    requestBody = (await request.json()) as JsonRpcRequest;
  } catch (error) {
    return errorResponse(error);
  }
  const { id, method, params } = requestBody;
  if (method === "initialize") {
    return result(id, {
      protocolVersion: "2024-11-05",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "upgrade-atelier", version: "1.0.0" },
    });
  }
  if (method === "tools/list") return result(id, { tools });
  if (method !== "tools/call") return failure(id, -32601, "Method not found.");

  const call = argsRecord(params);
  const name = typeof call.name === "string" ? call.name : "";
  if (!name) return failure(id, -32602, "Tool name is required.");
  try {
    const value = await callTool(name, call.arguments);
    return result(id, { ...toolContent(value), structuredContent: value });
  } catch (error) {
    return failure(id, -32000, error instanceof Error ? error.message : "Tool call failed.");
  }
}
