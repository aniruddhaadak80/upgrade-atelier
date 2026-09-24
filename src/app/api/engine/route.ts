import { NextResponse } from "next/server";
import { getEnginePolicy } from "@/lib/engine";

export const revalidate = 300;

export async function GET() {
  return NextResponse.json(getEnginePolicy(), {
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
