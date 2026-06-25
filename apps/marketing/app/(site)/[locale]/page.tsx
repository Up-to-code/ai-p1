"use client";

import { useLocale, useTranslations } from "next-intl";
import { notFound } from "next/navigation";

import CTA from "@/components/cta";
import { Faq02 } from "@/components/landing/faq-02";
import { PlatformSection } from "@/components/landing/platform-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { AISection } from "@/components/landing/ai-section";
import { CommunicationSection } from "@/components/landing/communication-section";
import { VisionSection } from "@/components/landing/vision-section";
import { AnimatedHomeHero } from "@/components/landing/animated-home-hero";
import LogoCloud from "@/components/logo-cloud";
import { isLocale } from "@/lib/content";

export default function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const t = useTranslations("Landing.home");
  const locale = useLocale();
  const isAr = locale === "ar";

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <>
      <AnimatedHomeHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        primaryLabel={t("hero.primary")}
        secondaryLabel={t("hero.secondary")}
        isAr={isAr}
      />

      <LogoCloud />

      <ProblemSection locale={locale} />

      <SolutionSection locale={locale} />

      <PlatformSection locale={locale} />

      <AISection locale={locale} />

      <CommunicationSection locale={locale} />

      <VisionSection locale={locale} />

      <Faq02 />

      <CTA />
    </>
  );
}
