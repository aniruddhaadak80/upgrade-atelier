import { Bot, Braces, ExternalLink, FileJson, ShieldCheck } from "lucide-react";
import { McpConsole } from "@/components/mcp-console";

export const metadata = {
  title: "Agent console",
  description: "A live MCP-style JSON-RPC interface with mutating tools for Upgrade Atelier.",
};

export default function AgentPage() {
  return (
    <main className="page-width">
      <section className="page-hero">
        <p className="eyebrow">AGENT SURFACE / JSON-RPC</p>
        <h1>Let an agent<br />use the desk.</h1>
        <p>The same typed engine that powers the UI is exposed through a small MCP-style endpoint. Discovery is read-only; the create and update tools write real records and seals.</p>
        <div className="hero-actions">
          <a href="/api/mcp" className="btn-secondary" target="_blank" rel="noreferrer">Open endpoint <ExternalLink size={15} /></a>
          <a href="/api/audit/verify" className="btn-quiet" target="_blank" rel="noreferrer">verify chain</a>
        </div>
      </section>
      <section className="section-pad" style={{ paddingTop: 8 }}>
        <div className="agent-grid">
          <div>
            <div className="paper-panel detail-card">
              <div className="inline-between">
                <div>
                  <p className="eyebrow">ONE-CLICK PROOF</p>
                  <h2 style={{ marginTop: 7 }}>Initialize, discover, mutate.</h2>
                </div>
                <Bot size={23} color="var(--cobalt)" />
              </div>
              <p className="muted" style={{ margin: "15px 0 0", fontSize: 13, lineHeight: 1.55 }}>Run the full demo to initialize the server, list all six tools, create a real npm watch record, and replay its chain. The response is shown exactly as returned.</p>
              <div style={{ marginTop: 20 }}><McpConsole /></div>
            </div>
          </div>
          <div className="detail-side">
            <div className="paper-panel detail-card">
              <p className="eyebrow">CLIENT CONFIG</p>
              <h2 style={{ marginTop: 7 }}>Point your client here.</h2>
              <pre className="code-block">{`{
  "mcpServers": {
    "upgrade-atelier": {
      "url": "/api/mcp"
    }
  }
}`}</pre>
              <p className="muted" style={{ margin: "13px 0 0", fontSize: 11, lineHeight: 1.5 }}>The checked-in <code>public/mcp.json</code> file is ready to adapt with the verified deployment URL.</p>
            </div>
            <div className="paper-panel detail-card">
              <p className="eyebrow">TOOL CONTRACT</p>
              <h2 style={{ marginTop: 7 }}>Small surface, real writes.</h2>
              <div className="meta-grid" style={{ marginTop: 16 }}>
                <div className="meta-cell"><span>read</span><strong><FileJson size={13} /> list_watches</strong></div>
                <div className="meta-cell"><span>explain</span><strong><Braces size={13} /> analyze_package</strong></div>
                <div className="meta-cell"><span>mutate</span><strong><Bot size={13} /> create_watch</strong></div>
                <div className="meta-cell"><span>verify</span><strong><ShieldCheck size={13} /> verify_chain</strong></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
