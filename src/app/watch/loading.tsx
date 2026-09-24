export default function WatchLoading() {
  return (
    <main className="page-width section-pad">
      <div className="skeleton tiny" />
      <div className="skeleton" style={{ width: "55%", height: 58 }} />
      <div className="skeleton short" />
      <div className="watch-grid" style={{ marginTop: 28 }}>
        <div className="paper-panel loading-card"><div className="skeleton" /><div className="skeleton short" /><div className="skeleton" /></div>
        <div className="paper-panel loading-card"><div className="skeleton" /><div className="skeleton short" /><div className="skeleton" /></div>
        <div className="paper-panel loading-card"><div className="skeleton" /><div className="skeleton short" /><div className="skeleton" /></div>
      </div>
    </main>
  );
}
