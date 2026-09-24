import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page-width section-pad">
      <div className="paper-panel empty-state">
        <p className="eyebrow">404 / NOT IN THE LEDGER</p>
        <h2>That dossier does not exist.</h2>
        <p>It may have been deleted, or the link may have been copied before the record was created.</p>
        <Link href="/watch" className="btn-primary">Return to watch desk</Link>
      </div>
    </main>
  );
}
