import { NextResponse } from "next/server";
import { errorResponse, requestJson } from "@/lib/api";
import { deleteWatchItem, getWatchItem, updateWatchItem } from "@/lib/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await getWatchItem(id);
    if (!item) return NextResponse.json({ error: "Watch item not found." }, { status: 404 });
    return NextResponse.json({ item });
  } catch (error) {
    return errorResponse(error, 503);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await requestJson(request);
    const item = await updateWatchItem(id, {
      currentVersion: typeof body.currentVersion === "string" ? body.currentVersion : undefined,
      status: body.status === "watching" || body.status === "ready" || body.status === "paused" ? body.status : undefined,
      note: typeof body.note === "string" ? body.note : undefined,
      refresh: body.refresh === true,
    });
    return NextResponse.json({ item });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const item = await deleteWatchItem(id);
    return NextResponse.json({ deleted: item.id, seal: item.seal });
  } catch (error) {
    return errorResponse(error);
  }
}
