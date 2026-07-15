import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AnimatedHomeHero } from "@/components/landing/animated-home-hero";
import { AiOutcomesSections } from "@/components/landing/ai-outcomes-sections";
import { CtaSection } from "@/components/landing/cta-section";
import { Faq02 } from "@/components/landing/faq-02";
import { PlatformStorySections } from "@/components/landing/platform-story-sections";
import LogoCloud from "@/components/logo-cloud";
import { isLocale, type Locale } from "@/lib/content";
import { pageMetadata } from "@/lib/page-metadata";
import { getMarketingContent } from "@/lib/contentful";

// Revalidate every hour — content changes rarely.
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const content = await getMarketingContent(locale);
  return pageMetadata(locale as Locale, "home", content.presentation.seoEntries.find((entry) => entry.pageKey === "home"));
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <>
      <AnimatedHomeHero />

      <LogoCloud />

      <PlatformStorySections />

      <AiOutcomesSections />

      <Faq02 />

      <CtaSection />
    </>
  );
}
