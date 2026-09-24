"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, PackagePlus } from "lucide-react";
import { motion } from "framer-motion";
import type { WatchItem } from "@/lib/types";

const samples = [
  { packageName: "next", currentVersion: "15.5.7" },
  { packageName: "react", currentVersion: "18.3.1" },
  { packageName: "typescript", currentVersion: "5.8.3" },
];

export function LandingComposer() {
  const router = useRouter();
  const [packageName, setPackageName] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveWatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ packageName, currentVersion, note }),
      });
      const body = (await response.json()) as { item?: WatchItem; error?: string };
      if (!response.ok || !body.item) throw new Error(body.error ?? "Could not save this watch item.");
      router.push(`/watch/${body.item.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this watch item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.section
      className="paper-panel composer-card"
      initial={{ opacity: 0, y: 18, rotate: 1 }}
      animate={{ opacity: 1, y: 0, rotate: 1 }}
      transition={{ duration: 0.55, delay: 0.12 }}
      aria-labelledby="composer-title"
    >
      <div className="composer-heading">
        <div>
          <p className="eyebrow">NEW DOSSIER / 00</p>
          <h2 id="composer-title">Pin a dependency.</h2>
          <p>We fetch the registry metadata, score the move, and write a sealed brief to the shared desk.</p>
        </div>
        <PackagePlus size={24} color="var(--cobalt)" />
      </div>
      <form className="form-stack" onSubmit={saveWatch}>
        <div className="form-row">
          <label className="field-label">
            npm package
            <input
              className="field-input"
              name="packageName"
              value={packageName}
              onChange={(event) => setPackageName(event.target.value)}
              placeholder="e.g. next"
              autoComplete="off"
              required
            />
          </label>
          <label className="field-label">
            installed version
            <input
              className="field-input"
              name="currentVersion"
              value={currentVersion}
              onChange={(event) => setCurrentVersion(event.target.value)}
              placeholder="e.g. 15.5.7"
              autoComplete="off"
              required
            />
          </label>
        </div>
        <label className="field-label">
          review note <span className="muted">(optional)</span>
          <textarea
            className="field-textarea"
            name="note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="What would make this upgrade safe?"
            rows={3}
          />
        </label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? <LoaderCircle size={15} className="spin" /> : <ArrowRight size={15} />}
          {saving ? "Building dossier…" : "Build upgrade dossier"}
        </button>
      </form>
      <div className="sample-row" aria-label="Example packages">
        {samples.map((sample) => (
          <button
            key={sample.packageName}
            className="sample-button"
            type="button"
            onClick={() => {
              setPackageName(sample.packageName);
              setCurrentVersion(sample.currentVersion);
              setError("");
            }}
          >
            {sample.packageName}@{sample.currentVersion}
          </button>
        ))}
      </div>
    </motion.section>
  );
}
