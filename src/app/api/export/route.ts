import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api";
import { listWatchItems } from "@/lib/store";

function markdownBrief(items: Awaited<ReturnType<typeof listWatchItems>>): string {
  const rows = items.map((item) => {
    const factors = item.analysis.factors.map((factor) => `- **${factor.label}:** ${factor.value} — ${factor.detail}`).join("\n");
    return `## ${item.packageName} ${item.currentVersion} → ${item.latestVersion}\n\n- **Band:** ${item.analysis.band.toUpperCase()} (${item.analysis.score}/100)\n- **Status:** ${item.status}\n- **Source:** ${item.source}\n- **Seal:** \`${item.seal}\`\n\n${item.analysis.summary}\n\n### Evidence\n${factors}\n\n### Migration notes\n${item.analysis.migrationSteps.map((step) => `- ${step}`).join("\n")}\n`;
  });
  return `# Upgrade Atelier brief\n\nGenerated ${new Date().toISOString()}\n\n${rows.join("\n---\n\n") || "No watch items yet."}\n`;
}

export async function GET(request: Request) {
  try {
    const items = await listWatchItems();
    const format = new URL(request.url).searchParams.get("format") ?? "markdown";
    if (format === "json") return NextResponse.json({ items, generatedAt: new Date().toISOString() });
    return new NextResponse(markdownBrief(items), {
      headers: {
        "content-type": "text/markdown; charset=utf-8",
        "content-disposition": 'attachment; filename="upgrade-atelier-brief.md"',
      },
    });
  } catch (error) {
    return errorResponse(error, 503);
  }
}
