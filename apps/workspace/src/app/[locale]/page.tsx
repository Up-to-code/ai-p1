"use client";

import { useLocale, useTranslations } from "next-intl";

import CTA from "@/components/cta";
import Footer from "@/components/footer";
import { Faq02 } from "@/components/landing/faq-02";
import { Reveal } from "@/components/landing/cinematic-motion";
import { Navbar } from "@/components/landing/navbar";
import { Pricing03 } from "@/components/landing/pricing-03";
import { PublicSection } from "@/components/landing/public-landing-kit";
import { AnimatedHomeHero } from "@/components/landing/animated-home-hero";
import Integrations from "@/components/integrations";
import LogoCloud from "@/components/logo-cloud";

export default function InstitutionalLanding() {
  const t = useTranslations("Landing.home");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <AnimatedHomeHero
          eyebrow={t("hero.eyebrow")}
          title={t("hero.title")}
          description={t("hero.description")}
          primaryLabel={t("hero.primary")}
          secondaryLabel={t("hero.secondary")}
          isAr={isAr}
        />

        <LogoCloud />

        {/* 2. THE PROBLEM SECTION */}
        <PublicSection id="solutions" tone="muted">
          <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
            <Reveal>
              <div className="space-y-8">
                <h2 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white md:text-6xl rtl:leading-[1.2]">
                  {isAr ? "العمل العقاري لا يجب أن يكون صعباً." : "Real estate shouldn't be this hard."}
                </h2>
                <p className="text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-xl">
                  {isAr 
                    ? "العمليات اليدوية، البيانات المشتتة، وبطء التنفيذ يكلف الشركات الكثير. حان الوقت للتغيير."
                    : "Manual processes, scattered data, and slow execution are costing you growth. Fragmented workflows are the invisible tax on your business."}
                </p>
                <div className="flex flex-wrap gap-4">
                  {[isAr ? "بيانات مشتتة" : "Scattered Data", isAr ? "بطء في التنفيذ" : "Slow Execution", isAr ? "فقدان الفرص" : "Lost Opportunities"].map(tag => (
                    <span key={tag} className="rounded-full bg-red-500/10 px-4 py-1.5 text-xs font-bold text-red-600 dark:text-red-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-32 rounded-[2rem] bg-zinc-200/50 dark:bg-white/5" />
                ))}
              </div>
            </Reveal>
          </div>
        </PublicSection>

        {/* 3. INTEGRATIONS SECTION */}
        <Integrations />

        <Pricing03 locale={locale} />
        <Faq02 />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
