import type { MetadataRoute } from "next";
import { brandDomainUrl } from "@qentrah/brand-identity";

const siteUrl = brandDomainUrl("workspace");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
