"use client";

import { useLocale, useTranslations } from "next-intl";
import { notFound } from "next/navigation";

import CTA from "@/components/cta";
import { Faq02 } from "@/components/landing/faq-02";
import { WebsiteBuilderConnect } from "@/components/landing/website-builder-connect";
import { McpAgentsShowcase } from "@/components/landing/mcp-agents-showcase";
import { ProblemSection } from "@/components/landing/problem-section";
import { AppsPlatform } from "@/components/landing/apps-platform";
import { AnimatedHomeHero } from "@/components/landing/animated-home-hero";
import LogoCloud from "@/components/logo-cloud";
import { isLocale } from "@/lib/content";

export default function LocaleHomePage({ params }: { params: Promise<{ locale: string }> }) {
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

      <AppsPlatform locale={locale} />

      <WebsiteBuilderConnect locale={locale} />

      <McpAgentsShowcase locale={locale} />

      <Faq02 />

      <CTA />
    </>
  );
}
