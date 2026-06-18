"use client";

import { useState } from "react";
import { Check, ArrowRight, Users, Zap, Shield, Bot, Layers, Headphones } from "lucide-react";
import { Link } from "@/i18n/routing";
import { PublicSection } from "@/components/landing/public-landing-kit";
import { cn } from "@/lib/utils";
import { PRICE_PER_SEAT, QENTRAH_PLAN } from "@/domains/billing/api/billing";

// ─── Copy ─────────────────────────────────────────────────────────────────────
const copy = {
  en: {
    eyebrow: "Simple Pricing",
    title: "One plan. Every feature.",
    description:
      "Everything your team needs to manage clients, projects, and AI agents — billed per user each month.",
    priceLabel: "$6.99",
    interval: "/ user / month",
    cta: "Get started",
    guarantee: "30-day money-back guarantee · No hidden fees",
    seats: "seat",
    seatsPlural: "seats",
    seatsHint: "Adjust seats after signing up",
    features: [
      { icon: Layers,      text: "Project, asset & client workspace" },
      { icon: Bot,         text: "AI agents & workflows" },
      { icon: Zap,         text: "All apps & integrations" },
      { icon: Users,       text: "Unlimited team members" },
      { icon: Shield,      text: "Included AI credits" },
      { icon: Headphones,  text: "Priority support" },
    ],
  },
  ar: {
    eyebrow: "تسعير بسيط",
    title: "خطة واحدة. كل الميزات.",
    description:
      "كل ما يحتاجه فريقك لإدارة العملاء والمشاريع ووكلاء الذكاء الاصطناعي — بسعر ثابت لكل مستخدم شهرياً.",
    priceLabel: "$6.99",
    interval: "/ مستخدم / شهر",
    cta: "ابدأ الآن",
    guarantee: "ضمان استرداد 30 يوماً · بدون رسوم خفية",
    seats: "مقعد",
    seatsPlural: "مقاعد",
    seatsHint: "يمكنك ضبط عدد المقاعد بعد التسجيل",
    features: [
      { icon: Layers,      text: "مساحة المشاريع والأصول والعملاء" },
      { icon: Bot,         text: "وكلاء الذكاء الاصطناعي وسير العمل" },
      { icon: Zap,         text: "جميع التطبيقات والتكاملات" },
      { icon: Users,       text: "عدد غير محدود من أعضاء الفريق" },
      { icon: Shield,      text: "رصيد AI ضمن الخطة" },
      { icon: Headphones,  text: "دعم ذو أولوية" },
    ],
  },
} as const;

