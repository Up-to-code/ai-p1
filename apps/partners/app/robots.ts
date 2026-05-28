import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("partners");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/pricing", "/security", "/support", "/policies", "/docs"],
      disallow: [
        "/admin",
        "/api",
        "/dashboard",
        "/metrics",
        "/monitoring",
        "/signin",
        "/signup",
        "/auth",
        "/oauth",
        "/portal",
        "/docs/oauth-flow",
        "/docs/api-usage",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
