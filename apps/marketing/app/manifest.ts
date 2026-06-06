import type { MetadataRoute } from "next";
import { brandLabel, brandProductName } from "@qentrah/brand-identity";

import { getMarketingMessages } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  const name = brandProductName("platform", "ar");

  return {
    name,
    short_name: brandLabel("ar"),
    description: getMarketingMessages("ar").Landing.home.hero.description,
    start_url: "/ar",
    scope: "/",
    display: "standalone",
    dir: "rtl",
    lang: "ar-SA",
    background_color: "#F7F9FC",
    theme_color: "#121212",
    icons: [
      {
        src: "/app-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/app-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
