import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { listAuditEvents } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const events = await listAuditEvents(50);
    return NextResponse.json({ events });
  } catch (error) {
    return errorResponse(error, 503);
  }
}
