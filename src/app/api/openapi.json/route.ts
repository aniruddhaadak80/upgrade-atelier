import { NextResponse } from "next/server";
import { getOpenApiDocument } from "@/lib/openapi";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return NextResponse.json(getOpenApiDocument(new URL(request.url).origin), {
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
