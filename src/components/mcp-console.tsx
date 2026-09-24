"use client";

import { useState } from "react";
import { CheckCircle2, Copy, LoaderCircle, Play, Terminal } from "lucide-react";

async function postRpc(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await fetch("/api/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", ...body }),
  });
  const result = (await response.json()) as Record<string, unknown>;
  if (!response.ok) throw new Error("MCP request failed.");
  return result;
}

export function McpConsole() {
  const [log, setLog] = useState("Ready. Initialize the server, or run the full demo to create a real watch record.");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  function append(label: string, value: unknown) {
    setLog((current) => `${current}\n\n<span class="prompt">› ${label}</span>\n${JSON.stringify(value, null, 2)}`);
  }

  async function call(label: string, body: Record<string, unknown>) {
    const value = await postRpc({ ...body, id: Date.now() });
    append(label, value);
    return value;
  }

  async function run(action: "initialize" | "list" | "create" | "demo") {
    setBusy(true);
    try {
      if (action === "initialize") await call("initialize", { method: "initialize", params: { protocolVersion: "2024-11-05" } });
      if (action === "list") await call("tools/list", { method: "tools/list", params: {} });
      if (action === "create") {
        await call("tools/call create_watch", { method: "tools/call", params: { name: "create_watch", arguments: { packageName: "zod", currentVersion: "3.22.4", note: "Created from the live MCP console." } } });
      }
      if (action === "demo") {
        await call("initialize", { method: "initialize", params: { protocolVersion: "2024-11-05" } });
        await call("tools/list", { method: "tools/list", params: {} });
        await call("tools/call create_watch", { method: "tools/call", params: { name: "create_watch", arguments: { packageName: "zod", currentVersion: "3.22.4", note: "Created by the full MCP demo." } } });
        await call("tools/call verify_chain", { method: "tools/call", params: { name: "verify_chain", arguments: {} } });
      }
    } catch (error) {
      append("error", { message: error instanceof Error ? error.message : "MCP request failed." });
    } finally {
      setBusy(false);
    }
  }

  async function copyConfig() {
    const config = JSON.stringify({ mcpServers: { "upgrade-atelier": { url: "/api/mcp" } } }, null, 2);
    await navigator.clipboard.writeText(config);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="console-window">
      <div className="console-bar">
        <span className="inline-flex items-center gap-2"><Terminal size={13} /> upgrade-atelier / mcp</span>
        <span className="console-dots"><i /><i /><i /></span>
      </div>
      <div className="console-body" dangerouslySetInnerHTML={{ __html: log.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, '<span class="accent">"$1"</span>') }} />
      <div className="console-actions">
        <button type="button" onClick={() => call("initialize", { method: "initialize", params: { protocolVersion: "2024-11-05" } })} disabled={busy}>initialize</button>
        <button type="button" onClick={() => call("tools/list", { method: "tools/list", params: {} })} disabled={busy}>tools/list</button>
        <button type="button" onClick={() => call("tools/call create_watch", { method: "tools/call", params: { name: "create_watch", arguments: { packageName: "zod", currentVersion: "3.22.4", note: "Created from the live MCP console." } } })} disabled={busy}>mutate: create watch</button>
        <button type="button" onClick={() => run("demo")} disabled={busy}>{busy ? <LoaderCircle size={12} className="spin" /> : <Play size={12} />} run full demo</button>
        <button type="button" onClick={copyConfig}>{copied ? <CheckCircle2 size={12} /> : <Copy size={12} />} {copied ? "copied" : "copy mcp.json"}</button>
      </div>
    </div>
  );
}
