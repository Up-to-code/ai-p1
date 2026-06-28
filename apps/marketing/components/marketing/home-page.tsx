"use client";

import { useLocale, useTranslations } from "next-intl";

import CTA from "@/components/cta";
import LogoCloud from "@/components/logo-cloud";
import { AnimatedHomeHero } from "@/components/landing/animated-home-hero";
import { Faq02 } from "@/components/landing/faq-02";
import { PlatformSection } from "@/components/landing/platform-section";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { AISection } from "@/components/landing/ai-section";
import { TaskSection } from "@/components/landing/task-section";
import { DocSection } from "@/components/landing/doc-section";
import { ClientsSection } from "@/components/landing/clients-section";
import { CommunicationSection } from "@/components/landing/communication-section";
import { VisionSection } from "@/components/landing/vision-section";

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

      <SolutionSection locale={locale} />

      <PlatformSection locale={locale} />

      <AISection locale={locale} />

      <TaskSection locale={locale} />

      <DocSection locale={locale} />

      <ClientsSection locale={locale} />

      <CommunicationSection locale={locale} />

      <VisionSection locale={locale} />

      <Faq02 />

      <CTA />
    </>
  );
}
