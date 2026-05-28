import type { MetadataRoute } from "next";
import { brandDomainUrl, brandLabel, brandProductName } from "@qentrah/brand-identity";

export default function manifest(): MetadataRoute.Manifest {
  const name = `${brandProductName("platform", "ar")} - مساحة عمل عقارية في السعودية`;
  const iconBase = brandDomainUrl("workspace");

  return {
    name,
    short_name: brandLabel("ar"),
    description: "منصة كانترا لمساحة العمل العقارية وإدارة العملاء والمشاريع والتكاملات في السعودية.",
    start_url: "/ar",
    scope: "/",
    display: "standalone",
    dir: "rtl",
    lang: "ar-SA",
    background_color: "#F7F9FC",
    theme_color: "#011B5A",
    icons: [
      {
        src: `${iconBase}/app-icon-192.png`,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${iconBase}/app-icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: `${iconBase}/app-icon-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
