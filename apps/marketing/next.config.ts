import type { NextConfig } from "next";
import path from "node:path";
import createNextIntlPlugin from "next-intl/plugin";
import { withPayload } from "@payloadcms/next/withPayload";

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
    ],
  },
};

const payloadConfig = withPayload(baseConfig, {
  devBundleServerPackages: true,
});

export default withNextIntl(payloadConfig);
