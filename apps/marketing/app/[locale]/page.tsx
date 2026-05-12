import { notFound } from "next/navigation";

import { HomePage } from "@/components/marketing/home-page";
import { isLocale, type Locale } from "@/lib/content";

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  return <HomePage locale={localeParam as Locale} />;
}
