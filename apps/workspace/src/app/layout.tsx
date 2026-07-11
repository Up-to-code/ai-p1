import { brandIdentity } from "@qentrah/brand-identity";
import { Cairo } from "next/font/google";
import { Suspense } from "react";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { rootMetadata } from "@/metadata/workspace";

import "@svar-ui/react-kanban/all.css";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata = rootMetadata;

const themeInitScript = `
(() => {
  try {
    const stored = window.localStorage.getItem("${brandIdentity.themeStorageKey}");
    const theme = stored === "light" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
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
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
      </head>
      <body className="h-full flex flex-col bg-background text-text-primary" suppressHydrationWarning>
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
