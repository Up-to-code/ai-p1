import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brandLabel, brandProductName } from "@qentrah/brand-identity";
import "./globals.css";

const brand = brandLabel("en");

export const metadata: Metadata = {
  title: brandProductName("admin", "en"),
  description: `Review and approve ${brand} partner app submissions.`,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
