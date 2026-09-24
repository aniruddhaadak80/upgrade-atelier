import { makeSeal } from "./canonical";
import type { FactorTone, PackageSnapshot, RiskBand, RiskFactor, UpgradeAnalysis } from "./types";

interface VersionParts {
  major: number;
  minor: number;
  patch: number;
  prerelease: string;
}

function parseVersion(value: string): VersionParts {
  const match = value.trim().replace(/^v/, "").match(/^(\d+)(?:\.(\d+))?(?:\.(\d+))?(?:-([0-9A-Za-z.-]+))?/);
  return {
    major: Number(match?.[1] ?? 0),
    minor: Number(match?.[2] ?? 0),
    patch: Number(match?.[3] ?? 0),
    prerelease: match?.[4] ?? "",
  };
}

function daysSince(value: string, now: Date): number {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return 999;
  return Math.max(0, Math.floor((now.getTime() - timestamp) / 86_400_000));
}

function toneForImpact(impact: number): FactorTone {
  if (impact >= 70) return "risk";
  if (impact >= 40) return "watch";
  if (impact >= 20) return "calm";
  return "good";
}

function factor(
  id: string,
  label: string,
  value: string,
  weight: number,
  impact: number,
  detail: string,
): RiskFactor {
  return { id, label, value, weight, impact, detail, tone: toneForImpact(impact) };
}

function bandForScore(score: number): RiskBand {
  if (score <= 29) return "low";
  if (score <= 54) return "watch";
  if (score <= 79) return "review";
  return "hold";
}

function bandCopy(band: RiskBand, packageName: string, version: string): { headline: string; summary: string } {
  if (band === "low") {
    return {
      headline: "Green light for a small, reversible update",
      summary: `${packageName} ${version} is a contained move. Read the release note, pin the version, and ship behind your normal test gate.`,
    };
  }
  if (band === "watch") {
    return {
      headline: "Watch the release, then ship in a canary",
      summary: `${packageName} ${version} is worth trying, but the release is recent enough to earn a short observation window before production.`,
    };
  }
  if (band === "review") {
    return {
      headline: "Upgrade needs a deliberate migration pass",
      summary: `${packageName} ${version} crosses a meaningful change boundary. Compare APIs, run focused tests, and make the rollback path explicit.`,
    };
  }
  return {
    headline: "Pause and inspect provenance before changing",
    summary: `${packageName} ${version} carries multiple risk signals. Hold the upgrade, verify the publisher, and capture a clean-room test result first.`,
  };
}

function migrationSteps(band: RiskBand, majorDelta: number): string[] {
  const steps = [
    "Read the upstream release note and confirm the intended version exists in npm.",
    "Pin the candidate in a branch and run the focused test suite before the full build.",
  ];
  if (majorDelta > 0) {
    steps.push("Search the codebase for removed or renamed APIs before merging.");
    steps.push("Deploy behind a canary or feature flag with a documented rollback command.");
  } else {
    steps.push("Run the application smoke path and watch runtime errors for one release window.");
  }
  if (band === "hold") {
    steps.unshift("Verify the maintainer identity and inspect the package provenance before installing.");
  }
  return steps;
}

export function analyzeUpgrade(input: {
  packageName: string;
  currentVersion: string;
  snapshot: PackageSnapshot;
  now?: Date;
}): UpgradeAnalysis {
  const now = input.now ?? new Date();
  const current = parseVersion(input.currentVersion);
  const latest = parseVersion(input.snapshot.latestVersion);
  const majorDelta = Math.abs(latest.major - current.major);
  const minorDelta = Math.abs(latest.minor - current.minor);
  const patchDelta = Math.abs(latest.patch - current.patch);
  const releaseAge = daysSince(input.snapshot.publishedAt, now);
  const hasMajorChange = majorDelta > 0;

  const semverImpact = hasMajorChange ? 100 : minorDelta > 0 ? 55 : patchDelta > 0 ? 18 : 0;
  const cooldownImpact = releaseAge <= 1 ? 95 : releaseAge <= 3 ? 75 : releaseAge <= 7 ? 45 : releaseAge <= 14 ? 20 : 5;
  const maintenanceImpact = input.snapshot.deprecated
    ? 100
    : input.snapshot.maintainerCount <= 1
      ? 60
      : !input.snapshot.repository
        ? 35
        : 10;
  const surfaceImpact = !input.snapshot.unpackedSize
    ? 12
    : input.snapshot.unpackedSize > 10_000_000
      ? 82
      : input.snapshot.unpackedSize > 2_000_000
        ? 48
        : 18;
  const metadataImpact = !input.snapshot.description
    ? 70
    : !input.snapshot.license
      ? 35
      : 8;

  const factors = [
    factor(
      "semver-distance",
      "Version distance",
      hasMajorChange ? "major boundary" : minorDelta > 0 ? "minor boundary" : patchDelta > 0 ? "patch boundary" : "already current",
      40,
      semverImpact,
      hasMajorChange ? "A major release can change public contracts and runtime assumptions." : "The distance between the installed and latest versions is measured directly.",
    ),
    factor(
      "release-cooldown",
      "Release cooldown",
      releaseAge <= 1 ? "published today" : `${releaseAge} days old`,
      20,
      cooldownImpact,
      "Recent releases receive a short observation window before a production recommendation.",
    ),
    factor(
      "maintenance-signal",
      "Maintenance signal",
      input.snapshot.deprecated ? "deprecated" : `${input.snapshot.maintainerCount} maintainers`,
      20,
      maintenanceImpact,
      input.snapshot.deprecated ? input.snapshot.deprecated : "Maintainer and repository signals help identify provenance risk.",
    ),
    factor(
      "package-surface",
      "Package surface",
      input.snapshot.unpackedSize ? `${(input.snapshot.unpackedSize / 1_000_000).toFixed(1)} MB unpacked` : "size unavailable",
      10,
      surfaceImpact,
      "A larger package has more install-time and transitive review surface.",
    ),
    factor(
      "metadata-quality",
      "Metadata quality",
      input.snapshot.license ? `${input.snapshot.license} license` : "license missing",
      10,
      metadataImpact,
      "Complete license and description metadata makes a release easier to review.",
    ),
  ];

  const score = Math.min(
    100,
    Math.round(factors.reduce((total, currentFactor) => total + currentFactor.weight * currentFactor.impact / 100, 0)),
  );
  const band = bandForScore(score);
  const copy = bandCopy(band, input.packageName, input.snapshot.latestVersion);

  return {
    packageName: input.packageName,
    currentVersion: input.currentVersion,
    latestVersion: input.snapshot.latestVersion,
    score,
    band,
    headline: copy.headline,
    summary: copy.summary,
    confidence: input.snapshot.source === "npm" ? "high" : "low",
    factors,
    migrationSteps: migrationSteps(band, majorDelta),
    generatedAt: now.toISOString(),
  };
}

export function analysisSeal(
  analysis: UpgradeAnalysis,
  snapshot: PackageSnapshot,
): string {
  return makeSeal(
    {
      packageName: analysis.packageName,
      currentVersion: analysis.currentVersion,
      latestVersion: analysis.latestVersion,
      score: analysis.score,
      band: analysis.band,
      factors: analysis.factors,
      snapshot,
    },
    "analysis",
  );
}
