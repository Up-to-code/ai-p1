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
    lang: "ar-EG",
    background_color: "#F7F9FC",
    theme_color: "#121212",
    icons: [
      {
        src: "/logo.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/logo.ico",
        sizes: "192x192",
        type: "image/x-icon",
        purpose: "any",
      },
      {
        src: "/logo.ico",
        sizes: "512x512",
        type: "image/x-icon",
        purpose: "any",
      },
      {
        src: "/logo.ico",
        sizes: "512x512",
        type: "image/x-icon",
        purpose: "maskable",
      },
    ],
  };
}
