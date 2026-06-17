"use client";

import { useLocale, useTranslations } from "next-intl";

import CTA from "@/components/cta";
import Footer from "@/components/footer";
import { Faq02 } from "@/components/landing/faq-02";
import { Navbar } from "@/components/landing/navbar";
import { PricingSection } from "@/components/landing/pricing-section";
import { WebsiteBuilderConnect } from "@/components/landing/website-builder-connect";
import { McpAgentsShowcase } from "@/components/landing/mcp-agents-showcase";
import { ProblemSection } from "@/components/landing/problem-section";
import { AppsPlatform } from "@/components/landing/apps-platform";
import { AnimatedHomeHero } from "@/components/landing/animated-home-hero";
import LogoCloud from "@/components/logo-cloud";

export default function InstitutionalLanding() {
  const t = useTranslations("Landing.home");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="flex min-h-screen flex-col bg-background text-text-primary">
      <Navbar />

      <main className="flex-1">
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

        <PricingSection locale={locale} />

        <Faq02 />

        <CTA />
      </main>

      <Footer />
    </div>
  );
}
