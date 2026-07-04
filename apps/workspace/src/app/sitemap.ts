import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("workspace");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Basic public routes for the workspace app
  // Note: Most workspace routes are authenticated and should not be indexed
  // This sitemap mainly serves the landing/home page
  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
