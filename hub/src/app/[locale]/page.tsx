"use client";

import { ArrowRight, Building2, CalendarClock, CheckCircle2, FileCheck2, MessageSquareText, Search, ShieldCheck, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { Footer } from "@/components/landing/footer";
import { Navbar } from "@/components/landing/navbar";
import {
  AudiencePanel,
  CtaPanel,
  LandingButton,
  PublicSection,
  SectionIntro,
  SignalCard,
  WorkflowList,
  WorkspacePreview,
  type WorkspacePreviewLabels,
} from "@/components/landing/public-landing-kit";

type HomeAudience = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: string;
  stats: Array<{ label: string; value: string }>;
};

type WorkflowItem = {
  title: string;
  description: string;
};

export default function InstitutionalLanding() {
  const t = useTranslations("Landing.home");
  const preview = t.raw("preview") as WorkspacePreviewLabels;
  const audiences = t.raw("audiences.items") as HomeAudience[];
  const workflow = t.raw("workflow.items") as WorkflowItem[];

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <Navbar />

      <main className="flex-1 pt-16">
        <PublicSection className="relative overflow-hidden border-b border-white/10 pt-16 md:pt-24">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_20%_0%,rgba(75,85,255,0.32),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_24%)]" />
          <div className="relative mx-auto max-w-5xl text-center">
            <div className="mx-auto max-w-4xl space-y-7">
              <div className="flex items-center justify-center gap-3">
                <span className="h-px w-8 bg-white/15" />
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400">{t("hero.eyebrow")}</span>
                <span className="h-px w-8 bg-white/15" />
              </div>
              <div className="space-y-5">
                <h1 className="text-4xl font-semibold leading-none tracking-tight text-white md:text-6xl xl:text-7xl">
                  {t("hero.title")}
                </h1>
                <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed text-zinc-400 md:text-lg">
                  {t("hero.description")}
                </p>
              </div>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <LandingButton href="/dashboard">
                  {t("hero.primary")}
                  <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                </LandingButton>
                <LandingButton href="/contact" variant="secondary">
                  {t("hero.secondary")}
                </LandingButton>
              </div>
            </div>
            <div className="mx-auto mt-14 max-w-5xl">
              <WorkspacePreview labels={preview} />
            </div>
            <div className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
              <SignalCard label={t("signals.projects.label")} value={t("signals.projects.value")} helper={t("signals.projects.helper")} tone="blue" icon={Building2} />
              <SignalCard label={t("signals.approvals.label")} value={t("signals.approvals.value")} helper={t("signals.approvals.helper")} tone="amber" icon={FileCheck2} />
              <SignalCard label={t("signals.leads.label")} value={t("signals.leads.value")} helper={t("signals.leads.helper")} tone="green" icon={UsersRound} />
            </div>
          </div>
        </PublicSection>

        <PublicSection tone="muted">
          <div className="space-y-10">
            <SectionIntro eyebrow={t("audiences.eyebrow")} title={t("audiences.title")} description={t("audiences.description")} />
            <div className="grid gap-5 xl:grid-cols-2">
              {audiences.map((audience) => (
                <AudiencePanel key={audience.href} {...audience} />
              ))}
            </div>
          </div>
        </PublicSection>

        <PublicSection>
          <div className="space-y-10">
            <SectionIntro eyebrow={t("workflow.eyebrow")} title={t("workflow.title")} description={t("workflow.description")} align="center" />
            <WorkflowList
              items={[
                { ...workflow[0], icon: Search },
                { ...workflow[1], icon: ShieldCheck },
                { ...workflow[2], icon: MessageSquareText },
              ]}
            />
          </div>
        </PublicSection>

        <PublicSection tone="muted">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <SectionIntro eyebrow={t("operations.eyebrow")} title={t("operations.title")} description={t("operations.description")} />
            <div className="grid gap-3 sm:grid-cols-2">
              <SignalCard label={t("operations.cards.inventory.label")} value={t("operations.cards.inventory.value")} helper={t("operations.cards.inventory.helper")} icon={CheckCircle2} tone="green" />
              <SignalCard label={t("operations.cards.calendar.label")} value={t("operations.cards.calendar.value")} helper={t("operations.cards.calendar.helper")} icon={CalendarClock} tone="blue" />
              <SignalCard label={t("operations.cards.comms.label")} value={t("operations.cards.comms.value")} helper={t("operations.cards.comms.helper")} icon={MessageSquareText} tone="zinc" />
              <SignalCard label={t("operations.cards.compliance.label")} value={t("operations.cards.compliance.value")} helper={t("operations.cards.compliance.helper")} icon={ShieldCheck} tone="amber" />
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
      </main>

      <Footer />
    </div>
  );
}
