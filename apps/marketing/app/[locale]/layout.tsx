import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { LocaleDocumentAttributes } from "@/components/marketing/locale-document-attributes";
import { SiteFooter, SiteHeader } from "@/components/marketing/site-shell";
import { getContent, getDirection, isLocale, type Locale } from "@/lib/content";

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "ar" }];
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale: Locale = localeParam;
  const copy = getContent(locale);

  return (
    <div dir={getDirection(locale)} lang={locale}>
      <LocaleDocumentAttributes locale={locale} />
      <SiteHeader locale={locale} nav={copy.nav} />
      {children}
      <SiteFooter locale={locale} nav={copy.nav} />
    </div>
  );
}
