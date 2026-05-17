import type { Metadata } from "next";
import { brandLabel } from "@qentrah/brand-identity";
import "./globals.css";

const brand = brandLabel("en");

export const metadata: Metadata = {
  title: `${brand} Partner Auth Demo`,
  description: `Standalone partner OAuth demo for ${brand} organization authorization.`,
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
