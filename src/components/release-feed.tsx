import Link from "next/link";
import { ArrowUpRight, CalendarDays, Package } from "lucide-react";
import type { FeedResponse } from "@/lib/types";

export function ReleaseFeed({ feed }: { feed: FeedResponse }) {
  return (
    <div>
      <div className="marquee-note">
        <Package size={14} />
        <span><strong>{feed.source === "npm" ? "LIVE REGISTRY PULSE" : "SEALED FALLBACK PULSE"}</strong> · {feed.items.length} signals · {feed.notice}</span>
        <Link href="/api/feed" className="ml-auto inline-flex items-center gap-1 text-cobalt hover:text-vermilion">
          raw feed <ArrowUpRight size={12} />
        </Link>
      </div>
      <div className="release-grid" style={{ marginTop: 14 }}>
        {feed.items.map((item) => (
          <a
            key={item.id}
            className="release-card"
            href={item.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className={`stamp ${item.source === "fallback" ? "amber" : "green"}`}>
              {item.source === "npm" ? "live" : "offline sample"}
            </span>
            <h3>{item.packageName}</h3>
            <p>{item.summary}</p>
            <div className="inline-between" style={{ marginTop: 15, color: "var(--muted)", fontSize: 10 }}>
              <span>{item.version}</span>
              <span className="inline-flex items-center gap-1"><CalendarDays size={11} /> {new Date(item.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
