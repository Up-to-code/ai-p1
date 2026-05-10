"use client";

import { ArrowRight, CalendarClock, CheckCircle2, Home, MessageSquareText, Search, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { AudiencePanel, CtaPanel, LandingButton, PublicSection, SectionIntro, SignalCard, WorkflowList } from "@/components/landing/public-landing-kit";

type BrokerWorkflow = {
  title: string;
  description: string;
};

export default function BrokerPage() {
  const t = useTranslations("Landing.broker");
  const workflow = t.raw("workflow.items") as BrokerWorkflow[];

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
            <SignalCard label={t("signals.clients.label")} value={t("signals.clients.value")} helper={t("signals.clients.helper")} icon={UsersRound} tone="green" />
            <SignalCard label={t("signals.followups.label")} value={t("signals.followups.value")} helper={t("signals.followups.helper")} icon={CalendarClock} tone="blue" />
            <SignalCard label={t("signals.inventory.label")} value={t("signals.inventory.value")} helper={t("signals.inventory.helper")} icon={Home} tone="zinc" />
            <SignalCard label={t("signals.ready.label")} value={t("signals.ready.value")} helper={t("signals.ready.helper")} icon={CheckCircle2} tone="amber" />
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="muted">
        <AudiencePanel
          eyebrow={t("panel.eyebrow")}
          title={t("panel.title")}
          description={t("panel.description")}
          href="/dashboard"
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
          <SectionIntro eyebrow={t("workflow.eyebrow")} title={t("workflow.title")} description={t("workflow.description")} />
          <WorkflowList
            items={[
              { ...workflow[0], icon: Search },
              { ...workflow[1], icon: MessageSquareText },
              { ...workflow[2], icon: CalendarClock },
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
