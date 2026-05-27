import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("root");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return ["/en", "/ar"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/en" ? 1 : 0.9,
    alternates: {
      languages: {
        en: `${siteUrl}/en`,
        ar: `${siteUrl}/ar`,
      },
    },
  }));
}
