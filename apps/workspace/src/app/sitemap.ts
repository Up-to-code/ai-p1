import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";
import { getBlogPosts } from "@/lib/blog/workspace-blog";

const siteUrl = brandDomainUrl("workspace");
const locales = ["en", "ar"] as const;
const publicPaths = ["", "/about", "/broker", "/contact", "/developer", "/docs", "/privacy", "/terms", "/legal", "/blog"] as const;
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
  const localizedBlogPosts = locales.flatMap((locale) =>
    getBlogPosts(locale).map((post) => ({
      path: `/${locale}/blog/${post.slug}`,
      date: post.date,
    })),
  );

  return [
    ...localizedPublicPaths.map((path) => ({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency: path.includes("/docs") ? "monthly" as const : "weekly" as const,
      priority: path === "/ar" ? 1 : path === "/en" ? 0.9 : path.includes("/docs") || path.includes("/blog") ? 0.7 : 0.8,
      alternates: {
        languages: {
          "ar-SA": `${siteUrl}${path.replace(/^\/en/u, "/ar")}`,
          ar: `${siteUrl}${path.replace(/^\/en/u, "/ar")}`,
          "en-SA": `${siteUrl}${path.replace(/^\/ar/u, "/en")}`,
          en: `${siteUrl}${path.replace(/^\/ar/u, "/en")}`,
        },
      },
    })),
    ...localizedBlogPosts.map(({ path, date }) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(date),
      changeFrequency: "monthly" as const,
      priority: 0.65,
      alternates: {
        languages: {
          "ar-SA": `${siteUrl}${path.replace(/^\/en/u, "/ar")}`,
          ar: `${siteUrl}${path.replace(/^\/en/u, "/ar")}`,
          "en-SA": `${siteUrl}${path.replace(/^\/ar/u, "/en")}`,
          en: `${siteUrl}${path.replace(/^\/ar/u, "/en")}`,
        },
      },
    })),
  ];
}
