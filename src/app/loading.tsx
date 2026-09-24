export default function Loading() {
  return (
    <main className="page-width section-pad">
      <div className="paper-panel loading-card">
        <div className="skeleton tiny" />
        <div className="skeleton" />
        <div className="skeleton short" />
        <div className="skeleton" />
        <div className="skeleton short" />
      </div>
    </main>
  );
}
