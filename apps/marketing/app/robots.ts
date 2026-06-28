import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("root");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: [
        "/en",
        "/ar",
        "/en/contact",
        "/ar/contact",
        "/en/partners",
        "/ar/partners",
        "/en/dashboard",
        "/ar/dashboard",
        "/en/docs",
        "/ar/docs",
      ],
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
