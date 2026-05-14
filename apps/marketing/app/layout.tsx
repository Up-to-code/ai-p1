import type { Metadata } from "next";
import type { CSSProperties } from "react";
import type { ReactNode } from "react";
import { brandIdentity, brandLabel } from "@anan/brand-identity";

import "./globals.css";

const brand = brandLabel("en");
const brandStyle = { "--brand-primary": brandIdentity.colors.primary } as CSSProperties;

export const metadata: Metadata = {
  title: brand,
  description: `${brand} public product home for real estate workspace and partner products.`
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" style={brandStyle} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
