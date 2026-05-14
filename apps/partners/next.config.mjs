import path from "node:path";
import { fileURLToPath } from "node:url";
import { createMDX } from "fumadocs-mdx/next";
import { ensurePartnerDatabaseEnv, loadLocalEnv } from "./scripts/load-local-env.mjs";

loadLocalEnv();
ensurePartnerDatabaseEnv();

const dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(dirname, "../..");

/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    externalDir: true,
  },
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
};

const withMDX = createMDX();

export default withMDX(nextConfig);
