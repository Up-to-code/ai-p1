import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage } from "@/components/marketing/legal-page";
import { MarketingPageJsonLd } from "@/components/marketing/seo-json-ld";
import { getContent, isLocale, type Locale } from "@/lib/content";
import { localizedMarketingMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  return isLocale(localeParam) ? localizedMarketingMetadata(localeParam, "legal") : {};
}

export default async function LocaleLegalPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const page = getContent(locale).legal;

  return (
    <>
      <MarketingPageJsonLd description={String(page.legal[0].body).split("\n\n")[0]} locale={locale} path="legal" title={page.legalTitle} />
      <LegalPage kind="legal" locale={locale} />
    </>
  );
}
