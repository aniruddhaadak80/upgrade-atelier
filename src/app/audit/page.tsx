import { ShieldCheck } from "lucide-react";
import { AuditLedger } from "@/components/audit-ledger";
import { listAuditEvents, verifyAuditChain } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Audit ledger",
  description: "Replay the SHA-384 mutation chain behind every upgrade record.",
};

export default async function AuditPage() {
  const [events, verification] = await Promise.all([listAuditEvents(50), verifyAuditChain()]);
  return (
    <main className="page-width">
      <section className="page-hero">
        <p className="eyebrow">INTEGRITY / REPLAYABLE</p>
        <h1>The audit ledger.</h1>
        <p>Every create, update, and delete carries a SHA-384 seal over the previous seal plus canonical JSON. Change one byte and the replay stops.</p>
        <div className="hero-note"><ShieldCheck size={17} color="var(--cobalt)" /><span>Seals are evidence of internal consistency, not a claim that an upstream package is safe.</span></div>
      </section>
      <section className="section-pad" style={{ paddingTop: 10 }}>
        <AuditLedger initialEvents={events} initialVerification={verification} />
      </section>
    </main>
  );
}
