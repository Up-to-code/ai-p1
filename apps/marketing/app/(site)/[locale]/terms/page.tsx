import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/content";
import { pageMetadata } from "@/lib/page-metadata";
import TermsPage from "./page-content";
import { getMarketingContent } from "@/lib/contentful";

export const revalidate = false;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = await getMarketingContent(locale);
  return pageMetadata(locale as Locale, "terms", content.presentation.seoEntries.find((entry) => entry.pageKey === "terms"));
}

export default async function TermsPageWrapper({ params }: Props) {
  const { locale } = await params;
  const content = isLocale(locale) ? await getMarketingContent(locale) : null;
  return <TermsPage locale={locale} content={content?.presentation.legalPages.find((page) => page.pageKey === "terms")} />;
}
