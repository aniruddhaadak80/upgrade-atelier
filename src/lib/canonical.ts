import { createHash } from "node:crypto";

function normalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value
      .map((entry) => normalize(entry))
      .filter((entry) => entry !== undefined);
  }

  if (value !== null && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.keys(record)
      .filter((key) => record[key] !== undefined)
      .sort()
      .map((key) => [key, normalize(record[key])]);
    return Object.fromEntries(entries);
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    return String(value);
  }

  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value)) ?? "null";
}

export function makeSeal(payload: unknown, previousSeal: string): string {
  return createHash("sha384")
    .update(previousSeal)
    .update(canonicalJson(payload))
    .digest("hex");
}

export function verifySeal(
  payload: unknown,
  previousSeal: string,
  expectedSeal: string,
): boolean {
  return makeSeal(payload, previousSeal) === expectedSeal;
}

export function shortSeal(seal: string): string {
  return seal ? `${seal.slice(0, 8)}…${seal.slice(-6)}` : "genesis";
}
