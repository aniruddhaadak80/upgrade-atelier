import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizedVersion } from "./store";
import { fetchReleaseFeed } from "./npm";

describe("version validation", () => {
  it("accepts the version forms the engine understands", () => {
    expect(normalizedVersion("5.8.3")).toBe("5.8.3");
    expect(normalizedVersion("5.8")).toBe("5.8");
    expect(normalizedVersion("5")).toBe("5");
    expect(normalizedVersion("5.8.3-rc.1")).toBe("5.8.3-rc.1");
    expect(normalizedVersion("v5.8.3")).toBe("5.8.3");
    expect(normalizedVersion("  5.8.3  ")).toBe("5.8.3");
  });

  it("rejects a string that is not a version", () => {
    for (const value of ["banana", "", "latest", "1.2.3.4", "v", "..", "1..2"]) {
      expect(() => normalizedVersion(value)).toThrow();
    }
  });
});

describe("release feed", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps one entry per package when a live lookup fails", async () => {
    vi.stubGlobal("fetch", async (input: unknown) => {
      const url = String(input);
      if (url.includes("typescript")) {
        return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
      }
      if (url.includes("dist-tags")) {
        return { ok: true, status: 200, json: async () => ({ latest: "19.2.8" }) } as unknown as Response;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          name: "react",
          description: "A library for user interfaces.",
          license: "MIT",
          maintainers: [{ name: "a" }],
          _npmOperationalInternal: { tmp: "tmp/react_19.2.8_1791996435215_0.1" },
          dist: { unpackedSize: 380000 },
        }),
      } as unknown as Response;
    });

    const feed = await fetchReleaseFeed(["react", "typescript"]);

    expect(feed.items.length).toBe(2);
    expect(feed.items.map((item) => item.packageName).sort()).toEqual(["react", "typescript"]);
    expect(feed.items.find((item) => item.packageName === "typescript")?.source).toBe("fallback");
    expect(feed.items.find((item) => item.packageName === "react")?.source).toBe("npm");
    expect(feed.notice).toContain("fell back to the sealed sample set");
  });
});
