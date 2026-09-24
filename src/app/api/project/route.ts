import { NextResponse } from "next/server";
import { fetchProjectMetadata } from "@/lib/project";

export const revalidate = 300;

export async function GET() {
  return NextResponse.json(await fetchProjectMetadata(), {
    headers: { "cache-control": "public, s-maxage=300, stale-while-revalidate=600" },
  });
}
