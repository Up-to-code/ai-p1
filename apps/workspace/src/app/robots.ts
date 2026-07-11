import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      // The workspace is authenticated and private. Public content belongs on
      // the marketing domain and is the only content submitted to Google.
      disallow: "/",
    },
  };
}
