import type { MetadataRoute } from "next";

import {
  allLocalizedMarketingPaths,
  localizedLanguages,
  marketingSitemapPriority,
} from "@/lib/seo";
import { getBlogPosts } from "@/lib/payload-api";
import { getAllMarketingPages } from "@/lib/cms-pages";
import { getLocaleCodes } from "@/lib/locales";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const baseUrl = "https://qentrah.com";

  const staticEntries: MetadataRoute.Sitemap = allLocalizedMarketingPaths().map(
    ({ path, url }) => ({
      url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: marketingSitemapPriority(path),
      alternates: {
        languages: localizedLanguages(path, true),
      },
    }),
  );

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const { docs: enPosts } = await getBlogPosts("en", 1, 100);
    const { docs: arPosts } = await getBlogPosts("ar", 1, 100);
    const allSlugs = new Set([
      ...enPosts.map((p) => p.slug),
      ...arPosts.map((p) => p.slug),
    ]);

    blogEntries = Array.from(allSlugs).map((slug) => ({
      url: `${baseUrl}/en/blog/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: {
          en: `${baseUrl}/en/blog/${slug}`,
          ar: `${baseUrl}/ar/blog/${slug}`,
        },
      },
    }));
  } catch {
    // Payload may not be available at build time
  }

  return [...staticEntries, ...blogEntries];
}
