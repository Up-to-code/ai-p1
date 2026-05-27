import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("workspace");
const locales = ["en", "ar"] as const;
const publicPaths = ["", "/about", "/broker", "/contact", "/developer", "/docs"] as const;
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
    ...docsTopics.map((topic) => `/${locale}/docs/${topic}`),
  ]);

  return localizedPublicPaths.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path.includes("/docs") ? "monthly" : "weekly",
    priority: path === "/en" ? 1 : path === "/ar" ? 0.9 : path.includes("/docs") ? 0.7 : 0.8,
    alternates: {
      languages: {
        en: `${siteUrl}${path.replace(/^\/ar/u, "/en")}`,
        ar: `${siteUrl}${path.replace(/^\/en/u, "/ar")}`,
      },
    },
  }));
}
