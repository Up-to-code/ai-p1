import type { Metadata } from "next";
import { brandDomainUrl, brandLabel, brandProductName } from "@qentrah/brand-identity";
import { routing } from "@/i18n/routing";

export type Locale = (typeof routing.locales)[number];

export function isLocale(locale: string): locale is Locale {
  return routing.locales.includes(locale as Locale);
}

export const metadata: Metadata = {
  metadataBase: new URL(brandDomainUrl("workspace")),
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
  authors: [{ name: brandLabel("en") }],
  creator: brandLabel("en"),
  publisher: brandLabel("en"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.ico", sizes: "192x192", type: "image/x-icon" },
      { url: "/logo.ico", sizes: "512x512", type: "image/x-icon" },
    ],
    shortcut: [{ url: "/logo.ico", type: "image/x-icon" }],
    apple: [{ url: "/logo.ico", sizes: "180x180", type: "image/x-icon" }],
    other: [{ rel: "mask-icon", url: "/mask-icon.svg", color: "#121212" }],
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
        url: "/logo.ico",
        width: 512,
        height: 512,
        alt: `${brandLabel("en")} - AI-First Project Management`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qentrah: AI-First Project Management for Small Teams",
    description:
      "Human-led project management where AI handles the busywork. Built for small teams and agencies.",
    images: ["/logo.ico"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};