"use client";

import { Building2, DatabaseZap, ShieldCheck, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { CtaPanel, PublicSection, SectionIntro, SignalCard, WorkflowList } from "@/components/landing/public-landing-kit";

type AboutPrinciple = {
  title: string;
  description: string;
};

export default function AboutPage() {
  const t = useTranslations("Landing.about");
  const principles = t.raw("principles.items") as AboutPrinciple[];

  return (
    <>
      <PublicSection className="border-b border-white/10 pt-14">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionIntro eyebrow={t("hero.eyebrow")} title={t("hero.title")} description={t("hero.description")} />
          <div className="grid gap-3 sm:grid-cols-3">
            <SignalCard label={t("signals.source.label")} value={t("signals.source.value")} helper={t("signals.source.helper")} icon={DatabaseZap} tone="blue" />
            <SignalCard label={t("signals.roles.label")} value={t("signals.roles.value")} helper={t("signals.roles.helper")} icon={UsersRound} tone="green" />
            <SignalCard label={t("signals.trust.label")} value={t("signals.trust.value")} helper={t("signals.trust.helper")} icon={ShieldCheck} tone="amber" />
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="muted">
        <div className="space-y-10">
          <SectionIntro eyebrow={t("principles.eyebrow")} title={t("principles.title")} description={t("principles.description")} />
          <WorkflowList
            items={[
              { ...principles[0], icon: Building2 },
              { ...principles[1], icon: DatabaseZap },
              { ...principles[2], icon: ShieldCheck },
            ]}
          />
        </div>
      </PublicSection>

      <PublicSection>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 md:p-8">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{t("operating.eyebrow")}</p>
            <h2 className="mt-5 text-3xl font-semibold leading-none tracking-tight text-white md:text-5xl">{t("operating.title")}</h2>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-6 md:p-8">
            <p className="text-base font-medium leading-relaxed text-zinc-300">{t("operating.description")}</p>
          </div>
        </div>
      </PublicSection>

      <PublicSection>
        <CtaPanel
          eyebrow={t("cta.eyebrow")}
          title={t("cta.title")}
          description={t("cta.description")}
          primaryLabel={t("cta.primary")}
          secondaryLabel={t("cta.secondary")}
        />
      </PublicSection>
    </>
  );
}
