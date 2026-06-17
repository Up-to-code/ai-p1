import type { Metadata } from "next";
import type { CSSProperties } from "react";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import { brandIdentity } from "@qentrah/brand-identity";

import { rootMarketingMetadata } from "@/lib/seo";

import "./globals.css";

const brandStyle = { "--brand-primary": brandIdentity.colors.primary } as CSSProperties;
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
});

export const metadata: Metadata = rootMarketingMetadata("ar");

const themeInitScript = `
(() => {
  try {
    const theme = window.localStorage.getItem("${brandIdentity.themeStorageKey}") === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={cairo.variable} lang="en" style={brandStyle} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
