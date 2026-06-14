import type { Metadata } from "next";
import { brandIdentity } from "@qentrah/brand-identity";
import { Cairo } from "next/font/google";

import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "Qentrah Platform",
  other: {
    "theme-color": "#FFFFFF",
  },
};

const themeInitScript = `
(() => {
  try {
    const theme = window.localStorage.getItem("${brandIdentity.themeStorageKey}") === "dark" ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    document.documentElement.style.backgroundColor = theme === "dark" ? "#000000" : "#FFFFFF";
  } catch {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    document.documentElement.style.backgroundColor = "#FFFFFF";
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
      <body className="h-full flex flex-col bg-background text-text-primary" suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
