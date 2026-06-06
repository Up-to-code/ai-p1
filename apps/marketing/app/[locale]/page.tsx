import { notFound } from "next/navigation";

import { MarketingHomeJsonLd } from "@/components/marketing/seo-json-ld";
import { HiddenHomePage } from "@/components/marketing/hidden-home-page";
import { isLocale, type Locale } from "@/lib/content";

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;

  return (
    <>
      <MarketingHomeJsonLd locale={locale} />
      <HiddenHomePage />
    </>
  );
}
