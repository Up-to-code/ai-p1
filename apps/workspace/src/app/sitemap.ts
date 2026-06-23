import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("workspace");
const locales = ["en", "ar"] as const;
const publicPaths = ["", "/about", "/broker", "/contact", "/developer", "/mcp-docs", "/privacy", "/terms", "/legal"] as const;
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
  const localizedPublicPaths = locales.flatMap((locale) => [
    ...publicPaths.map((path) => `/${locale}${path}`),
    ...docsTopics.map((topic) => `/${locale}/mcp-docs/${topic}`),
  ]);

  return localizedPublicPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path.includes("/mcp-docs") ? "monthly" : "weekly",
    priority: path === "/ar" ? 1 : path === "/en" ? 0.9 : path.includes("/mcp-docs") ? 0.7 : 0.8,
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
