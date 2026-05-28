import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("root");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return ["/ar", "/en"].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/ar" ? 1 : 0.9,
    alternates: {
      languages: {
        "ar-SA": `${siteUrl}/ar`,
        ar: `${siteUrl}/ar`,
        "en-SA": `${siteUrl}/en`,
        en: `${siteUrl}/en`,
        "x-default": `${siteUrl}/ar`,
      },
    },
  }));
}
