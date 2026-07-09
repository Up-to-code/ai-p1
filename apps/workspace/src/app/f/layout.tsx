import type { Metadata } from "next";
import { brandIdentity, brandProductName } from "@qentrah/brand-identity";
import { Cairo } from "next/font/google";
import "../globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

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

export const metadata: Metadata = {
  title: `Shared file | ${brandProductName("platform", "en")}`,
  description: `View a shared file from ${brandProductName("platform", "en")}.`,
};

export default function FileShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full bg-background text-text-primary" suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
          suppressHydrationWarning
        />
        {children}
      </body>
    </html>
  );
}
