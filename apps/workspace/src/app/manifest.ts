import type { MetadataRoute } from "next";
import { brandLabel, brandProductName } from "@qentrah/brand-identity";

export default function manifest(): MetadataRoute.Manifest {
  const name = brandProductName("workspace", "en");

  return {
    name,
    short_name: "Qentrah",
    description: "AI-powered workspace to manage conversations, tasks, projects, clients, and operations.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F2F6F9",
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
