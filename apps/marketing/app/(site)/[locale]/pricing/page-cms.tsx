import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMarketingPage } from "@/lib/cms-pages";
import { generateCMSMetadata, generateFallbackMetadata } from "@/lib/cms-seo";
import { PageRenderer } from "@/components/cms/page-renderer";
import { isValidLocale, type LocaleCode } from "@/lib/locales";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) return {};

  const locale = localeParam as LocaleCode;
  const page = await getMarketingPage("pricing", locale);
  return page ? generateCMSMetadata(page) : generateFallbackMetadata("pricing", locale);
}

export default async function PricingPageCMS({ params }: Props) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) notFound();

  const locale = localeParam as LocaleCode;
  const page = await getMarketingPage("pricing", locale);

  if (!page) {
    const { PricingPage } = await import("@/components/pricing/pricing-page");
    return <PricingPage />;
  }

  return <PageRenderer page={page} />;
}
