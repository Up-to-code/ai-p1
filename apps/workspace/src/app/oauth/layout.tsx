import type { Metadata } from "next";
import { brandLabel, brandProductName } from "@qentrah/brand-identity";
import { cookies, headers } from "next/headers";
import { resolveOAuthLocale } from "./oauth-locale";

export const metadata: Metadata = {
  title: `Secure authorization | ${brandProductName("platform", "en")}`,
  description: `Review and authorize secure access to a ${brandLabel("en")} workspace.`,
};

export default async function OAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveOAuthLocale({
    cookieLocale: cookieStore.get("NEXT_LOCALE")?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });
  const isArabic = locale === "ar";

  return (
    <div
      lang={locale}
      dir={isArabic ? "rtl" : "ltr"}
      className={`h-full bg-background text-text-primary ${isArabic ? "font-cairo" : ""}`}
    >
      {children}
    </div>
  );
}
