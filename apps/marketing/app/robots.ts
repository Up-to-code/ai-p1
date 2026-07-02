import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("root");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/admin",
        "/api",
        "/metrics",
        "/monitoring",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
