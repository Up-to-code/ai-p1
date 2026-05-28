import type { MetadataRoute } from "next";

import { allLocalizedMarketingPaths, localizedLanguages, marketingSitemapPriority } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return allLocalizedMarketingPaths().map(({ path, url }) => ({
    url,
    lastModified: now,
    changeFrequency: "weekly",
    priority: marketingSitemapPriority(path),
    alternates: {
      languages: localizedLanguages(path, true),
    },
  }));
}
