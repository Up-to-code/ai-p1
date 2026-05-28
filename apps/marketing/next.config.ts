import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const appRoot = path.resolve();
const monorepoRoot = path.resolve(appRoot, "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  poweredByHeader: false,
  turbopack: {
    root: monorepoRoot,
  },
};

export default withNextIntl(nextConfig);
