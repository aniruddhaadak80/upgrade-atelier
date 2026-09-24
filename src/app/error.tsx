"use client";

import { useEffect } from "react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void reset;
  }, [reset]);

  return (
    <main className="page-width section-pad">
      <div className="paper-panel empty-state">
        <p className="eyebrow">SOMETHING WENT SIDEWAYS</p>
        <h2>The desk could not load this page.</h2>
        <p>Try the request again. If the issue persists, check the health endpoint for storage status.</p>
        <button className="btn-primary" type="button" onClick={() => reset()}>Try again</button>
      </div>
    </main>
  );
}
