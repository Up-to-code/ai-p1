import { getTranslations } from "next-intl/server";

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
import { publicPageMetadata } from "@/lib/seo/public-pages";

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  return publicPageMetadata(locale, "home");
}

export default async function InstitutionalLanding({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing.home" });
  const isAr = locale === "ar";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-emerald-500/30">
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

        <WebsiteTemplatesShowcase locale={locale} />

        <WebsiteBuilderConnect locale={locale} />

        <McpAgentsShowcase locale={locale} />

        <Pricing03 locale={locale} />

        <Faq02 />

        <CTA />
      </main>

      <Footer />
    </div>
  );
}
