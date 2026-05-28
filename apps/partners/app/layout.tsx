import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brandDomainUrl, brandLabel, brandProductName } from "@qentrah/brand-identity";
import { RootProvider } from "fumadocs-ui/provider/next";
import { ThemeProvider } from "@/components/brand/theme-provider";
import { rootFontClassName } from "@/lib/rootFonts";
import "fumadocs-ui/style.css";
import "./globals.css";

const siteName = brandProductName("partners", "en");
const siteDescription = `Create, test, and submit ${brandLabel("en")} organization authorization apps.`;

export const metadata: Metadata = {
  metadataBase: new URL(brandDomainUrl("partners")),
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    "Qentrah",
    "Qentrah Partners",
    "real estate API",
    "OAuth apps",
    "partner integrations",
    "workspace authorization",
  ],
  authors: [{ name: brandLabel("en") }],
  creator: brandLabel("en"),
  publisher: brandLabel("en"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/mask-icon.svg", color: "#011B5A" }],
  },
  appleWebApp: {
    capable: true,
    title: siteName,
    statusBarStyle: "default",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: "/app-icon-512.png",
        width: 512,
        height: 512,
        alt: `${brandLabel("en")} Partners icon`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: siteName,
    description: siteDescription,
    images: ["/app-icon-512.png"],
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
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-dvh bg-background ${rootFontClassName}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <RootProvider>{children}</RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
