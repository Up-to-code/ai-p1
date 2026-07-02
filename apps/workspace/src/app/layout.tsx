import type { Metadata } from "next";
import { brandIdentity, brandLabel, brandDomainUrl } from "@qentrah/brand-identity";
import { Cairo } from "next/font/google";
import { Suspense } from "react";
import { NavigationProgress } from "@/components/layout/navigation-progress";

import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

const siteUrl = brandDomainUrl("workspace");
const brand = brandLabel("en");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Qentrah: Operating System for Agencies | AI Project Management",
    template: "%s | Qentrah",
  },
  description:
    "One workspace for clients, opportunities, projects, and tasks. AI that operates your business. Built for marketing, creative, design, and service agencies.",
  keywords: [
    "CRM for agencies",
    "project management for agencies",
    "agency management software",
    "client operations platform",
    "all-in-one client management",
    "AI project management",
    "agency profitability tracking",
    "marketing agency software",
    "creative studio management",
  ],
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/logo.ico", type: "image/x-icon" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/app-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/app-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/logo.ico", type: "image/x-icon" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  applicationName: brand,
  creator: brand,
  publisher: brand,
  authors: [{ name: brand }],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: brand,
    title: "Qentrah: Operating System for Agencies",
    description:
      "One workspace for clients, opportunities, projects, and tasks. AI that operates your business. Built for marketing, creative, design, and service agencies.",
    images: [
      {
        url: "/app-icon-512.png",
        width: 512,
        height: 512,
        alt: "Qentrah - AI Client Operations Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Qentrah: Operating System for Agencies",
    description:
      "One workspace for clients, opportunities, projects, and tasks. AI that operates your business.",
    images: ["/app-icon-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="h-full flex flex-col bg-background text-text-primary" suppressHydrationWarning>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
