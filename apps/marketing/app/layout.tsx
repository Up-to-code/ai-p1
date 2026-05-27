import type { Metadata } from "next";
import type { CSSProperties } from "react";
import type { ReactNode } from "react";
import { brandDomainUrl, brandIdentity, brandLabel } from "@qentrah/brand-identity";

import "./globals.css";

const brand = brandLabel("en");
const siteUrl = brandDomainUrl("root");
const socialImage = new URL("/app-icon-512.png", brandDomainUrl("workspace")).toString();
const brandStyle = { "--brand-primary": brandIdentity.colors.primary } as CSSProperties;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: brand,
  title: {
    default: brand,
    template: `%s | ${brand}`,
  },
  description: `${brand} public product home for real estate workspace and partner products.`,
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
