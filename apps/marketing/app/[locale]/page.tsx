import { brandDomainUrl } from "@qentrah/brand-identity";
import { notFound, redirect } from "next/navigation";

import { isLocale, type Locale } from "@/lib/content";

export default async function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  const locale = localeParam as Locale;

  redirect(new URL(`/${locale}/dashboard`, brandDomainUrl("workspace")).toString());
}
