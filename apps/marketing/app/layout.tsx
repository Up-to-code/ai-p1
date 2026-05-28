import type { Metadata } from "next";
import type { CSSProperties } from "react";
import type { ReactNode } from "react";
import { brandDomainUrl, brandIdentity, brandLabel } from "@qentrah/brand-identity";

import "./globals.css";

const brand = brandLabel("en");
const siteUrl = brandDomainUrl("root");
const socialImage = new URL("/app-icon-512.png", brandDomainUrl("workspace")).toString();
const brandStyle = { "--brand-primary": brandIdentity.colors.primary } as CSSProperties;
const trustedKeywords = [
  "كانترا",
  "مساحة عمل عقارية",
  "إدارة المشاريع العقارية",
  "إدارة المخزون العقاري",
  "CRM عقاري",
  "إدارة العملاء العقاريين",
  "المطورون العقاريون",
  "الوسطاء العقاريون",
  "السوق العقاري السعودي",
  "real estate workspace Saudi Arabia",
  "Saudi real estate CRM",
  "property inventory management",
  "project readiness",
  "broker coordination",
  "developer workflow",
  "verified inventory",
  "real estate operations",
];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: brand,
  title: {
    default: brand,
    template: `%s | ${brand}`,
  },
  description: `${brand} public product home for real estate workspace and partner products.`,
  keywords: trustedKeywords,
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: socialImage, sizes: "512x512", type: "image/png" }],
    apple: [{ url: `${brandDomainUrl("workspace")}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" }],
  },
  authors: [{ name: brand }],
  creator: brand,
  publisher: brand,
  openGraph: {
    type: "website",
    url: "/en",
    siteName: brand,
    title: brand,
    description: `${brand} public product home for real estate workspace and partner products.`,
    images: [
      {
        url: socialImage,
        width: 512,
        height: 512,
        alt: `${brand} logo`,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: brand,
    description: `${brand} public product home for real estate workspace and partner products.`,
    images: [socialImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" style={brandStyle} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
