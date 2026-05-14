import type { Metadata } from "next";
import { brandIdentity, brandProductName } from "@qentrah/brand-identity";
import { Cairo, Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

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

export const metadata: Metadata = {
  title: `Shared file | ${brandProductName("platform", "en")}`,
  description: `View a shared file from ${brandProductName("platform", "en")}.`,
};

export default function FileShareLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="h-full bg-background text-text-primary" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
