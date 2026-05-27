import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("root");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/en", "/ar"],
      disallow: [
        "/admin",
        "/api",
        "/metrics",
        "/monitoring",
        "/privacy",
        "/terms",
        "/en/privacy",
        "/en/terms",
        "/ar/privacy",
        "/ar/terms",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
