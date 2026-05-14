import type { MetadataRoute } from "next";
import { brandLabel, brandProductName } from "@qentrah/brand-identity";

export default function manifest(): MetadataRoute.Manifest {
  const name = `${brandProductName("partners", "en")} Programmers`;

  return {
    name,
    short_name: "Qentrah Partners",
    description: `Create, test, and submit ${brandLabel("en")} organization authorization apps.`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F2F6F9",
    theme_color: "#011B5A",
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
