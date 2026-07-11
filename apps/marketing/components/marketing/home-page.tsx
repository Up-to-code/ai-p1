"use client";

import { useLocale } from "next-intl";

import LogoCloud from "@/components/logo-cloud";
import { AnimatedHomeHero } from "@/components/landing/animated-home-hero";
import { Faq02 } from "@/components/landing/faq-02";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { AISection } from "@/components/landing/ai-section";
import { TaskSection } from "@/components/landing/task-section";
import { DocSection } from "@/components/landing/doc-section";
import { ClientsSection } from "@/components/landing/clients-section";
import { FeatureTabSwitcher } from "@/components/landing/feature-tab-switcher";
import { CtaSection } from "@/components/landing/cta-section";
import { CommunicationSection } from "@/components/landing/communication-section";
import { VisionSection } from "@/components/landing/vision-section";

export function HomePage() {
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <>
      <AnimatedHomeHero />

      <LogoCloud />

      <ProblemSection locale={locale} />

      <SolutionSection locale={locale} />

      <AISection locale={locale} />

      <TaskSection locale={locale} />

      <DocSection locale={locale} />

      <ClientsSection locale={locale} />

      <FeatureTabSwitcher locale={locale} />

      <CommunicationSection locale={locale} />

      <VisionSection locale={locale} />

      <Faq02 />

      <CtaSection />
    </>
  );
}
