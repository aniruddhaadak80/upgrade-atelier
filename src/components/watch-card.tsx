import Link from "next/link";
import { ArrowUpRight, Clock3, FileCheck2 } from "lucide-react";
import { RiskRibbon, riskStamp } from "@/components/risk-ribbon";
import { shortSeal } from "@/lib/canonical";
import type { WatchItem } from "@/lib/types";

export function WatchCard({ item }: { item: WatchItem }) {
  return (
    <article className="paper-panel watch-card">
      <div className="watch-card-top">
        <span className={`stamp ${riskStamp(item.analysis.band)}`}>{item.analysis.band} / {item.status}</span>
        <span className="muted" style={{ fontFamily: "Cascadia Code", fontSize: 10 }}>{item.source}</span>
      </div>
      <h2>{item.packageName}</h2>
      <div className="version-arrow">
        <strong>{item.currentVersion}</strong>
        <ArrowUpRight size={13} />
        <strong>{item.latestVersion}</strong>
      </div>
      <RiskRibbon analysis={item.analysis} />
      <p className="watch-card-summary">{item.analysis.summary}</p>
      <div className="card-footer">
        <span className="inline-flex items-center gap-1 muted" style={{ fontSize: 10 }}><Clock3 size={12} /> {new Date(item.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <Link href={`/watch/${item.id}`}>
          Open dossier <ArrowUpRight size={13} />
        </Link>
      </div>
      <div className="inline-between" style={{ marginTop: 11, color: "var(--muted)", fontSize: 9 }}>
        <span className="inline-flex items-center gap-1"><FileCheck2 size={11} /> {shortSeal(item.seal)}</span>
      </div>
    </article>
  );
}
