"use client";

import { Building2, Mail, MessageSquareText, Phone, Plug, Send, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard, PublicHero, PublicSection, SectionHeader } from "@/components/landing/public-page-shell";

export default function ContactPage() {
  const t = useTranslations("Landing.contact");

  return (
    <>
      <PublicHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} description={t("hero.description")}>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <MetricCard icon={Mail} label={t("methods.email.label")} value={t("methods.email.value")} helper={t("methods.email.helper")} tone="blue" />
          <MetricCard icon={Phone} label={t("methods.phone.label")} value={t("methods.phone.value")} helper={t("methods.phone.helper")} tone="green" />
          <MetricCard icon={MessageSquareText} label={t("methods.workspace.label")} value={t("methods.workspace.value")} helper={t("methods.workspace.helper")} tone="zinc" />
        </div>
      </PublicHero>

      <PublicSection muted>
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-4">
            <MetricCard label={t("routes.developer.label")} value={t("routes.developer.value")} helper={t("routes.developer.helper")} icon={Building2} tone="blue" />
            <MetricCard label={t("routes.broker.label")} value={t("routes.broker.value")} helper={t("routes.broker.helper")} icon={UsersRound} tone="green" />
            <MetricCard label={t("routes.integration.label")} value={t("routes.integration.value")} helper={t("routes.integration.helper")} icon={Plug} tone="amber" />
          </div>

          <form className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-[0_30px_120px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/[0.04] md:p-10">
            <SectionHeader eyebrow={t("form.eyebrow")} title={t("form.title")} />
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <Field id="contact-name" label={t("form.name")} />
              <Field id="contact-email" label={t("form.email")} type="email" />
              <Field id="contact-team" label={t("form.team")} />
              <Field id="contact-topic" label={t("form.topic")} />
            </div>
            <div className="mt-5 space-y-2">
              <Label htmlFor="contact-message" className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">
                {t("form.message")}
              </Label>
              <textarea
                id="contact-message"
                rows={5}
                className="flex w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-950 outline-none transition placeholder:text-zinc-400 focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-white/10 dark:bg-black dark:text-white"
              />
            </div>
            <Button type="button" className="mt-7 h-12 rounded-full bg-zinc-950 px-7 text-[11px] font-black uppercase tracking-[0.16em] text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
              <Send className="h-3.5 w-3.5" />
              {t("form.submit")}
            </Button>
          </form>
        </div>
      </PublicSection>
    </>
  );
}

function Field({ id, label, type = "text" }: { id: string; label: string; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 text-sm font-semibold text-zinc-950 shadow-none focus-visible:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-500/10 dark:border-white/10 dark:bg-black dark:text-white"
      />
    </div>
  );
}
