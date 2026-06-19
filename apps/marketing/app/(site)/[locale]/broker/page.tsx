import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WorkspaceBrokerPage } from "@/components/marketing/workspace-public/broker-page";
import { MarketingPageJsonLd } from "@/components/marketing/seo-json-ld";
import { getWorkspaceLanding, isLocale, type Locale } from "@/lib/content";
import { localizedMarketingMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  return isLocale(localeParam) ? localizedMarketingMetadata(localeParam, "broker") : {};
}

export default async function BrokerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;
  const page = getWorkspaceLanding(locale).broker.hero;

  return (
    <>
      <MarketingPageJsonLd description={page.description} locale={locale} path="broker" title={page.title} />
      <WorkspaceBrokerPage />
    </>
  );
}
