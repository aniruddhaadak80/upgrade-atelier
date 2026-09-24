export type FeedSource = "npm" | "fallback";
export type WatchStatus = "watching" | "ready" | "paused";
export type RiskBand = "low" | "watch" | "review" | "hold";
export type FactorTone = "good" | "calm" | "watch" | "risk";

export interface PackageSnapshot {
  name: string;
  ecosystem: "npm";
  latestVersion: string;
  description: string;
  license: string | null;
  repository: string | null;
  homepage: string | null;
  publishedAt: string;
  lastModified: string;
  deprecated: string | null;
  maintainerCount: number;
  unpackedSize: number | null;
  keywords: string[];
  source: FeedSource;
}

export interface RiskFactor {
  id: string;
  label: string;
  value: string;
  weight: number;
  impact: number;
  detail: string;
  tone: FactorTone;
}

export interface UpgradeAnalysis {
  packageName: string;
  currentVersion: string;
  latestVersion: string;
  score: number;
  band: RiskBand;
  headline: string;
  summary: string;
  confidence: "high" | "medium" | "low";
  factors: RiskFactor[];
  migrationSteps: string[];
  generatedAt: string;
}

export interface WatchItem {
  id: string;
  packageName: string;
  ecosystem: "npm";
  currentVersion: string;
  latestVersion: string;
  status: WatchStatus;
  note: string;
  snapshot: PackageSnapshot;
  analysis: UpgradeAnalysis;
  source: FeedSource;
  createdAt: string;
  updatedAt: string;
  previousSeal: string;
  seal: string;
}

export type AuditAction = "seed" | "create" | "update" | "delete";

export interface AuditEvent {
  sequence?: number;
  id: string;
  entityId: string;
  action: AuditAction;
  payload: Record<string, unknown>;
  previousSeal: string;
  seal: string;
  createdAt: string;
}

export interface ReleaseSignal {
  id: string;
  packageName: string;
  version: string;
  publishedAt: string;
  summary: string;
  source: FeedSource;
  url: string;
}

export interface FeedResponse {
  items: ReleaseSignal[];
  source: FeedSource;
  fetchedAt: string;
  notice: string;
}

export interface VerifyResult {
  valid: boolean;
  checked: number;
  headSeal: string;
  brokenAt: string | null;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
