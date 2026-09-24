export const REPO_URL = "https://github.com/aniruddhaadak80/upgrade-atelier";
export const LIVE_URL = "https://upgrade-atelier.vercel.app";
export const PROJECT_TOPICS = [
  "nextjs",
  "npm",
  "dependency-management",
  "mcp",
  "software-supply-chain",
  "developer-tools",
  "sha384",
  "vercel",
];

function jsonResponse(description: string) {
  return {
    description,
    content: { "application/json": { schema: { type: "object" } } },
  };
}

function jsonBody(schema: Record<string, unknown>) {
  return {
    required: true,
    content: { "application/json": { schema } },
  };
}

export function getOpenApiDocument(origin: string): Record<string, unknown> {
  const base = origin.replace(/\/$/, "");
  return {
    openapi: "3.1.0",
    info: {
      title: "Upgrade Atelier API",
      version: "1.1.0",
      description: "Explainable npm upgrade dossiers with persisted watch records, live release metadata, MCP tools, and replayable audit seals.",
      license: { name: "MIT", url: `${REPO_URL}/blob/main/LICENSE` },
      externalDocs: { description: "Repository and project passport", url: REPO_URL },
    },
    servers: [{ url: base, description: "Current deployment" }],
    tags: [
      { name: "dossiers", description: "Persisted upgrade records" },
      { name: "evidence", description: "Registry and analysis evidence" },
      { name: "integrity", description: "Audit chain verification" },
      { name: "agent", description: "MCP-style JSON-RPC tools" },
    ],
    paths: {
      "/api/health": {
        get: { tags: ["integrity"], summary: "Check storage and audit health", responses: { "200": jsonResponse("Healthy service state") } },
      },
      "/api/project": {
        get: { tags: ["evidence"], summary: "Read public GitHub project metadata", responses: { "200": jsonResponse("Repository, topics, and live links") } },
      },
      "/api/feed": {
        get: { tags: ["evidence"], summary: "Read normalized npm release signals", responses: { "200": jsonResponse("Live or explicitly labeled fallback feed") } },
      },
      "/api/analyze": {
        post: {
          tags: ["evidence"],
          summary: "Analyze an npm upgrade without saving",
          requestBody: jsonBody({ type: "object", required: ["packageName", "currentVersion"], properties: { packageName: { type: "string" }, currentVersion: { type: "string" } } }),
          responses: { "200": jsonResponse("Score, factors, and analysis seal"), "404": jsonResponse("Package not found") },
        },
      },
      "/api/engine": {
        get: { tags: ["evidence"], summary: "Read the versioned scoring policy", responses: { "200": jsonResponse("Weights, bands, cooldown, and evidence contract") } },
      },
      "/api/items": {
        get: { tags: ["dossiers"], summary: "List persisted watch records", responses: { "200": jsonResponse("Current dossier collection") } },
        post: {
          tags: ["dossiers"],
          summary: "Create a persisted watch record",
          requestBody: jsonBody({ type: "object", required: ["packageName", "currentVersion"], properties: { packageName: { type: "string" }, currentVersion: { type: "string" }, note: { type: "string" }, status: { type: "string", enum: ["watching", "ready", "paused"] } } }),
          responses: { "201": jsonResponse("Created dossier"), "400": jsonResponse("Invalid input") },
        },
      },
      "/api/items/{id}": {
        get: { tags: ["dossiers"], summary: "Read one persisted dossier", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("Dossier"), "404": jsonResponse("Not found") } },
        patch: {
          tags: ["dossiers"],
          summary: "Update, refresh, or annotate a dossier",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: jsonBody({ type: "object", properties: { currentVersion: { type: "string" }, note: { type: "string" }, status: { type: "string", enum: ["watching", "ready", "paused"] }, refresh: { type: "boolean" } } }),
          responses: { "200": jsonResponse("Updated dossier") },
        },
        delete: { tags: ["dossiers"], summary: "Delete a dossier and preserve its audit event", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": jsonResponse("Deleted dossier identifier") } },
      },
      "/api/audit/verify": {
        get: { tags: ["integrity"], summary: "Replay the SHA-384 mutation chain", responses: { "200": jsonResponse("Chain verification result") } },
      },
      "/api/export": {
        get: { tags: ["dossiers"], summary: "Export a Markdown or JSON dossier brief", parameters: [{ name: "format", in: "query", schema: { type: "string", enum: ["markdown", "json"] } }], responses: { "200": jsonResponse("Export document") } },
      },
      "/api/mcp": {
        get: { tags: ["agent"], summary: "Discover the MCP transport, tools, resources, and OpenAPI document", responses: { "200": jsonResponse("MCP discovery document") } },
        post: {
          tags: ["agent"],
          summary: "Execute MCP-style JSON-RPC methods",
          requestBody: jsonBody({ type: "object", required: ["jsonrpc", "method"], properties: { jsonrpc: { const: "2.0" }, id: {}, method: { type: "string", enum: ["initialize", "tools/list", "tools/call", "resources/list", "resources/read"] }, params: { type: "object" } } }),
          responses: { "200": jsonResponse("JSON-RPC result"), "400": jsonResponse("JSON-RPC error") },
        },
      },
    },
    components: {
      schemas: {
        WatchItem: { type: "object", required: ["id", "packageName", "analysis", "seal"], properties: { id: { type: "string" }, packageName: { type: "string" }, analysis: { $ref: "#/components/schemas/UpgradeAnalysis" }, seal: { type: "string", description: "SHA-384 record seal" } } },
        UpgradeAnalysis: { type: "object", required: ["score", "band", "factors", "migrationSteps"], properties: { score: { type: "integer", minimum: 0, maximum: 100 }, band: { type: "string", enum: ["low", "watch", "review", "hold"] }, factors: { type: "array", items: { type: "object" } }, migrationSteps: { type: "array", items: { type: "string" } } } },
        ProjectMetadata: { type: "object", required: ["repoUrl", "liveUrl", "topics"], properties: { repoUrl: { type: "string", format: "uri" }, liveUrl: { type: "string", format: "uri" }, topics: { type: "array", items: { type: "string" } }, stars: { type: "integer" }, forks: { type: "integer" }, openIssues: { type: "integer" } } },
      },
    },
    externalDocs: { description: "Upgrade Atelier GitHub repository", url: REPO_URL },
  };
}
