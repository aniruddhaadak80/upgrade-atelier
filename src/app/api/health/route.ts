import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { countWatchItems, getStorageKind, verifyAuditChain } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [count, audit] = await Promise.all([countWatchItems(), verifyAuditChain()]);
    return NextResponse.json({
      status: "ok",
      service: "upgrade-atelier",
      storage: getStorageKind(),
      watchCount: count,
      audit: { valid: audit.valid, checked: audit.checked },
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return errorResponse(error, 503);
  }
}
