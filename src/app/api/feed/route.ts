import { NextResponse } from "next/server";
import { fetchReleaseFeed } from "@/lib/npm";

export const revalidate = 900;

export async function GET() {
  const feed = await fetchReleaseFeed();
  return NextResponse.json(feed, {
    headers: { "cache-control": "s-maxage=900, stale-while-revalidate=1800" },
  });
}
