import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LegalPage } from "@/components/marketing/legal-page";
import { MarketingPageJsonLd } from "@/components/marketing/seo-json-ld";
import { getContent, isLocale, type Locale } from "@/lib/content";
import { localizedMarketingMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  return isLocale(localeParam) ? localizedMarketingMetadata(localeParam, "terms") : {};
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const page = getContent(locale).legal;

  return (
    <>
      <MarketingPageJsonLd description={String(page.terms[0].body).split("\n\n")[0]} locale={locale} path="terms" title={page.termsTitle} />
      <LegalPage kind="terms" locale={locale} />
    </>
  );
}
