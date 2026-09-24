import { ClipboardCheck } from "lucide-react";
import { WatchBoard } from "@/components/watch-board";
import { getStorageKind, listWatchItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Watch desk",
  description: "Create, filter, and maintain persisted npm upgrade watch records.",
};

export default async function WatchPage() {
  const items = await listWatchItems();
  return (
    <main className="page-width">
      <section className="page-hero">
        <p className="eyebrow">WORKBENCH / PERSISTED</p>
        <h1>The watch desk.</h1>
        <p>Keep the installed version, the latest release, and the reason you are waiting in one place. Filters are local; every edit is a durable record.</p>
      </section>
      <section className="section-pad" style={{ paddingTop: 10 }}>
        <div className="inline-between" style={{ marginBottom: 22 }}>
          <span className="inline-flex items-center gap-2 muted" style={{ fontSize: 12 }}><ClipboardCheck size={15} /> {items.length} records · {getStorageKind()} persistence</span>
          <span className="muted" style={{ fontFamily: "Cascadia Code", fontSize: 10 }}>CRUD / API / UI</span>
        </div>
        <WatchBoard initialItems={items} storage={getStorageKind()} />
      </section>
    </main>
  );
}
