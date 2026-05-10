"use client";

import { ArrowRight, Building2, FileCheck2, ShieldCheck, TrendingUp, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";

import { AudiencePanel, CtaPanel, LandingButton, PublicSection, SectionIntro, SignalCard, WorkflowList } from "@/components/landing/public-landing-kit";

type DeveloperWorkflow = {
  title: string;
  description: string;
};

export default function DeveloperPage() {
  const t = useTranslations("Landing.developer");
  const workflow = t.raw("workflow.items") as DeveloperWorkflow[];

  return (
    <>
      <PublicSection className="border-b border-white/10 pt-14">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="space-y-8">
            <SectionIntro eyebrow={t("hero.eyebrow")} title={t("hero.title")} description={t("hero.description")} />
            <div className="flex flex-col gap-3 sm:flex-row">
              <LandingButton href="/dashboard">
                {t("hero.primary")}
                <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
              </LandingButton>
              <LandingButton href="/contact" variant="secondary">{t("hero.secondary")}</LandingButton>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SignalCard label={t("signals.inventory.label")} value={t("signals.inventory.value")} helper={t("signals.inventory.helper")} icon={Building2} tone="blue" />
            <SignalCard label={t("signals.approvals.label")} value={t("signals.approvals.value")} helper={t("signals.approvals.helper")} icon={FileCheck2} tone="amber" />
            <SignalCard label={t("signals.sync.label")} value={t("signals.sync.value")} helper={t("signals.sync.helper")} icon={Wifi} tone="green" />
            <SignalCard label={t("signals.market.label")} value={t("signals.market.value")} helper={t("signals.market.helper")} icon={TrendingUp} tone="zinc" />
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="muted">
        <AudiencePanel
          eyebrow={t("panel.eyebrow")}
          title={t("panel.title")}
          description={t("panel.description")}
          href="/dashboard"
          image="/images/projects/waterfront.png"
          stats={[
            { label: t("panel.stats.projects.label"), value: t("panel.stats.projects.value") },
            { label: t("panel.stats.units.label"), value: t("panel.stats.units.value") },
            { label: t("panel.stats.health.label"), value: t("panel.stats.health.value") },
          ]}
        />
      </PublicSection>

      <PublicSection>
        <div className="space-y-10">
          <SectionIntro eyebrow={t("workflow.eyebrow")} title={t("workflow.title")} description={t("workflow.description")} />
          <WorkflowList
            items={[
              { ...workflow[0], icon: Building2 },
              { ...workflow[1], icon: ShieldCheck },
              { ...workflow[2], icon: Wifi },
            ]}
          />
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
