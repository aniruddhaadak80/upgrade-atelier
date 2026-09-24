import { NextResponse } from "next/server";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function errorResponse(error: unknown, status = 400): NextResponse {
  const message = error instanceof Error ? error.message : "Request could not be completed.";
  return NextResponse.json({ error: message }, { status });
}

export async function requestJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = (await request.json()) as unknown;
    if (!isRecord(body)) throw new Error("Request body must be a JSON object.");
    return body;
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}
