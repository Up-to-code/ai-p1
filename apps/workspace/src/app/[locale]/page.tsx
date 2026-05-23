"use client";

import { useLocale, useTranslations } from "next-intl";

import CTA from "@/components/cta";
import Footer from "@/components/footer";
import { Faq02 } from "@/components/landing/faq-02";
import { Navbar } from "@/components/landing/navbar";
import { Pricing03 } from "@/components/landing/pricing-03";
import { WebsiteBuilderConnect } from "@/components/landing/website-builder-connect";
import { WebsiteTemplatesShowcase } from "@/components/landing/website-templates-showcase";
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
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION */}
        <AnimatedHomeHero
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          description={t("hero.description")}
          primaryLabel={t("hero.primary")}
          secondaryLabel={t("hero.secondary")}
          isAr={isAr}
        />

        {/* 2. SOCIAL PROOF */}
        <LogoCloud />

        {/* 3. PROBLEM EXPOSITION */}
        <ProblemSection locale={locale} />

        {/* 5. APPS & PARTNER PLATFORM */}
        <AppsPlatform locale={locale} />

        {/* 6. VISUAL SHOWCASE */}
        <WebsiteTemplatesShowcase locale={locale} />

        {/* 6. BUILDER COMPATIBILITY */}
        <WebsiteBuilderConnect locale={locale} />

        {/* 7. AI AGENTS & ADVANCED AUTOMATION */}
        <McpAgentsShowcase locale={locale} />

        {/* 8. SUBSCRIPTION PRICING */}
        <Pricing03 locale={locale} />

        {/* 9. FRICTION HANDLING */}
        <Faq02 />

        {/* 10. CLOSING CALL TO ACTION */}
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
