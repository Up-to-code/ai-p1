import { notFound } from "next/navigation";

import { AnimatedHomeHero } from "@/components/landing/animated-home-hero";
import { AISection } from "@/components/landing/ai-section";
import { ClientsSection } from "@/components/landing/clients-section";
import { CommunicationSection } from "@/components/landing/communication-section";
import { CtaSection } from "@/components/landing/cta-section";
import { DocSection } from "@/components/landing/doc-section";
import { Faq02 } from "@/components/landing/faq-02";
import { FeatureTabSwitcher } from "@/components/landing/feature-tab-switcher";
import LogoCloud from "@/components/logo-cloud";
import { ProblemSection } from "@/components/landing/problem-section";
import { SolutionSection } from "@/components/landing/solution-section";
import { TaskSection } from "@/components/landing/task-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { VisionSection } from "@/components/landing/vision-section";
import { isLocale } from "@/lib/content";

// Revalidate every hour — content changes rarely.
export const revalidate = 3600;

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

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

      <TestimonialsSection />

      <Faq02 />

      <CtaSection />
    </>
  );
}
