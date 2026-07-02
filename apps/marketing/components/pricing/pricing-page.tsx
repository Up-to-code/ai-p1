"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";

import { BillingToggle } from "./billing-toggle";
import { PlanCard } from "./plan-card";
import { FeatureTable } from "./feature-table";
import { SavingsBanner } from "./savings-banner";
import { FaqAccordion } from "./faq-accordion";
import { TrustedByCloud } from "./trusted-by-cloud";
import { AiPricingSection } from "./ai-pricing-section";
import type { BillingCycle, Plan, FeatureSection } from "./types";

// ─── Plans ────────────────────────────────────────────────────────────────────
const PLANS_CONFIG: Plan[] = [
  {
    id: "free",
    name: "Free Forever",
    description: "For individuals getting started",
    monthlyPrice: 0,
    annuallyPrice: 0,
    label: null,
    cta: "Get Started",
    ctaHref: "/billing?plan=free",
    highlight: false,
    contactSales: false,
  },
  {
    id: "good",
    name: "Unlimited",
    description: "For solo practitioners",
    monthlyPrice: 7,
    annuallyPrice: 70,
    label: null,
    cta: "Get started",
    ctaHref: "/billing?plan=good_monthly",
    highlight: false,
    contactSales: false,
  },
  {
    id: "better",
    name: "Business",
    description: "For professional teams",
    monthlyPrice: 12,
    annuallyPrice: 120,
    label: "Popular",
    cta: "Get started",
    ctaHref: "/billing?plan=better_monthly",
    highlight: true,
    contactSales: false,
  },
  {
    id: "custom",
    name: "Enterprise",
    description: "For organizations at scale",
    monthlyPrice: null,
    annuallyPrice: null,
    label: null,
    cta: "Contact sales",
    ctaHref: "/contact",
    highlight: false,
    contactSales: true,
  },
];

const PLANS_AR: Plan[] = [
  { ...PLANS_CONFIG[0], name: "مجاني للأبد", description: "للأفراد الذين يبدأون رحلتهم", cta: "ابدأ الآن" },
  { ...PLANS_CONFIG[1], name: "غير محدود", description: "للممارسين المنفردين", cta: "ابدأ الآن" },
  { ...PLANS_CONFIG[2], name: "الأعمال", description: "للفرق المحترفة", cta: "ابدأ الآن" },
  { ...PLANS_CONFIG[3], name: "المؤسسات", description: "للمنظمات الكبيرة", cta: "تواصل مع المبيعات" },
];

