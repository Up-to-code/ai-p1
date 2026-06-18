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
  images: {
    remotePatterns: [
      // UploadThing hosted founder images
      {
        protocol: "https",
        hostname: "lxlnvkv63w.ufs.sh",
        pathname: "/f/**",
      },
      // UploadThing general CDN pattern
      {
        protocol: "https",
        hostname: "*.ufs.sh",
        pathname: "/f/**",
      },
      // Vercel blob storage (hero video thumbnails etc.)
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
