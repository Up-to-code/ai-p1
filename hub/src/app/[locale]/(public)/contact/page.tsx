"use client";

import { Building2, Mail, MessageSquareText, Phone, Plug, Send, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ContactMethod, PublicSection, SectionIntro, SignalCard } from "@/components/landing/public-landing-kit";

export default function ContactPage() {
  const t = useTranslations("Landing.contact");

  return (
    <>
      <PublicSection className="border-b border-white/10 pt-14">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <SectionIntro eyebrow={t("hero.eyebrow")} title={t("hero.title")} description={t("hero.description")} />
          <div className="grid gap-3 sm:grid-cols-3">
            <ContactMethod icon={Mail} label={t("methods.email.label")} value={t("methods.email.value")} helper={t("methods.email.helper")} />
            <ContactMethod icon={Phone} label={t("methods.phone.label")} value={t("methods.phone.value")} helper={t("methods.phone.helper")} />
            <ContactMethod icon={MessageSquareText} label={t("methods.workspace.label")} value={t("methods.workspace.value")} helper={t("methods.workspace.helper")} />
          </div>
        </div>
      </PublicSection>

      <PublicSection tone="muted">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-3">
            <SignalCard label={t("routes.developer.label")} value={t("routes.developer.value")} helper={t("routes.developer.helper")} icon={Building2} tone="blue" />
            <SignalCard label={t("routes.broker.label")} value={t("routes.broker.value")} helper={t("routes.broker.helper")} icon={UsersRound} tone="green" />
            <SignalCard label={t("routes.integration.label")} value={t("routes.integration.value")} helper={t("routes.integration.helper")} icon={Plug} tone="amber" />
          </div>

          <form className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 md:p-8">
            <div className="mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">{t("form.eyebrow")}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white">{t("form.title")}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name">{t("form.name")}</Label>
                <Input id="contact-name" className="h-11 rounded-xl border-white/10 bg-black text-white shadow-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">{t("form.email")}</Label>
                <Input id="contact-email" type="email" className="h-11 rounded-xl border-white/10 bg-black text-white shadow-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-team">{t("form.team")}</Label>
                <Input id="contact-team" className="h-11 rounded-xl border-white/10 bg-black text-white shadow-none" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-topic">{t("form.topic")}</Label>
                <Input id="contact-topic" className="h-11 rounded-xl border-white/10 bg-black text-white shadow-none" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="contact-message">{t("form.message")}</Label>
              <textarea
                id="contact-message"
                rows={5}
                className="flex w-full resize-none rounded-xl border border-white/10 bg-black px-4 py-3 text-sm font-medium text-white outline-none transition placeholder:text-zinc-500 focus-visible:ring-2 focus-visible:ring-white/20"
              />
            </div>
            <Button type="button" className="mt-6 h-11 rounded-xl px-6 text-[10px] font-black uppercase tracking-widest">
              <Send className="h-3.5 w-3.5" />
              {t("form.submit")}
            </Button>
          </form>
        </div>
      </PublicSection>
    </>
  );
}
