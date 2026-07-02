import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
const appRoot = path.resolve();
const monorepoRoot = path.resolve(appRoot, "../..");

const baseConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lxlnvkv63w.ufs.sh",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      // Strapi media — update hostname to match your Strapi instance
      {
        protocol: "https",
        hostname: process.env.STRAPI_IMAGE_HOSTNAME ?? "localhost",
      },
      // Strapi local dev (http)
      {
        protocol: "http",
        hostname: process.env.STRAPI_IMAGE_HOSTNAME ?? "localhost",
        port: "1337",
      },
    ],
  },
};

export default withNextIntl(baseConfig);
