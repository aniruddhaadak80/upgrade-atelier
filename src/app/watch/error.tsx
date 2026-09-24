"use client";

export default function WatchError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="page-width section-pad">
      <div className="paper-panel empty-state">
        <p className="eyebrow">RECORD UNAVAILABLE</p>
        <h2>The watch desk hit a snag.</h2>
        <p>The API or persistent store did not answer this request. Retry, then inspect the health endpoint if needed.</p>
        <button className="btn-primary" type="button" onClick={() => reset()}>Retry request</button>
      </div>
    </main>
  );
}
