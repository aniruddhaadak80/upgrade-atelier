import type { PackageSnapshot, ReleaseSignal } from "./types";

export const FEED_PACKAGE_NAMES = [
  "next",
  "react",
  "typescript",
  "lucide-react",
  "framer-motion",
] as const;

export const FALLBACK_NOTICE =
  "Offline sample data is shown until the public registry responds.";

const fallbackPackages: Record<string, PackageSnapshot> = {
  next: {
    name: "next",
    ecosystem: "npm",
    latestVersion: "16.3.6",
    description: "The React framework for the web",
    license: "MIT",
    repository: "https://github.com/vercel/next.js",
    homepage: "https://nextjs.org",
    publishedAt: "2026-09-20T14:00:00.000Z",
    lastModified: "2026-09-20T14:00:00.000Z",
    deprecated: null,
    maintainerCount: 8,
    unpackedSize: 28400000,
    keywords: ["react", "framework", "web"],
    source: "fallback",
  },
  react: {
    name: "react",
    ecosystem: "npm",
    latestVersion: "19.2.8",
    description: "The library for web and native user interfaces",
    license: "MIT",
    repository: "https://github.com/facebook/react",
    homepage: "https://react.dev",
    publishedAt: "2026-09-16T10:15:00.000Z",
    lastModified: "2026-09-16T10:15:00.000Z",
    deprecated: null,
    maintainerCount: 5,
    unpackedSize: 380000,
    keywords: ["react", "ui", "components"],
    source: "fallback",
  },
  typescript: {
    name: "typescript",
    ecosystem: "npm",
    latestVersion: "5.9.3",
    description: "TypeScript is a language for application scale JavaScript",
    license: "Apache-2.0",
    repository: "https://github.com/microsoft/TypeScript",
    homepage: "https://www.typescriptlang.org",
    publishedAt: "2026-08-29T08:30:00.000Z",
    lastModified: "2026-08-29T08:30:00.000Z",
    deprecated: null,
    maintainerCount: 4,
    unpackedSize: 21000000,
    keywords: ["typescript", "compiler", "types"],
    source: "fallback",
  },
  "lucide-react": {
    name: "lucide-react",
    ecosystem: "npm",
    latestVersion: "0.468.0",
    description: "Beautiful lucide icons for React applications",
    license: "ISC",
    repository: "https://github.com/lucide-icons/lucide",
    homepage: "https://lucide.dev",
    publishedAt: "2025-06-20T12:00:00.000Z",
    lastModified: "2025-06-20T12:00:00.000Z",
    deprecated: null,
    maintainerCount: 3,
    unpackedSize: 2400000,
    keywords: ["icons", "react", "svg"],
    source: "fallback",
  },
  "framer-motion": {
    name: "framer-motion",
    ecosystem: "npm",
    latestVersion: "12.43.0",
    description: "A production-ready motion library for React",
    license: "MIT",
    repository: "https://github.com/motiondivision/motion",
    homepage: "https://motion.dev",
    publishedAt: "2026-08-11T09:45:00.000Z",
    lastModified: "2026-08-11T09:45:00.000Z",
    deprecated: null,
    maintainerCount: 6,
    unpackedSize: 3800000,
    keywords: ["animation", "react", "motion"],
    source: "fallback",
  },
};

const fallbackSignals: ReleaseSignal[] = [
  {
    id: "fallback-next-16-3-6",
    packageName: "next",
    version: "16.3.6",
    publishedAt: "2026-09-20T14:00:00.000Z",
    summary: "The React framework for the web",
    source: "fallback",
    url: "https://www.npmjs.com/package/next",
  },
  {
    id: "fallback-react-19-2-8",
    packageName: "react",
    version: "19.2.8",
    publishedAt: "2026-09-16T10:15:00.000Z",
    summary: "The library for web and native user interfaces",
    source: "fallback",
    url: "https://www.npmjs.com/package/react",
  },
  {
    id: "fallback-typescript-5-9-3",
    packageName: "typescript",
    version: "5.9.3",
    publishedAt: "2026-08-29T08:30:00.000Z",
    summary: "TypeScript is a language for application scale JavaScript",
    source: "fallback",
    url: "https://www.npmjs.com/package/typescript",
  },
  {
    id: "fallback-lucide-0-468-0",
    packageName: "lucide-react",
    version: "0.468.0",
    publishedAt: "2025-06-20T12:00:00.000Z",
    summary: "Beautiful lucide icons for React applications",
    source: "fallback",
    url: "https://www.npmjs.com/package/lucide-react",
  },
  {
    id: "fallback-motion-12-43-0",
    packageName: "framer-motion",
    version: "12.43.0",
    publishedAt: "2026-08-11T09:45:00.000Z",
    summary: "A production-ready motion library for React",
    source: "fallback",
    url: "https://www.npmjs.com/package/framer-motion",
  },
];

export function getFallbackPackage(name: string): PackageSnapshot | null {
  const snapshot = fallbackPackages[name.trim().toLowerCase()];
  return snapshot ? { ...snapshot, keywords: [...snapshot.keywords] } : null;
}

export function getFallbackSignals(): ReleaseSignal[] {
  return fallbackSignals.map((signal) => ({ ...signal }));
}
