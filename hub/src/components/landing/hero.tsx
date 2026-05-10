"use client";

import { ArrowRight, Building2, FileCheck2, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { LandingButton, SignalCard, WorkspacePreview, type WorkspacePreviewLabels } from "./public-landing-kit";

export function Hero() {
  const t = useTranslations("Landing.home");
  const preview = t.raw("preview") as WorkspacePreviewLabels;

  return (
    <section className="border-b border-white/10 bg-black px-4 py-16 pt-28 text-white sm:px-6">
      <div className="mx-auto grid max-w-[1400px] items-center gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-white/15" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400">{t("hero.eyebrow")}</span>
          </div>
          <div className="space-y-5">
            <h1 className="text-4xl font-semibold leading-none tracking-tight text-white md:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="max-w-xl text-base font-medium leading-relaxed text-zinc-400 md:text-lg">
              {t("hero.description")}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <LandingButton href="/dashboard">
              {t("hero.primary")}
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
            </LandingButton>
            <LandingButton href="/contact" variant="secondary">{t("hero.secondary")}</LandingButton>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SignalCard label={t("signals.projects.label")} value={t("signals.projects.value")} helper={t("signals.projects.helper")} icon={Building2} tone="blue" />
            <SignalCard label={t("signals.approvals.label")} value={t("signals.approvals.value")} helper={t("signals.approvals.helper")} icon={FileCheck2} tone="amber" />
            <SignalCard label={t("signals.leads.label")} value={t("signals.leads.value")} helper={t("signals.leads.helper")} icon={UsersRound} tone="green" />
          </div>
        </div>
        <WorkspacePreview labels={preview} />
      </div>
    </section>
  );
}
