import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brandDomainUrl, brandLabel, brandProductName } from "@qentrah/brand-identity";
import { getAdminLocale, localeDirection } from "@/lib/i18n";
import "./globals.css";

const brand = brandLabel("en");

export const metadata: Metadata = {
  metadataBase: new URL(brandDomainUrl("admin")),
  applicationName: brandProductName("admin", "en"),
  title: {
    default: brandProductName("admin", "en"),
    template: `%s | ${brandProductName("admin", "en")}`,
  },
  description: `Review and secure ${brand} platform operations.`,
  keywords: ["Qentrah", "admin review", "partner review", "workspace security"],
  authors: [{ name: brand }],
  creator: brand,
  publisher: brand,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/mask-icon.svg", color: "#121212" }],
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: brandProductName("admin", "en"),
    title: brandProductName("admin", "en"),
    description: `Review and secure ${brand} platform operations.`,
    images: [
      {
        url: "/app-icon-512.png",
        width: 512,
        height: 512,
        alt: `${brand} Admin icon`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: brandProductName("admin", "en"),
    description: `Review and secure ${brand} platform operations.`,
    images: ["/app-icon-512.png"],
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getAdminLocale();

  return (
    <html lang={locale} dir={localeDirection(locale)} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
