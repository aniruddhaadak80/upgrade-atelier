import { NextResponse } from "next/server";
import { errorResponse, requestJson } from "@/lib/api";
import { analysisSeal, analyzeUpgrade } from "@/lib/engine";
import { resolvePackage } from "@/lib/npm";

export async function POST(request: Request) {
  try {
    const body = await requestJson(request);
    const packageName = typeof body.packageName === "string" ? body.packageName : "";
    const currentVersion = typeof body.currentVersion === "string" ? body.currentVersion : "";
    if (!packageName || !currentVersion) throw new Error("packageName and currentVersion are required.");
    const snapshot = await resolvePackage(packageName);
    if (!snapshot) return NextResponse.json({ error: "Package not found in npm or the offline set." }, { status: 404 });
    const analysis = analyzeUpgrade({ packageName: packageName.trim().toLowerCase(), currentVersion, snapshot });
    return NextResponse.json({ analysis, snapshot, seal: analysisSeal(analysis, snapshot) });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
