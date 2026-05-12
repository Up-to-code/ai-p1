import { notFound } from "next/navigation";

import { LegalPage } from "@/components/marketing/legal-page";
import { isLocale, type Locale } from "@/lib/content";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;

  if (!isLocale(localeParam)) {
    notFound();
  }

  return <LegalPage kind="terms" locale={localeParam as Locale} />;
}
