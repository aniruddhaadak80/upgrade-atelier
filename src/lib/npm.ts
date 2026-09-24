import {
  FEED_PACKAGE_NAMES,
  FALLBACK_NOTICE,
  getFallbackPackage,
  getFallbackSignals,
} from "./fallback";
import type { FeedResponse, PackageSnapshot, ReleaseSignal } from "./types";

interface NpmManifest {
  name?: string;
  description?: string;
  license?: string | { type?: string };
  repository?: string | { url?: string };
  homepage?: string;
  maintainers?: unknown[];
  dist?: { unpackedSize?: number };
  keywords?: string[];
  deprecated?: string;
  _npmOperationalInternal?: { tmp?: string };
}

function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function repositoryValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "url" in value) {
    const url = (value as { url?: unknown }).url;
    return typeof url === "string" ? url : null;
  }
  return null;
}

function licenseValue(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "type" in value) {
    const type = (value as { type?: unknown }).type;
    return typeof type === "string" ? type : null;
  }
  return null;
}

function publishedDate(manifest: NpmManifest): string {
  const timestamp = manifest._npmOperationalInternal?.tmp?.match(/_(\d{13})_/)?.[1];
  if (!timestamp) return new Date(0).toISOString();
  const date = new Date(Number(timestamp));
  return Number.isFinite(date.getTime()) ? date.toISOString() : new Date(0).toISOString();
}

function manifestUrl(name: string, version: string): string {
  return `https://registry.npmjs.org/${encodeURIComponent(name)}/${encodeURIComponent(version)}`;
}

function distTagsUrl(name: string): string {
  return `https://registry.npmjs.org/-/package/${encodeURIComponent(name)}/dist-tags`;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function normalizeManifest(name: string, version: string, manifest: NpmManifest): PackageSnapshot {
  const date = publishedDate(manifest);
  return {
    name,
    ecosystem: "npm",
    latestVersion: version,
    description: textValue(manifest.description, "No package description supplied."),
    license: licenseValue(manifest.license),
    repository: repositoryValue(manifest.repository),
    homepage: textValue(manifest.homepage) || null,
    publishedAt: date,
    lastModified: date,
    deprecated: manifest.deprecated ?? null,
    maintainerCount: Array.isArray(manifest.maintainers) ? manifest.maintainers.length : 0,
    unpackedSize: typeof manifest.dist?.unpackedSize === "number" ? manifest.dist.unpackedSize : null,
    keywords: Array.isArray(manifest.keywords) ? manifest.keywords.slice(0, 8) : [],
    source: "npm",
  };
}

export async function fetchPackageSnapshot(name: string): Promise<PackageSnapshot | null> {
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedName) return null;
  const tags = await fetchJson<Record<string, string>>(distTagsUrl(normalizedName));
  const latestVersion = tags?.latest;
  if (!latestVersion) return null;
  const manifest = await fetchJson<NpmManifest>(manifestUrl(normalizedName, latestVersion));
  if (!manifest) return null;
  return normalizeManifest(normalizedName, latestVersion, manifest);
}

function toSignal(snapshot: PackageSnapshot): ReleaseSignal {
  return {
    id: `${snapshot.name}-${snapshot.latestVersion}`,
    packageName: snapshot.name,
    version: snapshot.latestVersion,
    publishedAt: snapshot.publishedAt,
    summary: snapshot.description,
    source: snapshot.source,
    url: `https://www.npmjs.com/package/${snapshot.name}`,
  };
}

export async function fetchReleaseFeed(
  names: readonly string[] = FEED_PACKAGE_NAMES,
): Promise<FeedResponse> {
  const results = await Promise.all(names.map((name) => fetchPackageSnapshot(name)));
  const live = results
    .filter((snapshot): snapshot is PackageSnapshot => snapshot !== null)
    .map(toSignal);
  const fallback = getFallbackSignals();

  if (live.length === 0) {
    return {
      items: fallback,
      source: "fallback",
      fetchedAt: new Date().toISOString(),
      notice: FALLBACK_NOTICE,
    };
  }

  return {
    items: live,
    source: "npm",
    fetchedAt: new Date().toISOString(),
    notice: live.length < names.length ? "Some registry lookups fell back to the sealed sample set." : "Live npm registry metadata.",
  };
}

export async function resolvePackage(name: string): Promise<PackageSnapshot | null> {
  return (await fetchPackageSnapshot(name)) ?? getFallbackPackage(name);
}
