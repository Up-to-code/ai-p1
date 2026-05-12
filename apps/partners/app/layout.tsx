import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RootProvider } from "fumadocs-ui/provider/next";
import { ThemeProvider } from "@/components/brand/theme-provider";
import { rootFontClassName } from "@/lib/rootFonts";
import "fumadocs-ui/style.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Anan Partner Programmers",
  description: "Create, test, and submit Anan organization authorization apps.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`min-h-screen bg-background ${rootFontClassName}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <RootProvider>{children}</RootProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
