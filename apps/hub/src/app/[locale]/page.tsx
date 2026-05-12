"use client";

import { ArrowRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import CTA from "@/components/cta";
import Footer from "@/components/footer";
import { Faq02 } from "@/components/landing/faq-02";
import { Reveal } from "@/components/landing/cinematic-motion";
import { Navbar } from "@/components/landing/navbar";
import { Pricing03 } from "@/components/landing/pricing-03";
import { LandingButton, PublicSection } from "@/components/landing/public-landing-kit";
import Integrations from "@/components/integrations";
import LogoCloud from "@/components/logo-cloud";
import { AuroraShaders } from "@/components/ui/aurora";
import { cn } from "@/lib/utils";

export default function InstitutionalLanding() {
  const t = useTranslations("Landing.home");
  const locale = useLocale();
  const isAr = locale === "ar";

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden border-b border-zinc-200/70 pb-20 pt-28 dark:border-white/[0.08] md:pb-24 md:pt-32">
          <div className="pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2 overflow-hidden" aria-hidden="true">
            <AuroraShaders
              speed={0.42}
              intensity={1.45}
              vibrancy={1.18}
              frequency={0.78}
              stretch={1.6}
              className="absolute left-1/2 top-[-14%] h-[74vh] min-h-[560px] w-[136vw] -translate-x-1/2 opacity-55 [mask-image:linear-gradient(to_bottom,black_0%,black_62%,transparent_100%)] dark:opacity-80"
            />
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,249,252,0.2),var(--color-background)_78%)] dark:bg-[linear-gradient(to_bottom,rgba(10,10,10,0.16),var(--color-background)_82%)]" />
            <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.24),transparent_66%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.34),transparent_68%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(11,92,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(11,92,255,0.05)_1px,transparent_1px)] bg-[size:80px_80px] opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_80%)] dark:opacity-20" />
          </div>
          <div className="relative mx-auto flex max-w-7xl flex-col justify-start px-6 py-12 md:py-20">
            <div className="max-w-4xl">
              <div className="flex flex-col items-start text-start">
                <Reveal>
                  <h1 className={cn(
                    "text-[clamp(2.5rem,8vw,5.5rem)] font-bold text-zinc-950 dark:text-white",
                    isAr ? "leading-[1.3] tracking-normal" : "leading-[0.92] tracking-tighter"
                  )}>
                    {t("hero.title")}
                  </h1>
                  <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-xl">
                    {t("hero.description")}
                  </p>
                  <div className="mt-10 flex w-full flex-col gap-5 sm:w-auto sm:flex-row">
                    <LandingButton href="/dashboard" className="h-14 rounded-full bg-zinc-900 px-10 text-[15px] font-bold text-white shadow-2xl shadow-zinc-900/20 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
                      {t("hero.primary")}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </LandingButton>
                    <LandingButton href="/contact" variant="secondary" className="h-14 rounded-full border-zinc-200 bg-white px-10 text-[15px] font-bold backdrop-blur-sm transition-all hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10">
                      {t("hero.secondary")}
                    </LandingButton>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

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