// ─── Feature comparison data (4 plans) ──────────────────────────────────────
function buildFeatures(isAr: boolean): FeatureSection[] {
  return [
    {
      category: isAr ? "الأساسيات" : "CORE",
      rows: [
        { label: isAr ? "أعضاء الفريق" : "Team members",        values: [isAr ? "حتى 3" : "Up to 3",   isAr ? "غير محدود" : "Unlimited", isAr ? "غير محدود" : "Unlimited", isAr ? "غير محدود" : "Unlimited"] },
        { label: isAr ? "المشاريع" : "Projects",                  values: ["5",                            isAr ? "غير محدود" : "Unlimited", isAr ? "غير محدود" : "Unlimited", isAr ? "غير محدود" : "Unlimited"] },
        { label: isAr ? "التخزين" : "Storage",                    values: ["60 MB",                        isAr ? "غير محدود" : "Unlimited", isAr ? "غير محدود" : "Unlimited", isAr ? "مخصص" : "Custom"] },
        { label: "REST & GraphQL API",                             values: [true,                           true,                              true,                              true] },
        { label: "Webhooks",                                       values: [false,                          "10 endpoints",                    isAr ? "غير محدود" : "Unlimited",  isAr ? "غير محدود" : "Unlimited"] },
        { label: isAr ? "بيئات تجربة" : "Staging environments",  values: [false,                          "1",                               isAr ? "غير محدود" : "Unlimited",  isAr ? "غير محدود" : "Unlimited"] },
      ],
    },
    {
      category: isAr ? "التعاون" : "COLLABORATION",
      rows: [
        { label: isAr ? "التعاون الفوري" : "Real-time collaboration", values: [true,  true,  true,  true] },
        { label: isAr ? "التعليقات والإشارات" : "Comments & mentions",  values: [true,  true,  true,  true] },
        { label: isAr ? "وصول الضيوف" : "Guest access",               values: [false, isAr ? "5 ضيوف" : "5 guests", isAr ? "غير محدود" : "Unlimited", isAr ? "غير محدود" : "Unlimited"] },
        { label: "RBAC",                                                  values: [false, false, true,  true] },
      ],
    },
    {
      category: isAr ? "الأمان" : "SECURITY",
      rows: [
        { label: "SAML SSO",                                     values: [false, false, false, true] },
        { label: "SCIM",                                         values: [false, false, false, true] },
        { label: isAr ? "سجلات التدقيق" : "Audit logs",        values: [false, isAr ? "7 أيام" : "7 days", isAr ? "7 أيام" : "7 days", isAr ? "سنة" : "1 year"] },
      ],
    },
    {
      category: isAr ? "الدعم" : "SUPPORT",
      rows: [
        { label: isAr ? "قناة الدعم" : "Support channel",               values: [isAr ? "المجتمع" : "Community", "Email (24 h)", "Email (24 h)", isAr ? "هاتف (1 ساعة)" : "Phone (1 h)"] },
        { label: isAr ? "مساعدة الإعداد" : "Onboarding assistance",     values: [false, false, true,  true] },
        { label: isAr ? "مدير حساب مخصص" : "Dedicated account manager", values: [false, false, false, true] },
        { label: "Uptime SLA",                                            values: [false, "99.9 %", "99.9 %", "99.99 %"] },
      ],
    },
  ];
}

