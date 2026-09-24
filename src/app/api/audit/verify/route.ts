import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { verifyAuditChain } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await verifyAuditChain());
  } catch (error) {
    return errorResponse(error, 503);
  }
}
