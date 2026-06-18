"use client";

import { useState } from "react";
import { ArrowRight, Check, Users, Zap, Shield, Bot, Layers, Headphones } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PublicSection } from "@/components/landing/public-landing-kit";
import { cn } from "@/lib/utils";

const PRICE_PER_SEAT = 6.99;

const copy = {
  en: {
    eyebrow: "Simple Pricing",
    title: "One plan. Every feature.",
    description:
      "Everything your team needs — billed per user, per month. No tiers, no hidden fees.",
    priceLabel: "$6.99",
    interval: "/ user / month",
    cta: "Get started",
    guarantee: "30-day money-back guarantee · Secure checkout via DodoPayments",
    seats: "seat",
    seatsPlural: "seats",
    previewLabel: "Price preview",
    seatsHint: "Adjust seats at any time after signing up",
    ownerNote: "Organization owner pays — covers your entire team",
    features: [
      { icon: Layers,     text: "Project, asset & client workspace" },
      { icon: Bot,        text: "AI agents & workflows" },
      { icon: Zap,        text: "All apps & integrations" },
      { icon: Users,      text: "Unlimited team members" },
      { icon: Shield,     text: "Included AI credits" },
      { icon: Headphones, text: "Priority support" },
    ],
  },
  ar: {
    eyebrow: "تسعير بسيط",
    title: "خطة واحدة. كل الميزات.",
    description:
      "كل ما يحتاجه فريقك — بسعر ثابت لكل مستخدم شهرياً. بدون مستويات، بدون رسوم خفية.",
    priceLabel: "$6.99",
    interval: "/ مستخدم / شهر",
    cta: "ابدأ الآن",
    guarantee: "ضمان استرداد 30 يوماً · دفع آمن عبر DodoPayments",
    seats: "مقعد",
    seatsPlural: "مقاعد",
    previewLabel: "معاينة السعر",
    seatsHint: "يمكنك تعديل عدد المقاعد في أي وقت بعد التسجيل",
    ownerNote: "يدفع مالك المؤسسة — يشمل جميع أعضاء الفريق",
    features: [
      { icon: Layers,     text: "مساحة المشاريع والأصول والعملاء" },
      { icon: Bot,        text: "وكلاء الذكاء الاصطناعي وسير العمل" },
      { icon: Zap,        text: "جميع التطبيقات والتكاملات" },
      { icon: Users,      text: "عدد غير محدود من أعضاء الفريق" },
      { icon: Shield,     text: "رصيد AI ضمن الخطة" },
      { icon: Headphones, text: "دعم ذو أولوية" },
    ],
  },
} as const;

