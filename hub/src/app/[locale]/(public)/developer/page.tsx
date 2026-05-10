"use client";

import { Building2, FileCheck2, ShieldCheck, TrendingUp, Wifi } from "lucide-react";
import { useTranslations } from "next-intl";

import { CtaBand, FeatureGrid, ImageStatsPanel, MetricCard, PublicHero, PublicSection, SectionHeader } from "@/components/landing/public-page-shell";

type DeveloperWorkflow = {
  title: string;
  description: string;
};

export default function DeveloperPage() {
  const t = useTranslations("Landing.developer");
  const workflow = t.raw("workflow.items") as DeveloperWorkflow[];

  return (
    <>
      <PublicHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
        actions={[
          { href: "/dashboard", label: t("hero.primary") },
          { href: "/contact", label: t("hero.secondary"), variant: "secondary" },
        ]}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard label={t("signals.inventory.label")} value={t("signals.inventory.value")} helper={t("signals.inventory.helper")} icon={Building2} tone="blue" />
          <MetricCard label={t("signals.approvals.label")} value={t("signals.approvals.value")} helper={t("signals.approvals.helper")} icon={FileCheck2} tone="amber" />
          <MetricCard label={t("signals.sync.label")} value={t("signals.sync.value")} helper={t("signals.sync.helper")} icon={Wifi} tone="green" />
          <MetricCard label={t("signals.market.label")} value={t("signals.market.value")} helper={t("signals.market.helper")} icon={TrendingUp} tone="zinc" />
        </div>
      </PublicHero>

      <PublicSection muted>
        <ImageStatsPanel
          eyebrow={t("panel.eyebrow")}
          title={t("panel.title")}
          description={t("panel.description")}
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
          <SectionHeader eyebrow={t("workflow.eyebrow")} title={t("workflow.title")} description={t("workflow.description")} />
          <FeatureGrid
            items={[
              { ...workflow[0], icon: Building2 },
              { ...workflow[1], icon: ShieldCheck },
              { ...workflow[2], icon: Wifi },
            ]}
          />
        </div>
      </PublicSection>

      <PublicSection className="pt-0">
        <CtaBand
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
