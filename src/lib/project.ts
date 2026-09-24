import { LIVE_URL, PROJECT_TOPICS, REPO_URL } from "./openapi";

export interface ProjectMetadata {
  name: string;
  description: string;
  repoUrl: string;
  liveUrl: string;
  topics: string[];
  stars: number;
  forks: number;
  openIssues: number;
  defaultBranch: string;
  lastPush: string | null;
  source: "github" | "fallback";
  notice: string;
}

const fallback: ProjectMetadata = {
  name: "upgrade-atelier",
  description: "A keyless, explainable upgrade dossier for npm dependencies with live release signals, MCP tools, and replayable audit seals.",
  repoUrl: REPO_URL,
  liveUrl: LIVE_URL,
  topics: PROJECT_TOPICS,
  stars: 0,
  forks: 0,
  openIssues: 0,
  defaultBranch: "main",
  lastPush: null,
  source: "fallback",
  notice: "Project passport is using the checked-in repository contract while GitHub is unavailable.",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function textValue(value: unknown, fallbackText: string): string {
  return typeof value === "string" && value.trim() ? value : fallbackText;
}

export async function fetchProjectMetadata(): Promise<ProjectMetadata> {
  try {
    const response = await fetch("https://api.github.com/repos/aniruddhaadak80/upgrade-atelier", {
      headers: { accept: "application/vnd.github+json", "user-agent": "upgrade-atelier-project-passport" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) return fallback;
    const body = await response.json();
    if (!isRecord(body)) return fallback;
    const topics = Array.isArray(body.topics)
      ? body.topics.filter((topic): topic is string => typeof topic === "string")
      : PROJECT_TOPICS;
    return {
      name: textValue(body.name, fallback.name),
      description: textValue(body.description, fallback.description),
      repoUrl: textValue(body.html_url, REPO_URL),
      liveUrl: LIVE_URL,
      topics: topics.length > 0 ? topics : PROJECT_TOPICS,
      stars: numberValue(body.stargazers_count),
      forks: numberValue(body.forks_count),
      openIssues: numberValue(body.open_issues_count),
      defaultBranch: textValue(body.default_branch, "main"),
      lastPush: typeof body.pushed_at === "string" ? body.pushed_at : null,
      source: "github",
      notice: "Live GitHub repository metadata.",
    };
  } catch {
    return fallback;
  }
}
