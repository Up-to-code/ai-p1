"use client";

import type { FormEvent } from "react";
import {
  Bot,
  Clock,
  Headphones,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Shield,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageShell } from "@/components/design-system";
import { Reveal } from "@/components/landing/cinematic-motion";

const supportChannels = [
  {
    icon: MessageSquare,
    title: "Live chat",
    description: "Chat with our team in real-time during business hours. Average response under 2 minutes.",
    availability: "Mon–Fri, 9 AM – 6 PM AST",
  },
  {
    icon: Mail,
    title: "Email support",
    description: "Send us a detailed message and get a response within 24 hours. We reply to every inquiry.",
    availability: "Around the clock",
  },
  {
    icon: Headphones,
    title: "Priority support",
    description: "Dedicated account managers for Enterprise plans. Direct line to senior engineers.",
    availability: "24/7 priority queue",
  },
];

const stats = [
  { value: "<2m", label: "Avg. chat response", tag: "fastest in class" },
  { value: "24h", label: "Email turnaround", tag: "or faster" },
  { value: "99.9%", label: "Uptime SLA", tag: "enterprise" },
  { value: "4.9", label: "Customer rating", tag: "out of 5" },
];

const faqItems = [
  {
    q: "What's the best way to get a quick answer?",
    a: "Live chat during business hours gets you the fastest response — usually under 2 minutes. For detailed inquiries, email is best and we respond within 24 hours.",
  },
  {
    q: "Do you offer onboarding support?",
    a: "Yes. All paid plans include onboarding assistance. Enterprise plans come with a dedicated account manager who will guide your team through setup and adoption.",
  },
  {
    q: "Can I schedule a call with the team?",
    a: "Absolutely. Send us a message through the form or email us at hello@qentrah.com and we'll find a time that works for you.",
  },
  {
    q: "Is there a community or forum?",
    a: "Yes! Free plan users have access to our community forum where you can ask questions, share tips, and connect with other Qentrah users.",
  },
];

