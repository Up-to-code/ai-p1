"use client";

import { AlertCircle, ArrowRight, Bot, CalendarClock, Database, Share2, Sparkles, Network } from "lucide-react";
import { useTranslations } from "next-intl";

import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import { 
  LandingButton, 
  WorkspacePreview, 
  AnimatedSection, 
  StaggerContainer, 
  StaggerItem,
  type WorkspacePreviewLabels 
} from "@/components/landing/public-landing-kit";

export default function InstitutionalLanding() {
  const t = useTranslations("Landing.home");
  const preview = t.raw("preview") as WorkspacePreviewLabels;

  const anim = {
    hero: {
      title: t("animated.hero.title"),
      description: t("animated.hero.description"),
      primary: t("animated.hero.primary"),
    },
    problems: {
      eyebrow: t("animated.problems.eyebrow"),
      title: t("animated.problems.title"),
      items: [
        t("animated.problems.item1"),
        t("animated.problems.item2"),
        t("animated.problems.item3"),
      ]
    },
    solutions: {
      eyebrow: t("animated.solutions.eyebrow"),
      title: t("animated.solutions.title"),
      description: t("animated.solutions.description"),
    },
    calendar: {
      eyebrow: t("animated.calendar.eyebrow"),
      title: t("animated.calendar.title"),
      description: t("animated.calendar.description"),
    },
    distribution: {
      eyebrow: t("animated.distribution.eyebrow"),
      title: t("animated.distribution.title"),
      description: t("animated.distribution.description"),
      apps: [
        t("animated.distribution.website"),
        t("animated.distribution.agent"),
        t("animated.distribution.market"),
        t("animated.distribution.ai")
      ]
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* 1. HERO SECTION */}
        <section className="relative pt-32 pb-24 md:pt-48 md:pb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(75,85,255,0.4),transparent_60%)] blur-[80px]" />
          </div>

          <AnimatedSection className="relative mx-auto max-w-5xl px-6 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-medium tracking-tight text-white md:text-7xl lg:text-[80px] leading-[1.1]">
              {anim.hero.title}
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-zinc-400">
              {anim.hero.description}
            </p>
            
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <LandingButton href="/dashboard" className="h-12 px-8 bg-white text-black hover:bg-zinc-200">
                {anim.hero.primary}
              </LandingButton>
            </div>
          </AnimatedSection>
        </section>

        {/* WORKSPACE PREVIEW */}
        <AnimatedSection delay={0.2} className="relative mx-auto max-w-[1200px] px-6 pb-32">
          <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black/50 shadow-2xl backdrop-blur-sm">
            <WorkspacePreview labels={preview} />
          </div>
        </AnimatedSection>

        {/* 2. PROBLEMS SECTION */}
        <section className="py-32 relative border-t border-white/5">
          <div className="mx-auto max-w-5xl px-6">
            <AnimatedSection>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-8 bg-red-500/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-red-400">{anim.problems.eyebrow}</span>
              </div>
              <h2 className="text-4xl font-medium tracking-tight text-white md:text-6xl mb-16">
                {anim.problems.title}
              </h2>
            </AnimatedSection>
            
            <StaggerContainer className="grid gap-6 md:grid-cols-3">
              {anim.problems.items.map((item, idx) => (
                <StaggerItem key={idx} className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <AlertCircle className="h-6 w-6 text-red-400 mb-6" />
                  <p className="text-lg font-medium text-zinc-300 leading-relaxed">{item}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* 3. SOLUTIONS AI SECTION */}
        <section className="py-32 relative border-t border-white/5 overflow-hidden">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] -translate-y-1/2 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.4),transparent_70%)] blur-[80px]" />
          </div>
          
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <AnimatedSection>
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-px w-8 bg-sky-500/50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-sky-400">{anim.solutions.eyebrow}</span>
                </div>
                <h2 className="text-4xl font-medium tracking-tight text-white md:text-5xl mb-6">
                  {anim.solutions.title}
                </h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  {anim.solutions.description}
                </p>
              </AnimatedSection>
              
              <AnimatedSection delay={0.2} className="relative h-[400px] rounded-[32px] border border-white/10 bg-white/[0.02] flex items-center justify-center backdrop-blur-md">
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-transparent rounded-[32px]" />
                <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-sky-500/20 flex items-center justify-center animate-pulse shadow-[0_0_40px_rgba(56,189,248,0.3)]">
                    <Sparkles className="h-8 w-8 text-sky-400" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-16 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400 w-full animate-[shimmer_2s_infinite]" />
                    </div>
                    <Database className="h-5 w-5 text-zinc-500" />
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* 4. CALENDAR AI SECTION */}
        <section className="py-32 relative border-t border-white/5 overflow-hidden">
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] -translate-y-1/2 opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.3),transparent_70%)] blur-[80px]" />
          </div>

          <div className="mx-auto max-w-5xl px-6">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <AnimatedSection delay={0.2} className="relative h-[400px] rounded-[32px] border border-white/10 bg-white/[0.02] flex flex-col p-8 backdrop-blur-md md:order-1 order-2">
                <div className="absolute inset-0 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-[32px]" />
                <div className="relative z-10 flex-1 flex flex-col gap-4">
                  <div className="h-10 w-32 rounded-lg bg-white/5 mb-4" />
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/5">
                      <div className="h-10 w-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <CalendarClock className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-2 w-1/2 bg-white/20 rounded-full" />
                        <div className="h-2 w-1/3 bg-white/10 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </AnimatedSection>

              <AnimatedSection className="md:order-2 order-1">
                <div className="flex items-center gap-3 mb-6">
                  <span className="h-px w-8 bg-amber-500/50" />
                  <span className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-400">{anim.calendar.eyebrow}</span>
                </div>
                <h2 className="text-4xl font-medium tracking-tight text-white md:text-5xl mb-6">
                  {anim.calendar.title}
                </h2>
                <p className="text-lg text-zinc-400 leading-relaxed">
                  {anim.calendar.description}
                </p>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* 5. CONNECTED APPS / DISTRIBUTION SECTION */}
        <section className="py-40 relative border-t border-white/5 bg-[#030303] overflow-hidden">
          <div className="absolute inset-0 pointer-events-none bg-[url('/images/noise.png')] opacity-[0.03] mix-blend-overlay" />
          
          <div className="mx-auto max-w-5xl px-6 text-center">
            <AnimatedSection>
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="h-px w-8 bg-emerald-500/50" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-emerald-400">{anim.distribution.eyebrow}</span>
                <span className="h-px w-8 bg-emerald-500/50" />
              </div>
              <h2 className="text-4xl font-medium tracking-tight text-white md:text-6xl mb-6 max-w-3xl mx-auto">
                {anim.distribution.title}
              </h2>
              <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-20">
                {anim.distribution.description}
              </p>
            </AnimatedSection>

            <div className="relative flex justify-center items-center max-w-4xl mx-auto h-[300px]">
              {/* Central Hub */}
              <AnimatedSection delay={0.4} className="absolute z-20">
                <div className="h-32 w-32 rounded-full border border-white/10 bg-black flex items-center justify-center shadow-[0_0_80px_rgba(16,185,129,0.3)]">
                  <Database className="h-10 w-10 text-emerald-400" />
                </div>
              </AnimatedSection>

              {/* Connecting Lines & Endpoints */}
              <StaggerContainer className="absolute inset-0 w-full h-full">
                {anim.distribution.apps.map((app, idx) => {
                  // Position nodes in a circle
                  const angle = (idx * (360 / anim.distribution.apps.length)) * (Math.PI / 180);
                  const radius = 200;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;

                  return (
                    <StaggerItem key={idx} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div 
                        className="absolute h-px bg-gradient-to-r from-emerald-500/50 to-transparent origin-left"
                        style={{ 
                          width: `${radius}px`,
                          transform: `rotate(${angle}rad)`,
                        }}
                      />
                      <div 
                        className="absolute flex items-center gap-3 bg-[#0a0a0a] border border-white/10 px-6 py-4 rounded-2xl shadow-xl whitespace-nowrap"
                        style={{ 
                          transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
                        }}
                      >
                        <Network className="h-5 w-5 text-emerald-400" />
                        <span className="font-semibold text-sm">{app}</span>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-32 border-t border-white/5">
          <AnimatedSection className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-4xl font-medium tracking-tight text-white md:text-6xl">
              {t("cta.title")}
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-zinc-400">
              {t("cta.description")}
            </p>
            <div className="mt-10">
              <LandingButton href="/dashboard" className="h-12 px-8 bg-white text-black hover:bg-zinc-200">
                {t("cta.primary")}
              </LandingButton>
            </div>
          </AnimatedSection>
        </section>

      </main>
      <Footer />
    </div>
  );
}

