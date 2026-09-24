import { NextResponse } from "next/server";
import { errorResponse, requestJson } from "@/lib/api";
import { createWatchItem, getStorageKind, listWatchItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await listWatchItems();
    return NextResponse.json({ items, storage: getStorageKind() });
  } catch (error) {
    return errorResponse(error, 503);
  }
}

export async function POST(request: Request) {
  try {
    const body = await requestJson(request);
    if (typeof body.packageName !== "string" || typeof body.currentVersion !== "string") {
      throw new Error("packageName and currentVersion are required.");
    }
    const item = await createWatchItem({
      packageName: body.packageName,
      currentVersion: body.currentVersion,
      status: body.status === "watching" || body.status === "ready" || body.status === "paused" ? body.status : undefined,
      note: typeof body.note === "string" ? body.note : undefined,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
