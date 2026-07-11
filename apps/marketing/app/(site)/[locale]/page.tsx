import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QentrahLandingPage } from "@/components/landing/qentrah-landing-page";
import { isLocale, type Locale } from "@/lib/content";
import { pageMetadata } from "@/lib/page-metadata";

// Revalidate every hour — content changes rarely.
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? pageMetadata(locale as Locale, "home") : {};
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return <QentrahLandingPage locale={locale} />;
}
