"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";

import { BillingToggle } from "./billing-toggle";
import { FeatureTable } from "./feature-table";
import type { BillingCycle, Plan, FeatureSection } from "./types";

const PLANS_CONFIG: Plan[] = [
  {
    id: "good",
    name: "Good",
    description: "For solo practitioners",
    monthlyPrice: 7,
    annuallyPrice: 70,
    label: null,
    cta: "Start free",
    ctaHref: "/billing?plan=good_monthly",
    highlight: false,
    contactSales: false,
  },
  {
    id: "better",
    name: "Better",
    description: "For professional teams",
    monthlyPrice: 19,
    annuallyPrice: 190,
    label: "POPULAR",
    cta: "Start trial",
    ctaHref: "/billing?plan=better_monthly",
    highlight: true,
    contactSales: false,
  },
  {
    id: "custom",
    name: "Enterprise",
    description: "For organizations",
    monthlyPrice: null,
    annuallyPrice: null,
    label: null,
    cta: "Contact sales",
    ctaHref: "/contact",
    highlight: false,
    contactSales: true,
  },
];

function buildFeatures(isAr: boolean): FeatureSection[] {
  return [
    {
      category: isAr ? "الميزات الأساسية" : "CORE",
      rows: [
        {
          label: isAr ? "أعضاء الفريق" : "Team members",
          values: [isAr ? "حتى 3" : "Up to 3", isAr ? "غير محدود" : "Unlimited", isAr ? "غير محدود" : "Unlimited"],
        },
        {
          label: isAr ? "المشاريع" : "Projects",
          values: [isAr ? "5" : "5", isAr ? "غير محدود" : "Unlimited", isAr ? "غير محدود" : "Unlimited"],
        },
        {
          label: isAr ? "سعة التخزين" : "Storage",
          values: ["1GB", "50GB", isAr ? "مخصص" : "Custom"],
        },
        {
          label: "REST & GraphQL API",
          values: [true, true, true],
        },
        {
          label: "Webhooks",
          values: [false, "10 endpoints", isAr ? "غير محدود" : "Unlimited"],
        },
        {
          label: isAr ? "بيئات تجربة" : "Staging environments",
          values: [false, "1", isAr ? "غير محدود" : "Unlimited"],
        },
      ],
    },
    {
      category: isAr ? "الذكاء الاصطناعي" : "AI",
      rows: [
        {
          label: isAr ? "الوصول إلى AI" : "AI access",
          values: [false, true, true],
        },
        {
          label: isAr ? "رصيد AI شهري" : "Monthly AI credits",
          values: [isAr ? "لا يوجد" : "None", "12,000", isAr ? "مخصص" : "Custom"],
        },
        {
          label: isAr ? "بطاقات الائتمان المتضمنة" : "Included credit cards",
          values: ["0", "3", isAr ? "مخصص" : "Custom"],
        },
        {
          label: isAr ? "حد استدعاءات API" : "API call quota",
          values: ["1,000/mo", "10,000/mo", isAr ? "غير محدود" : "Unlimited"],
        },
        {
          label: isAr ? "روابط الوكيل" : "Agent links",
          values: ["1", "5", isAr ? "غير محدود" : "Unlimited"],
        },
      ],
    },
    {
      category: isAr ? "التعاون" : "COLLABORATION",
      rows: [
        {
          label: isAr ? "التعاون الفوري" : "Real-time collaboration",
          values: [true, true, true],
        },
        {
          label: isAr ? "التعليقات والإشارات" : "Comments & mentions",
          values: [true, true, true],
        },
        {
          label: isAr ? "الوصول للضيوف" : "Guest access",
          values: [false, isAr ? "5 ضيوف" : "5 guests", isAr ? "غير محدود" : "Unlimited"],
        },
        {
          label: "RBAC",
          values: [false, false, true],
        },
      ],
    },
    {
      category: isAr ? "الأمان" : "SECURITY",
      rows: [
        {
          label: "SAML SSO",
          values: [false, false, true],
        },
        {
          label: "SCIM",
          values: [false, false, true],
        },
        {
          label: isAr ? "سجلات التدقيق" : "Audit logs",
          values: [false, isAr ? "7 أيام" : "7 days", isAr ? "سنة" : "1 year"],
        },
      ],
    },
    {
      category: isAr ? "الدعم" : "SUPPORT",
      rows: [
        {
          label: isAr ? "قناة الدعم" : "Support channel",
          values: [isAr ? "المجتمع" : "Community", "Email (24h)", isAr ? "هاتف (1س)" : "Phone (1h)"],
        },
        {
          label: isAr ? "مساعدة الإعداد" : "Onboarding assistance",
          values: [false, false, true],
        },
        {
          label: isAr ? "مدير حساب مخصص" : "Dedicated account manager",
          values: [false, false, true],
        },
        {
          label: "Uptime SLA",
          values: [false, "99.9%", "99.99%"],
        },
      ],
    },
  ];
}

export function PricingPage() {
  const locale = useLocale() as "en" | "ar";
  const isAr = locale === "ar";
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const features = useMemo(() => buildFeatures(isAr), [isAr]);

  return (
    <main className="min-h-screen bg-[var(--q-bg-very-dark)] text-[var(--q-text-primary)]">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-[10px] font-bold tracking-[0.12em] text-[var(--q-text-muted)] uppercase mb-3">
            {isAr ? "التسعير" : "PRICING"}
          </p>
          <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-extrabold tracking-tight leading-[1.1] mb-4 text-[var(--q-text-primary)]">
            {isAr ? "قارن الخطط، ميزة بميزة" : "Compare plans, row by row"}
          </h1>
          <p className="text-sm text-[var(--q-text-secondary)] leading-relaxed">
            {isAr
              ? "كل ميزة، كل حد، ثلاث خطط جنباً إلى جنب. اعثر على الخطة التي تناسب فريقك في ثوانٍ."
              : "Every feature, every limit, three plans side by side. Find the row that matches your team and pick the plan in seconds."}
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <BillingToggle
            value={billing}
            onChange={setBilling}
            monthlyLabel={isAr ? "شهري" : "Monthly"}
            annuallyLabel={isAr ? "سنوي" : "Annually"}
          />
        </div>

        <FeatureTable
          plans={PLANS_CONFIG}
          sections={features}
          billing={billing}
          highlightIndex={1}
        />

        <p className="text-center mt-6 text-[10px] text-[var(--q-text-muted)]">
          {isAr
            ? "جميع الخطط المدفوعة تتضمن 14 يوماً تجربة مجانية · لا حاجة لبطاقة ائتمان · الأسعار بالدولار الأمريكي"
            : "All paid plans include a 14-day free trial · No credit card required · Prices in USD"}
        </p>
      </div>
    </main>
  );
}
