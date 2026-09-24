import { CheckCircle2, CircleAlert, ShieldCheck } from "lucide-react";
import type { RiskFactor } from "@/lib/types";

export function FactorList({ factors }: { factors: RiskFactor[] }) {
  return (
    <div className="factor-list">
      {factors.map((factor) => (
        <div className="factor-row" key={factor.id}>
          <span className="factor-label">{factor.label}</span>
          <span className="factor-detail">{factor.detail}</span>
          <span className="factor-bar" aria-hidden="true"><span className={factor.tone} style={{ width: `${factor.impact}%` }} /></span>
          <span className="factor-score">{factor.value}<br />{factor.impact}%</span>
        </div>
      ))}
    </div>
  );
}

export function ConfidenceMark({ confidence }: { confidence: "high" | "medium" | "low" }) {
  const Icon = confidence === "high" ? CheckCircle2 : confidence === "medium" ? ShieldCheck : CircleAlert;
  return <span className="inline-flex items-center gap-1 muted" style={{ fontSize: 11 }}><Icon size={13} /> {confidence} confidence</span>;
}
