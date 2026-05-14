import type { Metadata } from "next";
import type { ReactNode } from "react";
import { brandLabel, brandProductName } from "@qentrah/brand-identity";
import { getAdminLocale, localeDirection } from "@/lib/i18n";
import "./globals.css";

const brand = brandLabel("en");

export const metadata: Metadata = {
  title: brandProductName("admin", "en"),
  description: `Review and secure ${brand} platform operations.`,
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getAdminLocale();

  return (
    <html lang={locale} dir={localeDirection(locale)} suppressHydrationWarning>
      <body>
        {children}
      </body>
    </html>
  );
}
