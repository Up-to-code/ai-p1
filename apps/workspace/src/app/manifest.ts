import type { MetadataRoute } from "next";
import { brandLabel, brandProductName } from "@qentrah/brand-identity";
import { workspaceAssets } from "@/lib/assets/workspace-assets";

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
        src: workspaceAssets.brand.icon,
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: workspaceAssets.application.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: workspaceAssets.application.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: workspaceAssets.application.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
