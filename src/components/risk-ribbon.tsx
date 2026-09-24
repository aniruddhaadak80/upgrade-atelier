import type { RiskBand, UpgradeAnalysis } from "@/lib/types";

export function RiskRibbon({ analysis, showScore = true }: { analysis: UpgradeAnalysis; showScore?: boolean }) {
  const filled = Math.max(1, Math.ceil(analysis.score / 20));
  return (
    <div aria-label={`Risk score ${analysis.score} out of 100, ${analysis.band}`}>
      <div className="risk-ribbon" aria-hidden="true">
        {Array.from({ length: 5 }, (_, index) => (
          <span key={index} className={`risk-segment ${index < filled ? `on ${analysis.band}` : ""}`} />
        ))}
      </div>
      {showScore ? (
        <div className="inline-between" style={{ marginTop: 8 }}>
          <span className="muted" style={{ fontSize: 11 }}>{analysis.band} review lane</span>
          <span className="score-number">{analysis.score}<small>/100</small></span>
        </div>
      ) : null}
    </div>
  );
}

export function riskStamp(band: RiskBand): string {
  if (band === "low") return "green";
  if (band === "watch") return "amber";
  if (band === "review") return "rose";
  return "rose";
}