export function Pricing03({ locale }: { locale: string }) {
  const t = locale === "ar" ? copy.ar : copy.en;
  const isAr = locale === "ar";
  const [previewSeats, setPreviewSeats] = useState(3);
  const total = (previewSeats * PRICE_PER_SEAT).toFixed(2);

  return (
    <PublicSection id="pricing" tone="very-dark" className="py-20 md:py-32">
      <div className="mx-auto max-w-5xl">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--q-accent-border)] bg-[var(--q-accent-muted)] px-4 py-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--q-accent)]">
              {t.eyebrow}
            </span>
          </div>
          <h2 className="mb-4 text-4xl font-black tracking-tight text-[var(--q-text-primary)] md:text-6xl">
            {t.title}
          </h2>
          <p className="mx-auto max-w-xl text-lg font-medium text-[var(--q-text-secondary)]">
            {t.description}
          </p>
        </div>

        {/* ── Card ───────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border-2 border-[var(--q-accent)] bg-[var(--q-card)] shadow-2xl shadow-[var(--q-accent)]/10">
          {/* Accent top bar */}
          <div className="h-1.5 bg-[var(--q-accent)]" />

          <div className="grid md:grid-cols-2">

            {/* ── Left: price + seat slider ──────────────────── */}
            <div className="space-y-8 p-8 md:p-10">

              {/* Per-seat price */}
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-6xl font-black tracking-tight text-[var(--q-text-primary)]">
                    {t.priceLabel}
                  </span>
                  <span className="text-sm font-bold text-[var(--q-text-secondary)]">
                    {t.interval}
                  </span>
                </div>
                <p className="mt-2 text-[11px] font-bold text-[var(--q-text-secondary)] uppercase tracking-widest">
                  {t.ownerNote}
                </p>
              </div>

              {/* Seat preview — slider + custom input */}
              <div className="rounded-2xl border border-[var(--q-accent)]/20 bg-[var(--q-accent)]/5 p-5 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-accent)]">
                  {t.previewLabel}
                </p>

                {/* Number input + total */}
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={previewSeats}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(999, Number(e.target.value) || 1));
                      setPreviewSeats(v);
                    }}
                    className="w-24 rounded-xl border border-[var(--q-border)] bg-[var(--q-card)] px-3 py-2 text-center text-xl font-black tabular-nums text-[var(--q-text-primary)] focus:border-[var(--q-accent)] focus:outline-none"
                    aria-label={isAr ? "عدد المقاعد" : "Number of seats"}
                  />
                  <span className="text-sm font-bold text-[var(--q-text-secondary)]">
                    {previewSeats === 1 ? t.seats : t.seatsPlural}
                  </span>
                  <span className="ms-auto text-lg font-black text-[var(--q-accent)]">
                    ${total}
                    <span className="text-xs font-bold text-[var(--q-text-secondary)]">
                      {isAr ? " / شهر" : " / mo"}
                    </span>
                  </span>
                </div>

                {/* Slider for quick adjustment up to 50 */}
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={Math.min(previewSeats, 50)}
                  onChange={(e) => setPreviewSeats(Number(e.target.value))}
                  className="w-full accent-[var(--q-accent)]"
                  aria-label={isAr ? "تمرير عدد المقاعد" : "Drag to adjust seats"}
                />
                <div className="flex justify-between text-[10px] font-bold text-[var(--q-text-secondary)]">
                  <span>1</span>
                  <span>50+</span>
                </div>

                <p className="text-[10px] font-medium text-[var(--q-text-secondary)]">
                  {t.seatsHint}
                </p>
              </div>

              {/* CTA */}
              <Link
                href="/sign-up"
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4",
                  "bg-[var(--q-accent)] text-sm font-black uppercase tracking-widest text-white",
                  "shadow-lg shadow-[var(--q-accent)]/25 transition-all duration-200",
                  "hover:bg-[var(--q-accent-hover)] hover:shadow-xl hover:shadow-[var(--q-accent)]/40 active:scale-[0.98]",
                )}
              >
                {t.cta}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Link>

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2 rounded-xl border border-[var(--q-border)] bg-[var(--q-bg-secondary)] px-4 py-3">
                <Check className="h-3.5 w-3.5 shrink-0 text-[var(--q-accent)]" strokeWidth={3} />
                <span className="text-[10px] font-bold text-[var(--q-text-secondary)]">
                  {t.guarantee}
                </span>
              </div>
            </div>

            {/* ── Right: feature list ────────────────────────── */}
            <div className="border-t border-[var(--q-border)] bg-[var(--q-bg-secondary)] p-8 md:border-t-0 md:border-s md:p-10">
              <p className="mb-6 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--q-text-secondary)]">
                {isAr ? "كل ما تحتاجه" : "Everything included"}
              </p>

              <ul className="space-y-4">
                {t.features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[var(--q-accent)]/10">
                      <Icon className="h-3.5 w-3.5 text-[var(--q-accent)]" />
                    </div>
                    <span className="pt-0.5 text-sm font-medium leading-relaxed text-[var(--q-text-primary)]">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Add-ons note */}
              <div className="mt-8 rounded-xl border border-[var(--q-border)] bg-[var(--q-card)] p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--q-accent)]">
                  {isAr ? "إضافات مرنة" : "Flexible add-ons"}
                </p>
                <p className="mt-1 text-xs font-medium text-[var(--q-text-secondary)]">
                  {isAr
                    ? "وسّع رصيد الذكاء الاصطناعي وقدرات فريقك بإضافات مرنة عبر DodoPayments."
                    : "Extend AI credits and capacity with seat add-ons via DodoPayments."}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </PublicSection>
  );
}
