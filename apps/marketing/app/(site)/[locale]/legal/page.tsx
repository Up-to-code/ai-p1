import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/content";
import { pageMetadata } from "@/lib/page-metadata";
import LegalPage from "./page-content";
import { getMarketingContent } from "@/lib/contentful";

export const revalidate = false;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = await getMarketingContent(locale);
  return pageMetadata(locale as Locale, "legal", content.presentation.seoEntries.find((entry) => entry.pageKey === "legal"));
}

export default async function LegalPageWrapper({ params }: Props) {
  const { locale } = await params;
  const content = isLocale(locale) ? await getMarketingContent(locale) : null;
  return <LegalPage locale={locale} content={content?.presentation.legalPages.find((page) => page.pageKey === "legal")} />;
}
