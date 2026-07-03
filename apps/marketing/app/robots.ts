import type { MetadataRoute } from "next";

const siteUrl = "https://www.qentrah.com";

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
