import { notFound } from "next/navigation";

import { LegalPage } from "@/components/marketing/legal-page";
import { isLocale, type Locale } from "@/lib/content";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  return <LegalPage kind="privacy" locale={localeParam as Locale} />;
}
