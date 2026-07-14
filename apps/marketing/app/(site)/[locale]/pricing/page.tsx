import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/content";
import { pageMetadata } from "@/lib/page-metadata";
import { PricingPage } from "@/components/pricing/pricing-page";
import { getMarketingContent } from "@/lib/contentful";

export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = await getMarketingContent(locale);
  return pageMetadata(locale as Locale, "pricing", content.presentation.seoEntries.find((entry) => entry.pageKey === "pricing"));
}

export default function PricingPageRoute() {
  return <PricingPage />;
}
