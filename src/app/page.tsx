import Link from "next/link";
import { ArrowRight, Braces, FileCheck2, GitBranch, ShieldCheck, Workflow } from "lucide-react";
import { LandingComposer } from "@/components/landing-composer";
import { ReleaseFeed } from "@/components/release-feed";
import { RepoPassport } from "@/components/repo-passport";
import { fetchProjectMetadata } from "@/lib/project";
import { fetchReleaseFeed } from "@/lib/npm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dependency decisions, made legible",
  description: "Build a real, explainable upgrade dossier for any npm package in seconds.",
};

export default async function Home() {
  const [feed, project] = await Promise.all([fetchReleaseFeed(), fetchProjectMetadata()]);
  return (
    <main>
      <section className="page-width hero-grid">
        <div>
          <p className="eyebrow">FIELD KIT 01 / DEPENDENCY DECISIONS</p>
          <h1 className="hero-title">Know what to <span className="highlight">upgrade</span> before the upgrade knows you.</h1>
          <p className="hero-lede">Upgrade Atelier turns a package name and an installed version into a living dossier: live release signal, explainable risk factors, migration notes, and a replayable integrity seal.</p>
          <div className="hero-actions">
            <Link href="/watch" className="btn-primary">Open watch desk <ArrowRight size={15} /></Link>
            <Link href="/agent" className="btn-secondary">Use the agent endpoint <Workflow size={15} /></Link>
          </div>
          <div className="hero-note">
            <ShieldCheck size={17} color="var(--cobalt)" />
            <span><strong>No account, API key, or black box.</strong> The core score is deterministic and the registry has a sealed offline fallback.</span>
          </div>
        </div>
        <LandingComposer />
      </section>

      <section className="page-width section-pad" style={{ paddingTop: 28 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE REGISTRY, EDITED</p>
            <h2>See the release<br />before you ship it.</h2>
          </div>
          <p>One public feed, normalized into a small working surface. Click a card to inspect the upstream package, then save the exact version you use.</p>
        </div>
        <ReleaseFeed feed={feed} />
      </section>

      <section className="page-width" style={{ paddingBottom: 18 }}>
        <RepoPassport project={project} />
      </section>

      <section className="page-width section-pad" style={{ paddingTop: 20 }}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">THREE JOBS / ZERO THEATER</p>
            <h2>A useful answer<br />has a next move.</h2>
          </div>
          <p>Every control lands in a real API route, a real record, and a visible audit event. The result is a small workflow you can hand to a teammate or an agent.</p>
        </div>
        <div className="watch-grid">
          <article className="paper-panel watch-card">
            <span className="stamp green">01 / remember</span>
            <h2>Keep a watch desk</h2>
            <p className="watch-card-summary">Save the package and installed version so the next upgrade is a record, not a forgotten tab.</p>
            <div className="card-footer"><span className="muted" style={{ fontSize: 11 }}>create · update · delete</span><FileCheck2 size={17} color="var(--cobalt)" /></div>
          </article>
          <article className="paper-panel watch-card">
            <span className="stamp amber">02 / decide</span>
            <h2>Read the evidence</h2>
            <p className="watch-card-summary">Compare distance, release age, maintenance signals, surface, and metadata before touching production.</p>
            <div className="card-footer"><span className="muted" style={{ fontSize: 11 }}>same function everywhere</span><Braces size={17} color="var(--cobalt)" /></div>
          </article>
          <article className="paper-panel watch-card">
            <span className="stamp rose">03 / hand off</span>
            <h2>Export or delegate</h2>
            <p className="watch-card-summary">Download a Markdown brief or call the mutating MCP tools from a coding agent with the same source of truth.</p>
            <div className="card-footer"><span className="muted" style={{ fontSize: 11 }}>JSON-RPC · SHA-384</span><GitBranch size={17} color="var(--cobalt)" /></div>
          </article>
        </div>
      </section>

      <section className="page-width section-pad" style={{ paddingTop: 18 }}>
        <div className="paper-panel" style={{ padding: 30, background: "var(--ink)", color: "var(--paper-bright)" }}>
          <div className="section-heading" style={{ alignItems: "center" }}>
            <div>
              <p className="eyebrow" style={{ color: "var(--lemon)" }}>OPEN BY DEFAULT</p>
              <h2 style={{ color: "var(--paper-bright)" }}>A decision you can<br />show your future self.</h2>
            </div>
            <div style={{ maxWidth: 390 }}>
              <p style={{ color: "#bdc8d0" }}>The app is intentionally small enough to read in one sitting and rigorous enough to keep: typed data, real routes, a deterministic engine, and an auditable write path.</p>
              <Link href="/audit" className="btn-secondary" style={{ marginTop: 18 }}>Read the ledger <ArrowRight size={15} /></Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