// ─── Component ────────────────────────────────────────────────────────────────
export function Pricing03({ locale }: { locale: string }) {
  const t = locale === "ar" ? copy.ar : copy.en;
  const isAr = locale === "ar";

  // Seat preview counter (cosmetic — actual seats set on the checkout page)
  const [previewSeats, setPreviewSeats] = useState(3);
  const totalPreview = (previewSeats * PRICE_PER_SEAT).toFixed(2);

  return (
    <PublicSection id="pricing" tone="very-dark" className="py-24 md:py-32">
      <div className="mx-auto max-w-5xl">

        {/* ── Header ─────────────────────────────────────── */}
        <div className="mb-14 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-8 bg-[var(--q-accent)]/30" />
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[var(--q-accent)]">
              {t.eyebrow}
            </span>
            <span className="h-px w-8 bg-[var(--q-accent)]/30" />
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-[var(--q-text-primary)] md:text-6xl">
            {t.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base font-semibold leading-relaxed text-[var(--q-text-secondary)] md:text-lg">
            {t.description}
          </p>
        </div>

        {/* ── Pricing card ───────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border-2 border-[var(--q-accent)] bg-[var(--q-card)] shadow-2xl shadow-[var(--q-accent)]/20">
          {/* Accent bar */}
          <div className="h-2 bg-gradient-to-r from-[var(--q-accent)] via-blue-500 to-[var(--q-accent)]" />

          <div className="grid gap-px md:grid-cols-2">

            {/* ── Left: price + seat preview ─────────────── */}
            <div className="space-y-8 p-8 md:p-12">
              {/* Plan badge */}
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--q-accent)]/10 border border-[var(--q-accent)]/20 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-[var(--q-accent)]">
                <Zap className="h-3.5 w-3.5" />
                {QENTRAH_PLAN.name}
              </div>

              {/* Price */}
              <div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-7xl font-black tracking-tighter text-[var(--q-text-primary)]">
                    {t.priceLabel}
                  </span>
                  <span className="text-base font-bold text-[var(--q-text-secondary)]">
                    {t.interval}
                  </span>
                </div>
              </div>

              {/* ── Interactive seat preview ──────────────── */}
              <div className="rounded-2xl border-2 border-[var(--q-accent)]/25 bg-[var(--q-accent)]/[0.03] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-black uppercase tracking-widest text-[var(--q-text-secondary)]">
                    {isAr ? "معاينة السعر" : "Price preview"}
                  </span>
                </div>

                {/* Number input + total */}
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={previewSeats}
                    onChange={(e) => {
                      const v = Math.max(1, Math.min(999, Number(e.target.value) || 1));
                      setPreviewSeats(v);
                    }}
                    className="w-24 rounded-xl border-2 border-[var(--q-border)] bg-[var(--q-card)] px-3 py-2.5 text-center text-2xl font-black tabular-nums text-[var(--q-text-primary)] focus:border-[var(--q-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--q-accent)]/20 transition-all"
                    aria-label={isAr ? "عدد المقاعد" : "Number of seats"}
                  />
                  <span className="text-sm font-bold text-[var(--q-text-secondary)]">
                    {previewSeats === 1 ? t.seats : t.seatsPlural}
                  </span>
                  <span className="ms-auto text-xl font-black text-[var(--q-accent)]">
                    ${totalPreview}/mo
                  </span>
                </div>

                {/* Slider for quick drag up to 50 */}
                <div className="mt-5 space-y-2">
                  <input
                    type="range"
                    min={1}
                    max={50}
                    value={Math.min(previewSeats, 50)}
                    onChange={(e) => setPreviewSeats(Number(e.target.value))}
                    className="w-full accent-[var(--q-accent)] h-2 rounded-full"
                    aria-label={isAr ? "تمرير عدد المقاعد" : "Drag seats"}
                  />
                  <div className="flex justify-between text-[10px] font-bold text-[var(--q-text-muted)]">
                    <span>1</span>
                    <span>50+</span>
                  </div>
                </div>

                <p className="mt-4 text-[11px] font-medium text-[var(--q-text-secondary)]">
                  {t.seatsHint}
                </p>
              </div>

              {/* CTA — carries seat count to billing page */}
              <Link href={`/billing?seats=${previewSeats}`}>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--q-accent)] px-6 py-5",
                    "text-base font-black uppercase tracking-widest text-white",
                    "shadow-xl shadow-[var(--q-accent)]/30 transition-all duration-200",
                    "hover:bg-[var(--q-accent-hover)] hover:shadow-2xl hover:shadow-[var(--q-accent)]/50 active:scale-[0.98]",
                  )}
                >
                  {t.cta}
                  <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                </button>
              </Link>

              <p className="text-center text-[11px] font-bold text-[var(--q-text-secondary)]">
                {t.guarantee}
              </p>
            </div>

            {/* ── Right: features ───────────────────────── */}
            <div className="bg-[var(--q-bg-secondary)] p-8 md:p-12">
              <p className="mb-8 text-[11px] font-black uppercase tracking-[0.25em] text-[var(--q-text-secondary)]">
                {isAr ? "كل ما تحتاجه" : "Everything included"}
              </p>
              <ul className="space-y-5">
                {t.features.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--q-accent)]/10 border border-[var(--q-accent)]/20">
                      <Icon className="h-4 w-4 text-[var(--q-accent)]" />
                    </div>
                    <span className="pt-1 text-sm font-semibold leading-relaxed text-[var(--q-text-primary)]">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Add-ons note */}
              <div className="mt-10 rounded-2xl border border-[var(--q-border)] bg-[var(--q-card)] p-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--q-accent)]" />
                  <p className="text-[11px] font-black uppercase tracking-widest text-[var(--q-accent)]">
                    {isAr ? "إضافات مرنة" : "Flexible add-ons"}
                  </p>
                </div>
                <p className="text-xs font-medium leading-relaxed text-[var(--q-text-secondary)]">
                  {isAr
                    ? "وسّع رصيد الذكاء الاصطناعي وقدرات فريقك بإضافات مرنة."
                    : "Extend AI credits and team capacity with flexible seat add-ons via DodoPayments."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicSection>
  );
}