export function WorkspaceContactPage() {
  const t = useTranslations("Landing.contact");
  const locale = useLocale();
  const isAr = locale === "ar";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const subject = String(data.get("topic") || t("form.eyebrow"));
    const body = [
      `${t("form.name")}: ${data.get("name") || ""}`,
      `${t("form.email")}: ${data.get("email") || ""}`,
      `${t("form.team")}: ${data.get("team") || ""}`,
      "",
      `${t("form.message")}:`,
      data.get("message") || "",
    ].join("\n");

    window.location.href = `mailto:hello@qentrah.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <PageShell>
      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="border-b border-[var(--q-border)] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--q-accent)]">
              {isAr ? "اتصل بنا" : "CONTACT"}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-6xl md:leading-[0.94]">
              {isAr ? "نتطلع إلى التواصل معك" : "We'd love to hear from you"}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-5 mx-auto max-w-lg text-base font-medium leading-8 text-[var(--q-text-secondary)]">
              {isAr
                ? "لديك سؤال، فكرة، أو مشروع؟ فريقنا مستعد للمساعدة. أرسل لنا رسالة وسنعود إليك في أقرب وقت."
                : "Have a question, idea, or project? Our team is ready to help. Send us a message and we'll get back to you promptly."}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="border-b border-[var(--q-border)]">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--q-border)] lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-[var(--q-card)] p-6 text-center sm:p-8"
              >
                <p className="text-3xl font-bold tracking-tight text-[var(--q-text-primary)] sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs font-bold tracking-wider text-[var(--q-text-muted)]">
                  {stat.label}
                </p>
                <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-[var(--q-accent)]">
                  {stat.tag}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact card: form + info ─────────────────────── */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="rounded-3xl border border-[var(--q-border)] bg-[var(--q-card)] p-6 md:p-10">
              <div className="grid gap-10 md:grid-cols-2 md:gap-14">
                {/* ── Form ─────────────────────────────── */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-text-muted)] mb-4">
                      {isAr ? "أرسل رسالة" : "Send a message"}
                    </p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="contact-name" label={t("form.name")} name="name" />
                    <Field id="contact-email" label={t("form.email")} name="email" type="email" />
                    <Field id="contact-team" label={t("form.team")} name="team" />
                    <Field id="contact-topic" label={t("form.topic")} name="topic" />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="contact-message"
                      className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--q-text-muted)]"
                    >
                      {t("form.message")}
                    </Label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      className="flex w-full resize-none rounded-2xl border border-[var(--q-border)] bg-[var(--q-bg-very-light)] px-4 py-3 text-sm font-semibold text-[var(--q-text-primary)] outline-none transition focus-visible:ring-4 focus-visible:ring-[var(--q-accent)]/20"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full px-7 text-[11px] font-black uppercase tracking-[0.16em]"
                    style={{ background: "var(--q-accent)", color: "var(--q-bg)" }}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t("form.submit")}
                  </Button>
                </form>

                {/* ── Contact Info ──────────────────────── */}
                <div className="flex flex-col justify-center space-y-8 md:pl-10 md:border-l md:border-[var(--q-border)]">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-text-muted)] mb-3">
                      {isAr ? "البريد الإلكتروني" : "Email"}
                    </p>
                    <a
                      className="flex items-center gap-3 text-sm font-bold text-[var(--q-text-primary)] transition hover:text-[var(--q-accent)]"
                      href="mailto:hello@qentrah.com"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--q-accent)]/10">
                        <Mail className="h-4 w-4 text-[var(--q-accent)]" />
                      </div>
                      hello@qentrah.com
                    </a>
                    <p className="mt-1.5 text-xs text-[var(--q-text-muted)] ml-12">
                      {isAr ? "نرد خلال 24 ساعة" : "We reply within 24 hours"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-text-muted)] mb-3">
                      {isAr ? "الهاتف" : "Phone"}
                    </p>
                    <a
                      className="flex items-center gap-3 text-sm font-bold text-[var(--q-text-primary)] transition hover:text-[var(--q-accent)]"
                      href="tel:+966110000000"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--q-accent)]/10">
                        <Phone className="h-4 w-4 text-[var(--q-accent)]" />
                      </div>
                      +966 11 XXX XXXX
                    </a>
                    <p className="mt-1.5 text-xs text-[var(--q-text-muted)] ml-12">
                      {isAr ? "الأحد – الخميس، 9 ص – 6 م" : "Sun – Thu, 9 AM – 6 PM AST"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-text-muted)] mb-3">
                      {isAr ? "المقر" : "Office"}
                    </p>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--q-accent)]/10">
                        <MapPin className="h-4 w-4 text-[var(--q-accent)]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[var(--q-text-primary)]">
                          {isAr ? "القاهرة، مصر" : "Cairo, Egypt"}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--q-text-muted)]">
                          {isAr ? "المقر الرئيسي" : "Headquarters"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Support channels ──────────────────────────────── */}
      <section className="border-t border-[var(--q-border)] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <Reveal>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--q-accent)]">
                {isAr ? "قنوات الدعم" : "SUPPORT CHANNELS"}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-4xl">
                {isAr ? "كيف يمكننا مساعدتك؟" : "How can we help you?"}
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-3 text-sm font-medium text-[var(--q-text-secondary)]">
                {isAr
                  ? "اختر القناة التي تناسبك — كلها تراقب وتُرد."
                  : "Pick the channel that works for you — they're all monitored and responded to."}
              </p>
            </Reveal>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {supportChannels.map((channel, i) => (
              <Reveal key={channel.title} delay={0.1 * (i + 1)}>
                <div className="rounded-3xl border border-[var(--q-border)] bg-[var(--q-card)] p-6 transition-all hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--q-accent)]/10">
                    <channel.icon className="h-5 w-5 text-[var(--q-accent)]" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-[var(--q-text-primary)]">
                    {channel.title}
                  </h3>
                  <p className="mt-2 text-sm font-medium leading-7 text-[var(--q-text-secondary)]">
                    {channel.description}
                  </p>
                  <p className="mt-4 text-[10px] font-black uppercase tracking-wider text-[var(--q-accent)]">
                    {channel.availability}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="border-t border-[var(--q-border)] bg-[var(--q-bg-secondary)] px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-14">
            <Reveal>
              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-[var(--q-accent)]">
                {isAr ? "أسئلة شائعة" : "FAQ"}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-4xl">
                {isAr ? "أسئلة متكررة" : "Frequently asked questions"}
              </h2>
            </Reveal>
          </div>

          <div className="space-y-3">
            {faqItems.map((item, i) => (
              <Reveal key={item.q} delay={0.05 * (i + 1)}>
                <details className="group rounded-2xl border border-[var(--q-border)] bg-[var(--q-card)] transition-all hover:shadow-sm">
                  <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-sm font-bold text-[var(--q-text-primary)] transition marker:content-none">
                    {item.q}
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="shrink-0 text-[var(--q-text-muted)] transition-transform group-open:rotate-45"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-sm font-medium leading-7 text-[var(--q-text-secondary)]">
                      {item.a}
                    </p>
                  </div>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ─────────────────────────────────────── */}
      <section className="px-6 py-20 md:py-28">
        <Reveal>
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-[var(--q-text-primary)] px-8 py-14 text-center md:px-16">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--q-accent)]">
              {isAr ? "ابدأ الآن" : "GET STARTED"}
            </p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-[var(--q-bg)] md:text-3xl">
              {isAr ? "جاهز لتجربة كانترا؟" : "Ready to try Qentrah?"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-7 text-[var(--q-bg)]/70">
              {isAr
                ? "انشئ مساحة عمل مجانية وابدأ بإدارة مشاريعك وعملائك ووكلاء الذكاء الاصطناعي فوراً."
                : "Create a free workspace and start managing your projects, clients, and AI agents today."}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://app.qentrah.com"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[var(--q-bg)] px-7 text-[11px] font-black uppercase tracking-widest text-[var(--q-text-primary)] transition-all active:scale-[0.98]"
              >
                {isAr ? "الدخول إلى مساحة العمل" : "Go to workspace"}
              </a>
              <a
                href="/pricing"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-7 text-[11px] font-black uppercase tracking-widest text-[var(--q-bg)] transition-all"
              >
                {isAr ? "عرض الأسعار" : "View pricing"}
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </PageShell>
  );
}

function Field({
  id,
  label,
  name,
  type = "text",
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--q-text-muted)]"
      >
        {label}
      </Label>
      <Input
        id={id}
        name={name}
        type={type}
        className="h-12 rounded-2xl text-sm font-semibold shadow-none"
        style={{
          borderColor: "var(--q-border)",
          background: "var(--q-bg-very-light)",
          color: "var(--q-text-primary)",
        }}
      />
    </div>
  );
}
