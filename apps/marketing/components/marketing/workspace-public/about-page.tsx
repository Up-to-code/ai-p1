"use client";

import { useLocale, useTranslations } from "next-intl";

import { Sparkles, ShieldCheck, UsersRound } from "lucide-react";

import {
  CtaBanner,
  FeatureCardGrid,
  PageShell,
  PublicSection,
  StatsGrid,
} from "@/components/design-system";
import { FounderSection } from "@/components/landing/founder-section";
import { Storyline } from "@/components/landing/storyline";
import { Reveal } from "@/components/landing/cinematic-motion";
import { AuroraShaders } from "@/components/ui/aurora";

type PrincipleItem = {
  title: string;
  description: string;
};

type SignalItem = {
  label: string;
  value: string;
  helper: string;
};

export function WorkspaceAboutPage() {
  const t = useTranslations("Landing.about");
  const locale = useLocale();
  const isAr = locale === "ar";

  const signals = t.raw("signals") as Record<string, SignalItem>;
  const principlesRaw = t.raw("principles.items") as PrincipleItem[];

  const principles = principlesRaw.map((p, i) => ({
    ...p,
    icon: [Sparkles, ShieldCheck, UsersRound][i % 3],
  }));

  return (
    <PageShell className="relative isolate">
      <AuroraShaders
        aria-hidden="true"
        className="absolute left-1/2 top-[-20%] -z-10 h-[800px] w-[1400px] -translate-x-1/2 opacity-30 blur-3xl dark:opacity-20"
        intensity={0.5}
        speed={0.4}
        vibrancy={0.8}
      />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="border-b border-[var(--q-border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--q-accent)]">
              {t("hero.eyebrow")}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-6xl md:leading-[0.94]">
              {t("hero.title")}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 mx-auto max-w-2xl text-base font-medium leading-8 text-[var(--q-text-secondary)]">
              {t("hero.description")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Stats grid (signals) ───────────────────────────── */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <StatsGrid
              items={[
                { value: signals.source.value, label: signals.source.label, tag: signals.source.helper },
                { value: signals.roles.value, label: signals.roles.label, tag: signals.roles.helper },
                { value: signals.trust.value, label: signals.trust.label, tag: signals.trust.helper },
              ]}
            />
          </Reveal>
        </div>
      </section>

      {/* ── Storyline ───────────────────────────────────────── */}
      <Storyline />

      {/* ── Principles ──────────────────────────────────────── */}
      <PublicSection tone="secondary">
        <div className="mx-auto max-w-4xl text-center mb-14">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--q-accent)]">
              {t("principles.eyebrow")}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-4xl">
              {t("principles.title")}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-3 text-sm font-medium text-[var(--q-text-secondary)]">
              {t("principles.description")}
            </p>
          </Reveal>
        </div>
        <FeatureCardGrid items={principles} />
      </PublicSection>

      {/* ── Operating philosophy ────────────────────────────── */}
      <PublicSection>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
            <Reveal>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--q-accent)]">
                  {t("operating.eyebrow")}
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-4xl">
                  {t("operating.title")}
                </h2>
                <p className="mt-4 text-sm font-medium leading-7 text-[var(--q-text-secondary)] md:text-base">
                  {t("operating.description")}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="rounded-3xl border border-[var(--q-border)] bg-[var(--q-card)] p-6 md:p-8">
                <div className="space-y-5">
                  {[
                    {
                      label: isAr ? "عناصر تحكم المنتج" : "Product controls",
                      desc: isAr
                        ? "أزرار وحالات ومؤشرات حقيقية من مساحة العمل"
                        : "Real buttons, statuses, and indicators from the workspace",
                    },
                    {
                      label: isAr ? "معاينات حية" : "Live previews",
                      desc: isAr
                        ? "بطاقات المشاريع والعملاء تعرض بيانات محدثة في الوقت الفعلي"
                        : "Project and client cards show up-to-date data in real time",
                    },
                    {
                      label: isAr ? "مسارات مخصصة" : "Audience routes",
                      desc: isAr
                        ? "كل زائر يرى ما يناسب دوره واحتياجاته"
                        : "Each visitor sees what fits their role and needs",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--q-accent)]/15">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[var(--q-accent)]"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--q-text-primary)]">
                          {item.label}
                        </p>
                        <p className="text-xs text-[var(--q-text-secondary)]">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </PublicSection>

      {/* ── Founders ─────────────────────────────────────────── */}
      <FounderSection />

      {/* ── CTA ──────────────────────────────────────────────── */}
      <PublicSection tone="default" className="!pb-20 md:!pb-28 !pt-0">
        <CtaBanner
          eyebrow={t("cta.eyebrow")}
          title={t("cta.title")}
          description={t("cta.description")}
          primaryLabel={t("cta.primary")}
          primaryHref="/dashboard"
          secondaryLabel={t("cta.secondary")}
          secondaryHref="/contact"
        />
      </PublicSection>
    </PageShell>
  );
}


