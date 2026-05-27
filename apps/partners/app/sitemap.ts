import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("partners");

const marketingPaths = ["/", "/pricing", "/security", "/support", "/policies"] as const;
const docsSlugs = [
  "business-flow",
  "quickstart",
  "developer-mode",
  "ai-agent-implementation",
  "sdk-installation",
  "authorization-lifecycle",
  "oauth-flow",
  "register-an-app",
  "api-usage",
  "pdf-generator-example",
  "troubleshooting",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const docsPaths = ["/docs", ...docsSlugs.map((slug) => `/docs/${slug}`)];

  return [...marketingPaths, ...docsPaths].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path.startsWith("/docs") ? "monthly" : "weekly",
    priority: path === "/" ? 1 : path.startsWith("/docs") ? 0.7 : 0.8,
  }));
}
