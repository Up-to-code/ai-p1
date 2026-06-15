import type { Metadata } from "next";
import Script from "next/script";
import { brandIdentity } from "@qentrah/brand-identity";
import { Cairo } from "next/font/google";
import { RouteTransitionOverlay } from "@/components/layout/route-transition-overlay";

import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Qentrah Platform",
  other: {
    "theme-color": "#000000",
  },
};

const themeInitScript = `
(() => {
  try {
    const theme = window.localStorage.getItem("${brandIdentity.themeStorageKey}") === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    document.documentElement.style.backgroundColor = theme === "dark" ? "#000000" : "#FFFFFF";
    document.body.style.backgroundColor = theme === "dark" ? "#000000" : "#FFFFFF";
    document.body.style.color = theme === "dark" ? "#FFFFFF" : "#000000";
  } catch {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    document.documentElement.style.backgroundColor = "#FFFFFF";
    document.body.style.backgroundColor = "#FFFFFF";
    document.body.style.color = "#000000";
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body
        className="h-full flex flex-col bg-background text-text-primary"
        suppressHydrationWarning
      >
        <RouteTransitionOverlay />
        {children}
      </body>
    </html>
  );
}
