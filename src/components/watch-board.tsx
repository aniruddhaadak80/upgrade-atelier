"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, LoaderCircle, Plus, RotateCw } from "lucide-react";
import { WatchCard } from "@/components/watch-card";
import type { WatchItem, WatchStatus } from "@/lib/types";

type FilterValue = "all" | WatchStatus;

const filterLabels: Array<{ value: FilterValue; label: string }> = [
  { value: "all", label: "all records" },
  { value: "watching", label: "watching" },
  { value: "ready", label: "ready" },
  { value: "paused", label: "paused" },
];

export function WatchBoard({ initialItems, storage }: { initialItems: WatchItem[]; storage: string }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [packageName, setPackageName] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const filteredItems = useMemo(
    () => filter === "all" ? items : items.filter((item) => item.status === filter),
    [filter, items],
  );

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packageName, currentVersion, note }),
      });
      const body = (await response.json()) as { item?: WatchItem; error?: string };
      if (!response.ok || !body.item) throw new Error(body.error ?? "Could not create watch item.");
      setItems((current) => [body.item as WatchItem, ...current]);
      setPackageName("");
      setCurrentVersion("");
      setNote("");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create watch item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <form className="paper-panel detail-card" onSubmit={createItem} style={{ marginBottom: 18 }}>
        <div className="inline-between" style={{ marginBottom: 15 }}>
          <div>
            <p className="eyebrow">ADD TO DESK</p>
            <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>New watch record</h2>
          </div>
          <span className="stamp green">{storage} store</span>
        </div>
        <div className="form-row">
          <label className="field-label">
            package
            <input className="field-input" value={packageName} onChange={(event) => setPackageName(event.target.value)} placeholder="e.g. zod" required />
          </label>
          <label className="field-label">
            installed version
            <input className="field-input" value={currentVersion} onChange={(event) => setCurrentVersion(event.target.value)} placeholder="e.g. 3.22.4" required />
          </label>
        </div>
        <label className="field-label" style={{ marginTop: 13 }}>
          review note <span className="muted">(optional)</span>
          <input className="field-input" value={note} onChange={(event) => setNote(event.target.value)} placeholder="What should the next reviewer know?" />
        </label>
        {error ? <p className="form-error" style={{ marginTop: 12 }} role="alert">{error}</p> : null}
        <button className="btn-primary" type="submit" style={{ marginTop: 15 }} disabled={saving}>
          {saving ? <LoaderCircle size={15} className="spin" /> : <Plus size={15} />}
          {saving ? "Saving record…" : "Add watch record"}
        </button>
      </form>

      <div className="board-toolbar">
        <div className="filter-row" aria-label="Filter watch records">
          {filterLabels.map((entry) => {
            const count = entry.value === "all" ? items.length : items.filter((item) => item.status === entry.value).length;
            return (
              <button key={entry.value} className={`filter-button ${filter === entry.value ? "active" : ""}`} type="button" onClick={() => setFilter(entry.value)}>
                {entry.label} · {count}
              </button>
            );
          })}
        </div>
        <button className="btn-quiet" type="button" onClick={() => router.refresh()}>
          <RotateCw size={14} /> refresh desk
        </button>
      </div>

      {filteredItems.length > 0 ? (
        <div className="watch-grid">
          {filteredItems.map((item) => <WatchCard item={item} key={item.id} />)}
        </div>
      ) : (
        <div className="paper-panel empty-state">
          <Filter size={23} color="var(--cobalt)" />
          <h2>No records in this lane.</h2>
          <p>Choose another filter or add a package above. The first save creates a real audit event.</p>
          <button className="btn-secondary" type="button" onClick={() => setFilter("all")}>Show all records</button>
        </div>
      )}
    </>
  );
}
