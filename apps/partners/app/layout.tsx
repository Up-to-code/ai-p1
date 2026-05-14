import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brandLabel, brandProductName } from "@anan/brand-identity";
import { RootProvider } from "fumadocs-ui/provider/next";
import { ThemeProvider } from "@/components/brand/theme-provider";
import { rootFontClassName } from "@/lib/rootFonts";
import "fumadocs-ui/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: `${brandProductName("partners", "en")} Programmers`,
  description: `Create, test, and submit ${brandLabel("en")} organization authorization apps.`,
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
