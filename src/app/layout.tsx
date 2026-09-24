import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Upgrade Atelier — Know what to upgrade before the upgrade knows you",
    template: "%s · Upgrade Atelier",
  },
  description: "A keyless, explainable upgrade dossier for npm dependencies, with live registry signals, migration notes, and replayable audit seals.",
  keywords: ["npm", "dependency upgrades", "software supply chain", "release risk", "developer tools", "MCP"],
  authors: [{ name: "Upgrade Atelier" }],
  creator: "Upgrade Atelier",
  openGraph: {
    type: "website",
    title: "Upgrade Atelier",
    description: "Turn a package and an installed version into a decision-ready upgrade dossier.",
    siteName: "Upgrade Atelier",
  },
  twitter: {
    card: "summary_large_image",
    title: "Upgrade Atelier",
    description: "A decision-ready upgrade dossier for npm dependencies.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="site-noise" aria-hidden="true" />
        <SiteNav />
        <div className="site-main">{children}</div>
        <footer className="site-footer">
          <div className="page-width footer-inner">
            <div>
              <p className="eyebrow">UPGRADE ATELIER / FIELD NOTES</p>
              <p className="footer-title">Make the next upgrade a decision, not a surprise.</p>
            </div>
            <div className="footer-links">
              <a href="/api/health">Health</a>
              <a href="/api/feed">Live feed</a>
              <a href="/api/mcp">MCP endpoint</a>
              <a href="/api/openapi.json">OpenAPI</a>
              <a href="https://github.com/aniruddhaadak80/upgrade-atelier">GitHub repo</a>
              <a href="https://upgrade-atelier.vercel.app">Live app</a>
              <a href="/audit">Audit ledger</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
