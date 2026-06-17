"use client";

import { useLocale, useTranslations } from "next-intl";

import CTA from "@/components/cta";
import LogoCloud from "@/components/logo-cloud";
import { AnimatedHomeHero } from "@/components/landing/animated-home-hero";
import { AppsPlatform } from "@/components/landing/apps-platform";
import { Faq02 } from "@/components/landing/faq-02";
import { McpAgentsShowcase } from "@/components/landing/mcp-agents-showcase";
import { ProblemSection } from "@/components/landing/problem-section";

export function HomePage() {
  const t = useTranslations("Landing.home");
  const locale = useLocale();
  const isAr = locale === "ar";

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

      <McpAgentsShowcase locale={locale} />

      <Faq02 />

      <CTA />
    </>
  );
}
