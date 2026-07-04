import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("workspace");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // Disallow authenticated and private routes
      disallow: ["/api/", "/auth/", "/inbox", "/projects", "/clients", "/calendar", "/settings", "/f/"],
      // Allow public marketing pages if any exist
      allow: ["/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
