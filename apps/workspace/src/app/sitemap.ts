import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("workspace");
const locales = ["en", "ar"] as const;
const docsTopics = [
  "why-public",
  "endpoint",
  "create-link",
  "permissions",
  "examples",
  "security",
  "troubleshooting",
  "references",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const localizedPublicPaths = locales.flatMap((locale) =>
    docsTopics.map((topic) => `/${locale}/mcp-docs/${topic}`),
  );

  return localizedPublicPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: path.includes("/mcp-docs") ? 0.7 : 0.8,
    alternates: {
      languages: {
        "ar-SA": `${siteUrl}${path.replace(/^\/en/u, "/ar")}`,
        ar: `${siteUrl}${path.replace(/^\/en/u, "/ar")}`,
        "en-SA": `${siteUrl}${path.replace(/^\/ar/u, "/en")}`,
        en: `${siteUrl}${path.replace(/^\/ar/u, "/en")}`,
      },
    },
  }));
}
