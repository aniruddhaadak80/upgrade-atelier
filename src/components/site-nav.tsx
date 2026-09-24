"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ClipboardCheck, GitBranch, PackageOpen, ScrollText, Terminal } from "lucide-react";

const links = [
  { href: "/watch", label: "Watch desk", icon: ClipboardCheck },
  { href: "/audit", label: "Audit ledger", icon: ScrollText },
  { href: "/agent", label: "Agent console", icon: Terminal },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="site-nav">
      <div className="page-width nav-inner">
        <Link href="/" className="brand-lockup" aria-label="Upgrade Atelier home">
          <span className="brand-mark"><PackageOpen size={18} strokeWidth={2.5} /></span>
          <span>
            <span>Upgrade Atelier</span>
            <span className="brand-subtitle">dependency decisions / field kit</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link ${pathname.startsWith(href) ? "active" : ""}`}>
              <Icon size={14} />
              <span>{label}</span>
            </Link>
          ))}
          <a href="https://github.com/aniruddhaadak80/upgrade-atelier" className="nav-link" target="_blank" rel="noreferrer">
            <GitBranch size={14} />
            <span>GitHub repo</span>
          </a>
          <Link href="/api/health" className="nav-cta">
            API status <ArrowUpRight size={14} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
