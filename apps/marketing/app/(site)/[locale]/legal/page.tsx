import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/content";
import { pageMetadata } from "@/lib/page-metadata";
import LegalPage from "./page-content";

export const revalidate = false;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? pageMetadata(locale as Locale, "legal") : {};
}

export default async function LegalPageWrapper({ params }: Props) {
  const { locale } = await params;
  return <LegalPage locale={locale} />;
}
