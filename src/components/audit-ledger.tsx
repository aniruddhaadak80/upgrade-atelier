"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, RefreshCw, ScrollText } from "lucide-react";
import type { AuditEvent, VerifyResult } from "@/lib/types";

export function AuditLedger({ initialEvents, initialVerification }: { initialEvents: AuditEvent[]; initialVerification: VerifyResult }) {
  const [events, setEvents] = useState(initialEvents);
  const [verification, setVerification] = useState(initialVerification);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function verify() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/audit/verify");
      const result = (await response.json()) as VerifyResult & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Verification failed.");
      setVerification(result);
      const eventsResponse = await fetch("/api/audit");
      const eventsBody = (await eventsResponse.json()) as { events?: AuditEvent[] };
      if (eventsBody.events) setEvents(eventsBody.events);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="paper-panel detail-card" style={{ marginBottom: 18 }}>
        <div className="inline-between">
          <div>
            <p className="eyebrow">REPLAYABLE LEDGER</p>
            <h2 style={{ margin: "7px 0 0", fontSize: 25 }}>{verification.valid ? "The chain is intact." : "The chain needs attention."}</h2>
            <p className="muted" style={{ margin: "7px 0 0", fontSize: 13 }}>Every mutation hashes the previous seal and canonical JSON with SHA-384.</p>
          </div>
          <span className={`stamp ${verification.valid ? "green" : "rose"}`}>{verification.valid ? "verified" : "broken"}</span>
        </div>
        <div className="inline-between" style={{ marginTop: 19 }}>
          <span className="muted" style={{ fontFamily: "Cascadia Code", fontSize: 10 }}>{verification.checked} events · head {verification.headSeal ? `${verification.headSeal.slice(0, 12)}…` : "genesis"}</span>
          <button className="btn-secondary" type="button" onClick={verify} disabled={busy}>
            {busy ? <RefreshCw size={14} className="spin" /> : verification.valid ? <CheckCircle2 size={14} /> : <CircleAlert size={14} />}
            {busy ? "Replaying…" : "Replay chain"}
          </button>
        </div>
        {verification.brokenAt ? <p className="form-error" style={{ marginTop: 13 }}>First broken event: {verification.brokenAt}</p> : null}
        {error ? <p className="form-error" style={{ marginTop: 13 }} role="alert">{error}</p> : null}
      </div>

      <div className="audit-table-wrap">
        <table className="audit-table">
          <thead>
            <tr><th>event</th><th>action</th><th>entity</th><th>when</th><th>seal</th><th>payload</th></tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id}>
                <td><span className="muted" style={{ fontFamily: "Cascadia Code", fontSize: 10 }}>{event.sequence ?? "local"}</span></td>
                <td><span className={`stamp ${event.action === "delete" ? "rose" : event.action === "create" || event.action === "seed" ? "green" : "amber"}`}>{event.action}</span></td>
                <td style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.entityId}</td>
                <td className="muted">{new Date(event.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                <td><span className="hash">{event.seal}</span></td>
                <td>
                  <details>
                    <summary className="inline-flex items-center gap-1" style={{ cursor: "pointer", color: "var(--cobalt)", fontSize: 11 }}><ScrollText size={12} /> inspect</summary>
                    <pre className="code-block" style={{ maxWidth: 300 }}>{JSON.stringify(event.payload, null, 2)}</pre>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
