"use client";

import { Minus, MessageCircle, BarChart3, Users2, ChevronRight, Sparkles, Target } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

import { Section } from "@/components/landing/core/section";
import { PageHero } from "@/components/landing/core/page-hero";
import { ButtonLink } from "@/components/landing/core/button-link";
import { ActionRow } from "@/components/landing/core/action-row";
import { SectionLabel } from "@/components/landing/core/section-label";
import { FeatureCardGrid } from "@/components/landing/core/feature-card-grid";
import { FadeIn } from "@/components/landing/core/fade-in";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

import {
  AiIntelligenceVisual,
  BrokerNetworkVisual,
  BuyerIntelligenceVisual,
  ConvergenceFieldVisual,
  DeveloperPulseVisual,
} from "@/components/landing/visuals/landing-visuals";

export default function InstitutionalLanding() {
  const t = useTranslations("Landing.hero");

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <Section bg="slate" className="relative overflow-hidden pt-40 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vectors/landing/hero_grid.svg" className="h-full w-full object-cover" alt="" />
          </div>

          <FadeIn className="relative z-10 mx-auto max-w-5xl space-y-12">
            <PageHero
              contentClassName="space-y-12"
              badge={
                <div className="flex items-center justify-center gap-4">
                  <Minus className="h-6 w-6 text-blue-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500">
                    {t("badge")}
                  </span>
                  <Minus className="h-6 w-6 text-blue-600" />
                </div>
              }
              title={t("title")}
              titleClassName="text-[clamp(2.5rem,8vw,6rem)] font-black uppercase leading-[1.1] tracking-tighter text-slate-900 dark:text-slate-100"
              description={t("description")}
              descriptionClassName="mx-auto max-w-2xl border-r-4 border-blue-600 pr-6 text-right text-xl font-bold leading-relaxed text-slate-600 dark:text-slate-300 md:text-2xl ltr:border-r-0 ltr:border-l-4 ltr:pr-0 ltr:pl-6 ltr:text-left"
              actions={
                <ActionRow className="flex flex-col items-center justify-center gap-8 pt-6 sm:flex-row">
                  <ButtonLink href="/dashboard" variant="primary" className="px-12 py-5">{t("openWorkspace")}</ButtonLink>
                  <ButtonLink href="/about" variant="outline" className="border-slate-200 px-12 py-5 dark:border-slate-700">{t("learnMore")}</ButtonLink>
                </ActionRow>
              }
              visual={
                <div className="relative mx-auto mt-12 w-full max-w-[500px] aspect-square">
                   <Image 
                     src="/images/central-hub.png" 
                     alt="Anan Hub" 
                     fill 
                     className="object-contain" 
                     sizes="(max-width: 768px) 100vw, 500px"
                   />
                </div>
              }
            />
          </FadeIn>
        </Section>

        {/* BUYERS / HOW TO START */}
        <Section id="buyers" border>
          <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
            <div className="space-y-12">
              <SectionLabel
                icon={MessageCircle}
                className="inline-flex items-center gap-3 border-r-4 border-blue-600 bg-blue-50 px-4 py-2 ltr:border-r-0 ltr:border-l-4"
                iconClassName="h-5 w-5 text-blue-600"
                textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
              >
                {t("howToStart")}
              </SectionLabel>
              <h2 className="text-5xl font-black leading-[1.2] text-slate-900 dark:text-slate-100">{t("journeyTitle")}</h2>
              <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
                {t("journeyDesc")}
              </p>
              <FeatureCardGrid
                className="grid grid-cols-1 gap-8 pt-4 sm:grid-cols-2"
                items={[
                  { title: t("quickIntro"), description: t("quickIntroDesc") },
                  { title: t("directTransition"), description: t("directTransitionDesc") },
                ]}
              />
              <ButtonLink href="/dashboard" variant="dark">
                {t("openWorkspace")} <ChevronRight className="h-4 w-4 ltr:rotate-0 rtl:rotate-180" />
              </ButtonLink>
            </div>
            <BuyerIntelligenceVisual />
          </div>
        </Section>

        {/* DEVELOPERS */}
        <Section bg="dark" id="developers">
          <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
            <DeveloperPulseVisual />
            <div className="order-1 space-y-12 text-right lg:order-2 ltr:text-left">
              <SectionLabel
                icon={BarChart3}
                className="inline-flex items-center gap-3 border-r-4 border-blue-500 bg-blue-600/10 px-4 py-2 ltr:border-r-0 ltr:border-l-4"
                iconClassName="h-5 w-5 text-blue-500"
                textClassName="text-xs font-black uppercase tracking-widest text-blue-400"
              >
                {t("forDevelopers")}
              </SectionLabel>
              <h2 className="text-5xl font-black leading-[1.2] text-white">{t("devTitle")}</h2>
              <p className="text-xl font-bold leading-relaxed text-slate-400">
                {t("devDesc")}
              </p>
              <FeatureCardGrid
                className="grid grid-cols-1 gap-6 pt-4"
                items={[
                  {
                    variant: "dark",
                    title: t("devCardTitle"),
                    description: t("devCardDesc"),
                  },
                ]}
              />
              <ButtonLink href="/developer" variant="primary">
                {t("forDevelopers")} <ChevronRight className="h-4 w-4 ltr:rotate-0 rtl:rotate-180" />
              </ButtonLink>
            </div>
          </div>
        </Section>

        {/* BROKERS */}
        <Section id="brokers">
          <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
            <div className="space-y-12">
              <SectionLabel
                icon={Users2}
                className="inline-flex items-center gap-3 border-r-4 border-slate-900 bg-slate-100 px-4 py-2 ltr:border-r-0 ltr:border-l-4"
                iconClassName="h-5 w-5 text-slate-900"
                textClassName="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-slate-100"
              >
                {t("forBrokers")}
              </SectionLabel>
              <h2 className="text-5xl font-black leading-[1.2] text-slate-900 dark:text-slate-100">{t("brokerTitle")}</h2>
              <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
                {t("brokerDesc")}
              </p>
              <FeatureCardGrid
                className="grid grid-cols-1 gap-8 pt-4 sm:grid-cols-2"
                items={[
                  { title: t("brokerCard1"), description: t("brokerCard1Desc") },
                  { title: t("brokerCard2"), description: t("brokerCard2Desc") },
                ]}
              />
              <ButtonLink href="/broker" variant="dark">
                {t("forBrokers")} <ChevronRight className="h-4 w-4 ltr:rotate-0 rtl:rotate-180" />
              </ButtonLink>
            </div>
            <BrokerNetworkVisual />
          </div>
        </Section>

        {/* CONVERGENCE */}
        <Section bg="white" id="convergence" className="py-40">
          <div className="mx-auto max-w-[1400px] space-y-24 text-center">
            <div className="space-y-6">
              <SectionLabel
                icon={Target}
                className="mx-auto inline-flex items-center gap-3 border-r-4 border-blue-600 bg-slate-900 px-4 py-2 ltr:border-r-0 ltr:border-l-4"
                iconClassName="h-5 w-5 text-blue-500"
                textClassName="text-xs font-black uppercase tracking-widest text-white dark:text-slate-100"
              >
                {t("howWeWork")}
              </SectionLabel>
              <h2 className="text-6xl font-black uppercase leading-tight text-slate-900 dark:text-slate-100">{t("convergenceTitle")}</h2>
              <p className="mx-auto max-w-2xl text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
                {t("convergenceDesc")}
              </p>
            </div>

            <div className="mx-auto max-w-3xl">
              <ConvergenceFieldVisual />
            </div>

            <div className="grid grid-cols-2 gap-12 pt-20 lg:grid-cols-4">
              {[
                { label: t("forDevelopers"), desc: t("devCardTitle") },
                { label: t("forBrokers"), desc: t("brokerCard1") },
                { label: t("howWeWork"), desc: t("journeyTitle") },
                { label: t("learnMore"), desc: t("badge") },
              ].map((item, i) => (
                <div key={i} className="group space-y-4 border-2 border-slate-100 p-8 transition-colors hover:border-blue-600 dark:border-slate-800">
                  <span className="block text-xl font-black text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-300">{item.label}</span>
                  <span className="block text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* AI INTELLIGENCE */}
        <Section bg="white" id="ai-intelligence" border>
          <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
            <AiIntelligenceVisual />
            <div className="space-y-12 text-right ltr:text-left">
              <SectionLabel
                icon={Sparkles}
                className="inline-flex items-center gap-3 border-r-4 border-blue-600 bg-blue-50 px-4 py-2 ltr:border-r-0 ltr:border-l-4"
                iconClassName="h-5 w-5 text-blue-600"
                textClassName="text-xs font-black uppercase tracking-widest text-blue-900 dark:text-blue-200"
              >
                {t("whyAnand")}
              </SectionLabel>
              <h2 className="text-5xl font-black leading-[1.2] text-slate-900 dark:text-slate-100">{t("aiTitle")}</h2>
              <p className="text-xl font-bold leading-relaxed text-slate-500 dark:text-slate-300">
                {t("aiDesc")}
              </p>
              <ButtonLink href="/dashboard" variant="dark">
                {t("openWorkspace")} <ChevronRight className="h-4 w-4 ltr:rotate-0 rtl:rotate-180" />
              </ButtonLink>
            </div>
          </div>
        </Section>

        {/* CTA SECTION */}
        <Section bg="primary" className="relative overflow-hidden border-none py-48 text-center">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vectors/landing/anan_landing_cta_texture_v3.svg" className="h-full w-full object-cover" alt="" />
          </div>
          <div className="relative z-10 mx-auto max-w-4xl space-y-12">
            <h2 className="text-6xl font-black uppercase leading-tight">{t("ctaTitle")}</h2>
            <p className="mx-auto max-w-xl text-xl font-bold leading-relaxed opacity-80">
              {t("ctaDesc")}
            </p>
            <ActionRow className="flex flex-col justify-center gap-8 pt-8 sm:flex-row">
              <ButtonLink href="/dashboard" variant="white" className="min-w-[200px]">{t("openWorkspace")}</ButtonLink>
              <ButtonLink href="/about" variant="outline" className="min-w-[200px] border-white text-white hover:bg-white/10 dark:text-white">{t("learnMore")}</ButtonLink>
            </ActionRow>
          </div>
        </Section>
      </main>

      <Footer />
    </div>
  );
}
