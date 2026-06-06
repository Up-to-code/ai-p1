import type { Metadata } from "next";
import { brandIdentity, brandLabel, brandProductName } from "@qentrah/brand-identity";
import { Cairo } from "next/font/google";
import { cookies, headers } from "next/headers";
import "../globals.css";
import { resolveOAuthLocale } from "./oauth-locale";

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
  title: `Partner authorization | ${brandProductName("platform", "en")}`,
  description: `Authorize partner application access to a ${brandLabel("en")} workspace.`,
};

export default async function OAuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveOAuthLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const isArabic = locale === "ar";

  return (
    <html
      lang={locale}
      dir={isArabic ? "rtl" : "ltr"}
      className={`${cairo.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className={`h-full bg-background text-text-primary ${isArabic ? "font-cairo" : ""}`} suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      {/* impeccable-live-start */}
<script src="http://localhost:8400/live.js"></script>
{/* impeccable-live-end */}
</body>
    </html>
  );
}
