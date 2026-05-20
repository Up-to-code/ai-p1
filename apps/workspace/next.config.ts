import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const appRoot = path.resolve();
const monorepoRoot = path.resolve(appRoot, "../..");
const uploadSentrySourceMaps =
  process.env.SENTRY_UPLOAD_SOURCE_MAPS === "true"
  && Boolean(process.env.SENTRY_ORG)
  && Boolean(process.env.SENTRY_PROJECT)
  && Boolean(process.env.SENTRY_AUTH_TOKEN);
const buildStandaloneServer = process.env.NEXT_OUTPUT_STANDALONE === "true";

const nextConfig: NextConfig = {
  ...(buildStandaloneServer ? { output: "standalone" } : {}),
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [{ key: "Document-Policy", value: "js-profiling" }],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lxlnvkv63w.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
    ],
  },
};

const nextIntlConfig = withNextIntl(nextConfig);

export default uploadSentrySourceMaps ? withSentryConfig(nextIntlConfig, {
  org: uploadSentrySourceMaps ? process.env.SENTRY_ORG : undefined,
  project: uploadSentrySourceMaps ? process.env.SENTRY_PROJECT : undefined,
  authToken: uploadSentrySourceMaps ? process.env.SENTRY_AUTH_TOKEN : undefined,
  widenClientFileUpload: true,
  release: {
    create: uploadSentrySourceMaps,
  },
  sourcemaps: {
    disable: !uploadSentrySourceMaps,
  },
  tunnelRoute: "/monitoring",
  telemetry: false,
  silent: !process.env.CI,
}) : nextIntlConfig;