// ─── Page ────────────────────────────────────────────────────────────────────
export function PricingPage() {
  const locale = useLocale() as "en" | "ar";
  const isAr = locale === "ar";
  const [billing, setBilling] = useState<BillingCycle>("annually");
  const features = useMemo(() => buildFeatures(isAr), [isAr]);
  const plans = isAr ? PLANS_AR : PLANS_CONFIG;

  return (
    <main className="cu-pricing-root" dir={isAr ? "rtl" : "ltr"}>
      <div className="cu-pricing-inner">

        {/* ── 1. HERO ────────────────────────────────────────────── */}
        <section className="cu-pricing-hero">
          <h1 className="cu-pricing-headline">
            {isAr ? (
              <>
                <span className="cu-hl-dark">أفضل حل </span>
                <span className="cu-hl-faded">للعمل،</span>
                <br />
                <span className="cu-hl-dark">بأفضل </span>
                <span className="cu-hl-faded">سعر.</span>
              </>
            ) : (
              <>
                <span className="cu-hl-dark">The best work </span>
                <span className="cu-hl-faded">solution,</span>
                <br />
                <span className="cu-hl-dark">for the best </span>
                <span className="cu-hl-faded">price.</span>
              </>
            )}
          </h1>
        </section>

        {/* ── 2. GUARANTEE + TOGGLE ROW ────────────────────────── */}
        <div className="cu-pricing-controls-row">
          <div className="cu-pricing-guarantee">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--q-human-green,#2BB673)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            <span>{isAr ? "ضمان استرداد الأموال 100 %" : "100% Money-back Guarantee"}</span>
          </div>
          <BillingToggle
            value={billing}
            onChange={setBilling}
            monthlyLabel={isAr ? "شهري" : "Monthly"}
            annuallyLabel={isAr ? "سنوي" : "Yearly"}
            saveLabel={isAr ? "وفّر حتى 30 % مع السنوي" : "Save up to 30% with yearly"}
          />
        </div>

        {/* ── 3. PLAN CARDS ─────────────────────────────────────── */}
        <section className="cu-pricing-cards" aria-label={isAr ? "خطط التسعير" : "Pricing plans"}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} billing={billing} isAr={isAr} />
          ))}
        </section>

        {/* ── 4. TRUSTED BY ─────────────────────────────────────── */}
        <TrustedByCloud isAr={isAr} />

      </div>

      {/* ── 5. AI PRICING (full-bleed dark) ───────────────────── */}
      <AiPricingSection isAr={isAr} />

      <div className="cu-pricing-inner">

        {/* ── 6. SAVINGS CALCULATOR ─────────────────────────────── */}
        <SavingsBanner isAr={isAr} />

        {/* ── 7. FEATURE COMPARISON ─────────────────────────────── */}
        <FeatureTable
          plans={plans}
          sections={features}
          billing={billing}
          highlightIndex={2}
          isAr={isAr}
        />

        {/* ── 8. FAQ ────────────────────────────────────────────── */}
        <FaqAccordion isAr={isAr} />

      </div>

      <style>{`
        .cu-pricing-root {
          min-height: 100vh;
          background: var(--q-bg);
          color: var(--q-text-primary);
          font-family: 'Inter', sans-serif;
        }
        .cu-pricing-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (max-width: 640px) {
          .cu-pricing-inner { padding: 0 16px; }
        }

        /* Hero */
        .cu-pricing-hero {
          text-align: center;
          padding: 72px 0 32px;
        }
        .cu-pricing-headline {
          font-size: clamp(2.6rem, 6vw, 4.2rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.03em;
          margin: 0;
        }
        .cu-hl-dark   { color: var(--q-text-primary); }
        .cu-hl-faded  { color: var(--q-text-muted); }

        /* Controls row: guarantee left, toggle right */
        .cu-pricing-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          max-width: 1100px;
          margin: 0 auto 20px;
          padding: 0 24px;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .cu-pricing-controls-row { padding: 0 16px; justify-content: center; }
        }
        .cu-pricing-guarantee {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--q-text-secondary);
        }

        /* Cards — single bordered container, column dividers */
        .cu-pricing-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border: 1px solid var(--q-border);
          border-radius: 16px;
          overflow: hidden;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (max-width: 640px) {
          .cu-pricing-cards { padding: 0 16px; }
        }
        /* Remove individual card padding/border */
        .cu-pricing-cards .cu-plan-card {
          border: none;
          border-radius: 0;
        }
        .cu-pricing-cards .cu-plan-card:hover { box-shadow: none; }
        /* Right borders between cards */
        .cu-pricing-cards > :not(:last-child) .cu-plan-card {
          border-right: 1px solid var(--q-border);
        }
        [dir="rtl"] .cu-pricing-cards > :not(:last-child) .cu-plan-card {
          border-right: none;
          border-left: 1px solid var(--q-border);
        }
        @media (max-width: 900px) {
          .cu-pricing-cards { grid-template-columns: repeat(2, 1fr); }
          .cu-pricing-cards > :nth-child(1) .cu-plan-card,
          .cu-pricing-cards > :nth-child(2) .cu-plan-card {
            border-bottom: 1px solid var(--q-border);
          }
          .cu-pricing-cards > :nth-child(2) .cu-plan-card {
            border-right: none;
          }
          [dir="rtl"] .cu-pricing-cards > :nth-child(2) .cu-plan-card {
            border-left: none;
          }
        }
        @media (max-width: 560px) {
          .cu-pricing-cards { grid-template-columns: 1fr; }
          .cu-pricing-cards .cu-plan-card {
            border-right: none !important;
            border-left: none !important;
            border-bottom: 1px solid var(--q-border) !important;
          }
          .cu-pricing-cards > :last-child .cu-plan-card { border-bottom: none !important; }
        }
      `}</style>
    </main>
  );
}
