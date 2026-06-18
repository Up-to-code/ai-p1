"use client";

import { ArrowRight, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { FeatureGrid, PublicSection, SectionKicker } from "@/components/landing/public-page-shell";
import { FounderSection } from "@/components/landing/founder-section";
import { Storyline } from "@/components/landing/storyline";
import { AuroraShaders } from "@/components/ui/aurora";
import { Link } from "@/i18n/routing";

const teamCopy = {
  en: {
    principles: [
      { title: "Product discipline", description: "Every surface is designed around fewer clicks, clearer ownership, and cleaner operational handoffs.", icon: Sparkles },
      { title: "Operational trust", description: "Approvals, audit trails, and data integrity are part of the daily workflow, not afterthoughts.", icon: ShieldCheck },
      { title: "Market proximity", description: "The team stays close to developers, brokers, and operators using the workspace every day.", icon: UsersRound },
    ],
    cta: {
      eyebrow: "Get started",
      title: "Ready to see it in action?",
      description: "Sign in to your workspace and start building with your team today.",
      primary: "Go to workspace",
      secondary: "View pricing",
    },
  },
  ar: {
    principles: [
      { title: "انضباط المنتج", description: "كل سطح مصمم حول نقرات أقل، ملكية أوضح، وتسليمات تشغيلية أنظف.", icon: Sparkles },
      { title: "ثقة تشغيلية", description: "الموافقات وسجلات التدقيق وسلامة البيانات جزء من سير العمل اليومي، وليست تفاصيل لاحقة.", icon: ShieldCheck },
      { title: "قرب من السوق", description: "يبقى الفريق قريبًا من المطورين والوسطاء والمشغلين الذين يستخدمون مساحة العمل كل يوم.", icon: UsersRound },
    ],
    cta: {
      eyebrow: "ابدأ الآن",
      title: "هل أنت مستعد لرؤيتها في العمل؟",
      description: "سجّل الدخول إلى مساحة العمل وابدأ البناء مع فريقك اليوم.",
      primary: "الدخول إلى مساحة العمل",
      secondary: "عرض الأسعار",
    },
  },
};

export function WorkspaceAboutPage() {
  const t = useTranslations("Landing.about");
  const locale = useLocale();
  const team = locale === "ar" ? teamCopy.ar : teamCopy.en;

  return (
    <div className="relative isolate" style={{ background: "var(--q-bg)", fontFamily: "var(--font-sans)" }}>
      <AuroraShaders
        aria-hidden="true"
        className="absolute left-1/2 top-[-20%] -z-10 h-[800px] w-[1400px] -translate-x-1/2 opacity-30 blur-3xl dark:opacity-20"
        intensity={0.5}
        speed={0.4}
        vibrancy={0.8}
      />

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="bg-transparent px-6 pb-4 pt-20 md:pb-6 md:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          <SectionKicker center>{t("hero.eyebrow")}</SectionKicker>
          <h1
            className="mt-8 text-5xl font-bold tracking-tight md:text-7xl md:leading-[0.94] rtl:leading-[1.1]"
            style={{ color: "var(--q-text-primary)" }}
          >
            {t("hero.title")}
          </h1>
          <p
            className="mx-auto mt-8 max-w-2xl text-base font-medium leading-8 md:text-xl rtl:leading-9"
            style={{ color: "var(--q-text-secondary)" }}
          >
            {t("hero.description")}
          </p>
        </div>
      </section>

      <Storyline />

      <div className="border-t" style={{ borderColor: "var(--q-border)" }} />

      <FounderSection />

      {/* ── Principles grid ──────────────────────────── */}
      <PublicSection>
        <FeatureGrid items={team.principles} />
      </PublicSection>

      {/* ── CTA banner ───────────────────────────────── */}
      <section className="px-6 pb-20 md:pb-28">
        <div
          className="mx-auto max-w-5xl overflow-hidden rounded-3xl px-8 py-14 text-center md:px-16"
          style={{ background: "var(--q-text-primary)", color: "var(--q-bg)" }}
        >
          <p
            className="text-[10px] font-black uppercase tracking-[0.28em]"
            style={{ color: "var(--q-accent)" }}
          >
            {team.cta.eyebrow}
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">
            {team.cta.title}
          </h2>
          <p
            className="mx-auto mt-3 max-w-md text-sm font-medium leading-7"
            style={{ opacity: 0.7 }}
          >
            {team.cta.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center gap-2 rounded-full px-7 text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.98]"
              style={{ background: "var(--q-bg)", color: "var(--q-text-primary)" }}
            >
              {team.cta.primary}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-11 items-center gap-2 rounded-full border px-7 text-[11px] font-black uppercase tracking-widest transition-all"
              style={{ borderColor: "rgba(255,255,255,0.2)", color: "var(--q-bg)" }}
            >
              {team.cta.secondary}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
