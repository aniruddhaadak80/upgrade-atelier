"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Download, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FactorList, ConfidenceMark } from "@/components/factor-list";
import { RiskRibbon, riskStamp } from "@/components/risk-ribbon";
import { shortSeal } from "@/lib/canonical";
import type { WatchItem, WatchStatus } from "@/lib/types";

export function WatchDetail({ item: initialItem }: { item: WatchItem }) {
  const router = useRouter();
  const [item, setItem] = useState(initialItem);
  const [status, setStatus] = useState<WatchStatus>(initialItem.status);
  const [currentVersion, setCurrentVersion] = useState(initialItem.currentVersion);
  const [note, setNote] = useState(initialItem.note);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function patch(body: Record<string, unknown>, mode: "save" | "refresh" = "save") {
    setError("");
    if (mode === "save") setSaving(true);
    else setRefreshing(true);
    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = (await response.json()) as { item?: WatchItem; error?: string };
      if (!response.ok || !result.item) throw new Error(result.error ?? "Could not update this dossier.");
      setItem(result.item);
      setStatus(result.item.status);
      setCurrentVersion(result.item.currentVersion);
      setNote(result.item.note);
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not update this dossier.");
    } finally {
      setSaving(false);
      setRefreshing(false);
    }
  }

  async function remove() {
    if (!window.confirm(`Delete the ${item.packageName} watch record? The audit event will remain.`)) return;
    const response = await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    if (!response.ok) {
      const result = (await response.json()) as { error?: string };
      setError(result.error ?? "Could not delete this dossier.");
      return;
    }
    router.push("/watch");
    router.refresh();
  }

  return (
    <div className="page-width">
      <div className="page-hero" style={{ paddingBottom: 24 }}>
        <Link href="/watch" className="inline-flex items-center gap-2 muted" style={{ fontSize: 12, fontWeight: 800 }}>
          <ArrowLeft size={14} /> back to watch desk
        </Link>
      </div>
      <div className="detail-layout">
        <main className="detail-main">
          <section className="paper-panel detail-card">
            <div className="detail-title-row">
              <div>
                <p className="eyebrow">DOSSIER / {item.ecosystem.toUpperCase()}</p>
                <h1>{item.packageName}</h1>
                <p>{item.currentVersion} <span aria-hidden="true">→</span> {item.latestVersion} · saved {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <span className={`stamp ${riskStamp(item.analysis.band)}`}>{item.analysis.band} lane</span>
            </div>
            <div className="score-block">
              <span className="score-number">{item.analysis.score}<small>/100</small></span>
              <div className="score-copy">
                <h2>{item.analysis.headline}</h2>
                <p>{item.analysis.summary}</p>
                <div style={{ marginTop: 9 }}><ConfidenceMark confidence={item.analysis.confidence} /></div>
              </div>
            </div>
            <RiskRibbon analysis={item.analysis} showScore={false} />
          </section>

          <section className="paper-panel detail-card">
            <div className="inline-between">
              <div>
                <p className="eyebrow">EVIDENCE / EXPLAINABLE</p>
                <h2 style={{ marginTop: 7 }}>What moved the score</h2>
              </div>
              <span className="muted" style={{ fontFamily: "Cascadia Code", fontSize: 10 }}>same engine / REST / MCP</span>
            </div>
            <div style={{ marginTop: 20 }}><FactorList factors={item.analysis.factors} /></div>
          </section>

          <section className="paper-panel detail-card">
            <p className="eyebrow">RUNBOOK</p>
            <h2 style={{ marginTop: 7 }}>A safe next move</h2>
            <ol className="step-list">
              {item.analysis.migrationSteps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </section>
        </main>

        <aside className="detail-side">
          <section className="paper-panel detail-card">
            <div className="inline-between">
              <div>
                <p className="eyebrow">REVIEW STATE</p>
                <h2 style={{ marginTop: 7 }}>Edit the brief</h2>
              </div>
              <span className="stamp">{item.status}</span>
            </div>
            <div className="edit-grid" style={{ marginTop: 20 }}>
              <label className="field-label">
                status
                <select className="field-select" value={status} onChange={(event) => setStatus(event.target.value as WatchStatus)}>
                  <option value="watching">watching</option>
                  <option value="ready">ready</option>
                  <option value="paused">paused</option>
                </select>
              </label>
              <label className="field-label">
                installed version
                <input className="field-input" value={currentVersion} onChange={(event) => setCurrentVersion(event.target.value)} />
              </label>
              <label className="field-label">
                review note
                <textarea className="field-textarea" value={note} onChange={(event) => setNote(event.target.value)} rows={4} />
              </label>
              {error ? <p className="form-error" role="alert">{error}</p> : null}
              <button className="btn-primary" type="button" onClick={() => patch({ status, currentVersion, note })} disabled={saving}>
                {saving ? <LoaderCircle size={15} className="spin" /> : <Check size={15} />}
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button className="btn-secondary" type="button" onClick={() => patch({ refresh: true }, "refresh")} disabled={refreshing}>
                {refreshing ? <LoaderCircle size={15} className="spin" /> : <RefreshCw size={15} />}
                {refreshing ? "Refreshing registry…" : "Refresh live analysis"}
              </button>
            </div>
          </section>

          <section className="paper-panel detail-card">
            <p className="eyebrow">PACKAGE RECEIPT</p>
            <h2 style={{ marginTop: 7 }}>Snapshot facts</h2>
            <div className="meta-grid" style={{ marginTop: 17 }}>
              <div className="meta-cell"><span>source</span><strong>{item.source}</strong></div>
              <div className="meta-cell"><span>license</span><strong>{item.snapshot.license ?? "not supplied"}</strong></div>
              <div className="meta-cell"><span>maintainers</span><strong>{item.snapshot.maintainerCount}</strong></div>
              <div className="meta-cell"><span>unpacked</span><strong>{item.snapshot.unpackedSize ? `${(item.snapshot.unpackedSize / 1_000_000).toFixed(1)} MB` : "unknown"}</strong></div>
              <div className="meta-cell"><span>published</span><strong>{new Date(item.snapshot.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong></div>
              <div className="meta-cell"><span>last modified</span><strong>{new Date(item.snapshot.lastModified).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</strong></div>
            </div>
            {item.snapshot.repository ? <a className="btn-quiet" style={{ marginTop: 12, width: "100%" }} href={item.snapshot.repository} target="_blank" rel="noreferrer">open repository</a> : null}
          </section>

          <section className="paper-panel detail-card">
            <p className="eyebrow">INTEGRITY</p>
            <h2 style={{ marginTop: 7 }}>Record seal</h2>
            <div className="seal-box" style={{ marginTop: 15 }}>
              <span className="stamp green">SHA-384</span>
              <span>{shortSeal(item.seal)}<br />previous: {shortSeal(item.previousSeal)}</span>
            </div>
            <div className="inline-between" style={{ marginTop: 14 }}>
              <a className="btn-quiet" href={`/api/export?format=markdown`} download="upgrade-atelier-brief.md"><Download size={14} /> export all</a>
              <button className="btn-danger" type="button" onClick={remove}><Trash2 size={14} /> delete</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
