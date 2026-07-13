import type { Metadata } from "next";
import {
  brandDomainUrl,
  brandLabel,
  brandProductName,
} from "@qentrah/brand-identity";
import { workspaceAssets } from "@/lib/assets/workspace-assets";
export { isLocale, type Locale } from "@/i18n/locale-registry";

const siteUrl = brandDomainUrl("workspace");
const brand = brandLabel("en");

export const rootMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Qentrah: Operating System for Agencies | AI Project Management",
    template: "%s | Qentrah",
  },
  description:
    "One workspace for clients, opportunities, projects, and tasks. AI that operates your business. Built for marketing, creative, design, and service agencies.",
  keywords: [
    "CRM for agencies",
    "project management for agencies",
    "agency management software",
    "client operations platform",
    "all-in-one client management",
    "AI project management",
    "agency profitability tracking",
    "marketing agency software",
    "creative studio management",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: workspaceAssets.brand.icon, type: "image/x-icon" },
      { url: workspaceAssets.brand.favicon, type: "image/svg+xml" },
      { url: workspaceAssets.brand.icon, sizes: "192x192", type: "image/x-icon" },
      { url: workspaceAssets.brand.icon, sizes: "512x512", type: "image/x-icon" },
    ],
    shortcut: [{ url: workspaceAssets.brand.icon, type: "image/x-icon" }],
    apple: [{ url: workspaceAssets.brand.icon, sizes: "180x180", type: "image/x-icon" }],
  },
  applicationName: brand,
  creator: brand,
  publisher: brand,
  authors: [{ name: brand }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: brand,
    title: "Qentrah: Operating System for Agencies",
    description:
      "One workspace for clients, opportunities, projects, and tasks. AI that operates your business. Built for marketing, creative, design, and service agencies.",
    images: [
      {
        url: workspaceAssets.brand.icon,
        width: 512,
        height: 512,
        alt: "Qentrah - AI Client Operations Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qentrah: Operating System for Agencies",
    description:
      "One workspace for clients, opportunities, projects, and tasks. AI that operates your business.",
    images: [workspaceAssets.brand.icon],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const localizedWorkspaceMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: brandProductName("workspace", "en"),
  title: {
    default: "Qentrah: AI-First Project Management for Small Teams",
    template: `%s | ${brandProductName("workspace", "en")}`,
  },
  description:
    "Human-led project management where AI handles the busywork. Built for small teams and agencies that want one unified workspace for clients, projects, tasks, and collaboration — without the bloat.",
  keywords: [
    "AI project management",
    "project management for small teams",
    "agency management software",
    "team productivity",
    "AI-first Work OS",
    "project management for agencies",
    "small business project management software",
    "Qentrah",
  ],
  authors: [{ name: brand }],
  creator: brand,
  publisher: brand,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: workspaceAssets.brand.favicon, type: "image/svg+xml" },
      { url: workspaceAssets.brand.icon, sizes: "192x192", type: "image/x-icon" },
      { url: workspaceAssets.brand.icon, sizes: "512x512", type: "image/x-icon" },
    ],
    shortcut: [{ url: workspaceAssets.brand.icon, type: "image/x-icon" }],
    apple: [{ url: workspaceAssets.brand.icon, sizes: "180x180", type: "image/x-icon" }],
    other: [{ rel: "mask-icon", url: workspaceAssets.brand.safariMask, color: "#121212" }],
  },
  appleWebApp: {
    capable: true,
    title: brandProductName("workspace", "en"),
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: brandProductName("workspace", "en"),
    title: "Qentrah: AI-First Project Management for Small Teams",
    description:
      "Human-led project management where AI handles the busywork. Built for small teams and agencies.",
    images: [
      {
        url: workspaceAssets.brand.icon,
        width: 512,
        height: 512,
        alt: `${brand} - AI-First Project Management`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qentrah: AI-First Project Management for Small Teams",
    description:
      "Human-led project management where AI handles the busywork. Built for small teams and agencies.",
    images: [workspaceAssets.brand.icon],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  alternates: {
    canonical: "/",
  },
};
