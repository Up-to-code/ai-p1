"use client";

import { CalendarClock, CheckCircle2, Home, MessageSquareText, Search, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { CtaBand, FeatureGrid, ImageStatsPanel, MetricCard, PublicHero, PublicSection, SectionHeader } from "@/components/landing/public-page-shell";

type BrokerWorkflow = {
  title: string;
  description: string;
};

export default function BrokerPage() {
  const t = useTranslations("Landing.broker");
  const workflow = t.raw("workflow.items") as BrokerWorkflow[];

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
          <MetricCard label={t("signals.clients.label")} value={t("signals.clients.value")} helper={t("signals.clients.helper")} icon={UsersRound} tone="green" />
          <MetricCard label={t("signals.followups.label")} value={t("signals.followups.value")} helper={t("signals.followups.helper")} icon={CalendarClock} tone="blue" />
          <MetricCard label={t("signals.inventory.label")} value={t("signals.inventory.value")} helper={t("signals.inventory.helper")} icon={Home} tone="zinc" />
          <MetricCard label={t("signals.ready.label")} value={t("signals.ready.value")} helper={t("signals.ready.helper")} icon={CheckCircle2} tone="amber" />
        </div>
      </PublicHero>

      <PublicSection muted>
        <ImageStatsPanel
          eyebrow={t("panel.eyebrow")}
          title={t("panel.title")}
          description={t("panel.description")}
          image="/images/projects/residential.png"
          stats={[
            { label: t("panel.stats.matches.label"), value: t("panel.stats.matches.value") },
            { label: t("panel.stats.viewings.label"), value: t("panel.stats.viewings.value") },
            { label: t("panel.stats.context.label"), value: t("panel.stats.context.value") },
          ]}
        />
      </PublicSection>

      <PublicSection>
        <div className="space-y-10">
          <SectionHeader eyebrow={t("workflow.eyebrow")} title={t("workflow.title")} description={t("workflow.description")} />
          <FeatureGrid
            items={[
              { ...workflow[0], icon: Search },
              { ...workflow[1], icon: MessageSquareText },
              { ...workflow[2], icon: CalendarClock },
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
