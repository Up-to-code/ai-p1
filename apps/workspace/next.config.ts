import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";
import { withEve } from "eve/next";

const withNextIntl = createNextIntlPlugin();
const appRoot = path.resolve();
const monorepoRoot = path.resolve(appRoot, "../..");
const uploadSentrySourceMaps =
  process.env.SENTRY_UPLOAD_SOURCE_MAPS === "true"
  && Boolean(process.env.SENTRY_ORG)
  && Boolean(process.env.SENTRY_PROJECT)
  && Boolean(process.env.SENTRY_AUTH_TOKEN);
const buildStandaloneServer = process.env.NEXT_OUTPUT_STANDALONE === "true";
const enableBrowserProfiling = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(buildStandaloneServer ? { output: "standalone" } : {}),
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  ...(enableBrowserProfiling
    ? {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: [{ key: "Document-Policy", value: "js-profiling" }],
            },
          ];
        },
      }
    : {}),
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
const eveConfig = withEve(nextIntlConfig, {
  devServerTimeoutMs: 300_000,
});

export default uploadSentrySourceMaps ? withSentryConfig(eveConfig, {
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
}) : eveConfig;
