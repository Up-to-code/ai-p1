"use client";

import NumberFlow from "@number-flow/react";
import Image from "next/image";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { Transition } from "framer-motion";
import { ArrowRight, CalendarDays, CircleCheck, CircleX, Sparkles } from "lucide-react";
import {
  billingSelectionKey,
  getMarketPricing,
  resolveSubscriptionEntitlements,
  type BillingCycle,
  type SubscriptionEntitlements,
  type SubscriptionPlanId,
} from "@qentrah/domain-contracts/subscription-pricing";

import { LandingButton, PublicSection } from "@/components/landing/public-landing-kit";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TooltipKey = "sync" | "ai" | "governance";
type PricingCycle = "monthly" | "annual";

type PricingPlan = {
  id: SubscriptionPlanId;
  name: string;
  price: number | "custom";
  entitlements?: SubscriptionEntitlements;
  period?: "month" | "year";
  country?: string;
  description: string;
  buttonText: string;
  href: string;
  isPopular?: boolean;
  features: Array<{
    included?: boolean;
    title: string;
    tooltip?: TooltipKey;
  }>;
};

const planCopy = {
  en: {
    eyebrow: "Pricing",
    tabs: {
      monthly: "Monthly",
      annual: "Annually",
    },
    popular: "Most useful",
    perMonth: "per month",
    perYear: "per year",
    customPrice: "Custom",
    annualBadge: "Annual access",
    tamara: {
      label: "Annual BNPL",
      title: "Buy now, pay later with Tamara",
      description: "Use Tamara for the yearly Qentrah plan only. Split the annual access payment while keeping monthly setup separate.",
      cta: "Pay yearly with Tamara",
      amount: "5,988 SAR",
      note: "Hosted Tamara checkout",
      logoAlt: "Tamara",
      logoSrc: "/Tamara Media Kit/Logos/Tamara Logos-01.png",
    },
    tooltips: {
      sync: "Keeps projects, assets, media, priorities, and availability aligned across teams.",
      ai: "AI assists with triage, drafting, summaries, and repetitive operational work.",
      governance: "Controls roles, approvals, audit trails, and trusted organization access.",
    },
    plans: [
      {
        id: "good",
        name: "Good",
        country: "Saudi Arabia",
        price: "custom",
        period: "month",
        description: "For teams that need the core workspace, light app access, and no bundled AI credit spend.",
        buttonText: "Start setup",
        href: "/billing?plan=good_monthly",
        features: [
          { title: "Project management", tooltip: "sync" },
          { title: "Asset management" },
          { title: "Client management" },
          { title: "Calendar management" },
          { title: "Limited apps and integrations" },
          { title: "Starter API access" },
          { included: false, title: "AI, MCP, and memberships" },
        ],
      },
      {
        id: "better",
        name: "Better",
        country: "Saudi Arabia",
        price: "custom",
        period: "month",
        description: "For teams that want AI agents, higher usage budgets, and broader app access in daily operations.",
        buttonText: "Start with AI",
        href: "/billing?plan=better_monthly",
        isPopular: true,
        features: [
          { title: "Everything in Good" },
          { title: "AI agents and workflows", tooltip: "ai" },
          { title: "3 included AI credit cards" },
          { title: "Standard apps and integrations", tooltip: "sync" },
          { title: "Higher API and agent-link quotas" },
          { title: "Priority support", tooltip: "governance" },
        ],
      },
      {
        id: "custom",
        name: "Custom",
        price: "custom",
        description: "For larger teams that need custom AI budgets, private workflows, custom apps, and dedicated onboarding.",
        buttonText: "Talk to Qentrah",
        href: "/contact",
        features: [
          { title: "Custom AI credit cards", tooltip: "ai" },
          { title: "Custom app and integration access", tooltip: "sync" },
          { title: "Custom API and agent-link quotas" },
          { title: "Dedicated onboarding", tooltip: "governance" },
        ],
      },
    ],
    annualPlans: [
      {
        id: "good",
        name: "Good",
        country: "Saudi Arabia",
        price: "custom",
        period: "year",
        description: "Annual core workspace access for teams that want predictable operations without bundled AI credit spend.",
        buttonText: "Start annual setup",
        href: "/billing?plan=good_yearly",
        features: [
          { title: "Project management", tooltip: "sync" },
          { title: "Asset management" },
          { title: "Client management" },
          { title: "Calendar management" },
          { title: "Limited apps and integrations" },
          { title: "Starter API access" },
          { included: false, title: "AI, MCP, and memberships" },
        ],
      },
      {
        id: "better",
        name: "Better",
        country: "Saudi Arabia",
        price: "custom",
        period: "year",
        description: "Annual AI-enabled workspace access with included AI credit cards and broader app access.",
        buttonText: "Start annual AI setup",
        href: "/billing?plan=better_yearly",
        isPopular: true,
        features: [
          { title: "Everything in Good" },
          { title: "AI agents and workflows", tooltip: "ai" },
          { title: "3 included AI credit cards" },
          { title: "Standard apps and integrations", tooltip: "sync" },
          { title: "Higher API and agent-link quotas" },
          { title: "Priority support", tooltip: "governance" },
        ],
      },
      {
        id: "custom",
        name: "Custom",
        price: "custom",
        description: "For larger teams that need custom AI budgets, private workflows, custom apps, and dedicated onboarding.",
        buttonText: "Talk to Qentrah",
        href: "/contact",
        features: [
          { title: "Custom AI credit cards", tooltip: "ai" },
          { title: "Custom app and integration access", tooltip: "sync" },
          { title: "Custom API and agent-link quotas" },
          { title: "Dedicated onboarding", tooltip: "governance" },
        ],
      },
    ],
  },
  ar: {
    eyebrow: "التسعير",
    tabs: {
      monthly: "شهري",
      annual: "سنوي",
    },
    popular: "الأكثر استخداماً",
    perMonth: "شهرياً",
    perYear: "سنوياً",
    customPrice: "مخصص",
    annualBadge: "وصول سنوي",
    tamara: {
      label: "تقسيط سنوي",
      title: "اشتر الآن وادفع لاحقاً مع تمارا",
      description: "استخدم تمارا للخطة السنوية فقط. قسّط دفع الوصول السنوي مع بقاء الإعداد الشهري منفصلاً.",
      cta: "ادفع سنوياً مع تمارا",
      amount: "5,988 ر.س",
      note: "دفع آمن عبر تمارا",
      logoAlt: "تمارا",
      logoSrc: "/Tamara Media Kit/Logos/Tamara Logos-04.png",
    },
    tooltips: {
      sync: "يحافظ على توافق المشاريع والأصول والوسائط والأولويات والتوفر بين الفرق.",
      ai: "يساعد الذكاء الاصطناعي في الفرز، الصياغة، التلخيص، والعمل التشغيلي المتكرر.",
      governance: "يدير الأدوار، الموافقات، سجلات التدقيق، ووصول المؤسسة الموثوق.",
    },
    plans: [
      {
        id: "good",
        name: "Good",
        price: 499,
        period: "month",
        description: "للفرق التي تحتاج مساحة عمل أساسية، وصول تطبيقات محدود، بدون رصيد ذكاء اصطناعي.",
        buttonText: "ابدأ الإعداد",
        href: "/billing?plan=good_monthly",
        features: [
          { title: "إدارة المشاريع", tooltip: "sync" },
          { title: "إدارة الأصول" },
          { title: "إدارة العملاء" },
          { title: "إدارة التقويم" },
          { title: "تكاملات محدودة" },
          { title: "وصول API أساسي" },
          { included: false, title: "الذكاء الاصطناعي وMCP والعضويات" },
        ],
      },
      {
        id: "better",
        name: "Better",
        price: "custom",
        period: "month",
        description: "للفرق التي تريد وكلاء ذكاء اصطناعي، رصيد استخدام أعلى، ووصولاً أوسع للتطبيقات.",
        buttonText: "ابدأ مع الذكاء الاصطناعي",
        href: "/billing?plan=better_monthly",
        isPopular: true,
        features: [
          { title: "كل مزايا Good" },
          { title: "وكلاء الذكاء الاصطناعي وسير العمل", tooltip: "ai" },
          { title: "3 بطاقات رصيد ذكاء اصطناعي" },
          { title: "تكاملات وتطبيقات أوسع", tooltip: "sync" },
          { title: "حصص أعلى للـ API وروابط الوكلاء" },
          { title: "دعم ذو أولوية", tooltip: "governance" },
        ],
      },
      {
        id: "custom",
        name: "باقة مخصصة",
        price: "custom",
        description: "للفرق الأكبر التي تحتاج رصيد ذكاء اصطناعي مخصص، تطبيقات خاصة، وتهيئة مخصصة.",
        buttonText: "تحدث مع كانترا",
        href: "/contact",
        features: [
          { title: "بطاقات رصيد ذكاء اصطناعي مخصصة", tooltip: "ai" },
          { title: "تطبيقات وتكاملات مخصصة", tooltip: "sync" },
          { title: "حصص API وروابط وكلاء مخصصة" },
          { title: "تهيئة مخصصة", tooltip: "governance" },
        ],
      },
    ],
    annualPlans: [
      {
        id: "good",
        name: "Good",
        price: 5988,
        period: "year",
        description: "وصول سنوي لمساحة عمل أساسية للفرق التي تريد عمليات متوقعة بدون رصيد ذكاء اصطناعي.",
        buttonText: "ابدأ الإعداد السنوي",
        href: "/billing?plan=good_yearly",
        features: [
          { title: "إدارة المشاريع", tooltip: "sync" },
          { title: "إدارة الأصول" },
          { title: "إدارة العملاء" },
          { title: "إدارة التقويم" },
          { title: "تكاملات محدودة" },
          { title: "وصول API أساسي" },
          { included: false, title: "الذكاء الاصطناعي وMCP والعضويات" },
        ],
      },
      {
        id: "better",
        name: "Better",
        price: "custom",
        period: "year",
        description: "وصول سنوي لمساحة عمل مدعومة بالذكاء الاصطناعي مع بطاقات رصيد مضمّنة وتكاملات أوسع.",
        buttonText: "ابدأ الإعداد السنوي للذكاء الاصطناعي",
        href: "/billing?plan=better_yearly",
        isPopular: true,
        features: [
          { title: "كل مزايا Good" },
          { title: "وكلاء الذكاء الاصطناعي وسير العمل", tooltip: "ai" },
          { title: "3 بطاقات رصيد ذكاء اصطناعي" },
          { title: "تكاملات وتطبيقات أوسع", tooltip: "sync" },
          { title: "حصص أعلى للـ API وروابط الوكلاء" },
          { title: "دعم ذو أولوية", tooltip: "governance" },
        ],
      },
      {
        id: "custom",
        name: "باقة مخصصة",
        price: "custom",
        description: "للفرق الأكبر التي تحتاج رصيد ذكاء اصطناعي مخصص، تطبيقات خاصة، وتهيئة مخصصة.",
        buttonText: "تحدث مع كانترا",
        href: "/contact",
        features: [
          { title: "بطاقات رصيد ذكاء اصطناعي مخصصة", tooltip: "ai" },
          { title: "تطبيقات وتكاملات مخصصة", tooltip: "sync" },
          { title: "حصص API وروابط وكلاء مخصصة" },
          { title: "تهيئة مخصصة", tooltip: "governance" },
        ],
      },
    ],
  },
} satisfies Record<
  "en" | "ar",
  {
    eyebrow: string;
    tabs: Record<PricingCycle, string>;
    popular: string;
    perMonth: string;
    perYear: string;
    customPrice: string;
    annualBadge: string;
    tamara: {
      label: string;
      title: string;
      description: string;
      cta: string;
      amount: string;
      note: string;
      logoAlt: string;
      logoSrc: string;
    };
    tooltips: Record<string, string>;
    plans: PricingPlan[];
    annualPlans: PricingPlan[];
  }
>;

export function Pricing03({ locale }: { locale: string }) {
  const copy = locale === "ar" ? planCopy.ar : planCopy.en;
  const [billingCycle, setBillingCycle] = useState<PricingCycle>("annual");
  const activePlans = hydratePlans(billingCycle === "monthly" ? copy.plans : copy.annualPlans, billingCycle === "monthly" ? "monthly" : "yearly");
  const shouldReduceMotion = useReducedMotion();
  const panelTransition: Transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.34, ease: [0.22, 1, 0.36, 1] };
  const indicatorTransition: Transition = shouldReduceMotion ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] };

  return (
    <PublicSection
      id="pricing"
      className="relative bg-white py-20 dark:bg-[#080808] md:py-28"
    >
      <div className="relative mx-auto max-w-7xl">
        <div className="sticky top-20 z-20 mb-10 flex justify-center py-2">
          <div
            aria-label={copy.eyebrow}
            className="grid w-full max-w-sm grid-cols-2 rounded-full border border-zinc-200 bg-zinc-100/95 p-1 text-xs font-black uppercase tracking-widest shadow-sm shadow-zinc-200/50 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:shadow-none"
            role="tablist"
          >
            {(["monthly", "annual"] as const).map((cycle) => (
              <button
                aria-selected={billingCycle === cycle}
                className={cn(
                  "relative isolate h-10 overflow-hidden rounded-full px-4 text-zinc-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-zinc-400 dark:focus-visible:ring-offset-zinc-950",
                  billingCycle === cycle && "text-zinc-950 dark:text-zinc-950",
                )}
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                role="tab"
                type="button"
              >
                {billingCycle === cycle && (
                  <motion.span
                    className="absolute inset-0 -z-10 rounded-full bg-white shadow-sm shadow-zinc-200/60 dark:bg-white dark:shadow-none"
                    layoutId="pricing-cycle-indicator"
                    transition={indicatorTransition}
                  />
                )}
                <span className="relative z-10">{copy.tabs[cycle]}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-6xl"
          data-billing-cycle={billingCycle}
          initial={false}
          transition={panelTransition}
        >
          <div className="relative grid grid-cols-1 gap-6 lg:grid-cols-3">
            {activePlans.map((plan, index) => (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="flex"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                key={`pricing-slot-${index}`}
                layout
                transition={{
                  ...panelTransition,
                  delay: shouldReduceMotion ? 0 : index * 0.03,
                }}
              >
                <PlanCard copy={copy} plan={plan} />
              </motion.div>
            ))}
          </div>
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
            key="tamara-annual-banner"
            transition={{
              ...panelTransition,
              delay: shouldReduceMotion ? 0 : 0.08,
            }}
          >
            <TamaraAnnualBanner copy={copy} />
          </motion.div>
        </motion.div>
      </div>
    </PublicSection>
  );
}

function hydratePlans(plans: PricingPlan[], cycle: BillingCycle): PricingPlan[] {
  return plans.map((plan) => {
    const marketPricing = getMarketPricing({ marketId: "sa", planId: plan.id, cycle });
    return {
      ...plan,
      price: marketPricing.amount ?? "custom",
      period: cycle === "yearly" ? "year" : "month",
      href: plan.id === "custom" ? plan.href : `/billing?plan=${billingSelectionKey({ planId: plan.id, cycle })}`,
      entitlements: resolveSubscriptionEntitlements(plan.id),
      isPopular: marketPricing.publicFeatureFlags.highlighted,
    };
  });
}

function TamaraAnnualBanner({ copy }: { copy: (typeof planCopy)["en"] | (typeof planCopy)["ar"] }) {
  return (
    <aside
      className="relative mt-5 overflow-hidden rounded-[1.5rem] border border-[#D7C8FF] bg-[#F2E8FF] p-5 text-start text-[#16181D] transition duration-300 hover:bg-[#F5EDFF] dark:border-[#C9B8FF]/60 dark:bg-[#F2E8FF] md:p-6"
      data-testid="pricing-banner-tamara"
    >
      <div className="absolute inset-x-8 top-0 h-1 rounded-b-full bg-[#9600F1]" />

      <div className="grid items-center gap-6 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-[200px_minmax(0,1fr)_240px]">
        <div className="flex items-center">
          <Image
            alt={copy.tamara.logoAlt}
            className="h-auto w-40 object-contain md:w-44"
            height={687}
            priority={false}
            src={copy.tamara.logoSrc}
            width={1354}
          />
        </div>

        <div className="min-w-0">
          <Badge className="bg-[#9600F1] text-white dark:bg-[#9600F1] dark:text-white">
            {copy.tamara.label}
          </Badge>
          <h3 className="mt-3 text-2xl font-black tracking-tight md:text-3xl rtl:leading-[1.25]">{copy.tamara.title}</h3>
          <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-[#5A4A72]">
            {copy.tamara.description}
          </p>
        </div>

        <div className="rounded-2xl border border-[#D7C8FF] bg-white/55 p-4 md:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#9600F1]">{copy.tamara.note}</p>
              <p className="mt-2 text-2xl font-black tracking-tight">{copy.tamara.amount}</p>
            </div>
            <Sparkles className="mt-1 h-5 w-5 shrink-0 text-[#9600F1]" />
          </div>
          <LandingButton
            href="/billing?plan=good_yearly"
            className="mt-4 h-11 w-full rounded-full border-[#9600F1] bg-[#9600F1] text-white hover:bg-[#7E00CA] dark:border-[#9600F1] dark:bg-[#9600F1] dark:text-white"
            variant="secondary"
          >
            {copy.tamara.cta}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </LandingButton>
        </div>
      </div>
    </aside>
  );
}

function formatQuota(value: number) {
  if (value >= 1_000_000) return "Custom";
  return value.toLocaleString();
}

function PlanLimit({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 dark:border-white/10 dark:bg-white/[0.045]">
      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
      <p className="mt-1 truncate text-xs font-black capitalize text-zinc-900 dark:text-white">{value}</p>
    </div>
  );
}

function PlanCard({
  copy,
  plan,
}: {
  copy: (typeof planCopy)["en"] | (typeof planCopy)["ar"];
  plan: PricingPlan;
}) {
  const periodLabel = plan.period === "year" ? copy.perYear : copy.perMonth;

  return (
    <article
      className={cn(
        "relative flex min-h-[520px] w-full flex-col overflow-hidden rounded-[1.25rem] border border-zinc-200 bg-white p-5 text-start transition duration-300 hover:border-zinc-300 hover:bg-zinc-50/40 dark:border-white/10 dark:bg-[#171717] dark:hover:border-white/20 dark:hover:bg-[#1b1b1b] md:p-6",
        plan.isPopular && "border-zinc-950 bg-zinc-50 text-zinc-950 hover:border-zinc-950 hover:bg-zinc-100/70 dark:border-white/60 dark:bg-[#202020] dark:text-white dark:hover:bg-[#242424]",
      )}
      data-testid={`pricing-card-${plan.id}`}
    >
      <div className={cn("absolute inset-x-8 top-0 h-px", plan.isPopular ? "bg-zinc-950 dark:bg-white" : "bg-zinc-200 dark:bg-white/15")} />
      {plan.isPopular && (
        <Badge className="absolute end-6 top-5 rounded-full bg-zinc-950 px-3 text-white dark:bg-white dark:text-zinc-950">
          {plan.period === "year" ? copy.annualBadge : copy.popular}
        </Badge>
      )}

      <div>
        <h3 className={cn("text-2xl font-black tracking-tight", plan.isPopular && "pe-28")}>{plan.name}</h3>
        {plan.country && (
          <p className="mt-2 text-xs font-black uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            {plan.country}
          </p>
        )}
        <p className="mt-4 min-h-[72px] text-sm font-medium leading-7 text-zinc-500 dark:text-zinc-400">
          {plan.description}
        </p>
        <div className="mt-5 rounded-2xl border border-zinc-200 bg-zinc-50/80 p-4 dark:border-white/10 dark:bg-white/[0.035]">
          <p className="flex min-h-[52px] flex-wrap items-end gap-2">
            {typeof plan.price === "number" ? (
              <>
                <NumberFlow
                  className="text-4xl font-black tracking-tight"
                  transformTiming={{ duration: 900, easing: "ease-out" }}
                  value={plan.price}
                />
                <Image
                  alt={periodLabel}
                  className="mb-1 h-7 w-auto dark:invert md:h-9"
                  height={36}
                  src="/saudi-riyal-symbol.svg"
                  width={36}
                />
                <span className="pb-1 text-sm font-bold text-zinc-500 dark:text-zinc-400">
                  {periodLabel}
                </span>
              </>
            ) : (
              <span className="text-4xl font-black tracking-tight">
                {copy.customPrice}
              </span>
            )}
          </p>
        </div>
        {plan.entitlements && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <PlanLimit label="AI credits" value={plan.entitlements.aiAccess ? plan.entitlements.includedCredits.toLocaleString() : "None"} />
            <PlanLimit label="Apps" value={plan.entitlements.appAccessLevel} />
            <PlanLimit label="API calls" value={formatQuota(plan.entitlements.apiKeyQuota)} />
            <PlanLimit label="Agent links" value={formatQuota(plan.entitlements.agentLinkQuota)} />
          </div>
        )}
      </div>

      <LandingButton
        href={plan.href}
        className={cn(
          "mt-4 h-10 w-full rounded-full",
          plan.isPopular
            ? "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            : "border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/[0.06] dark:text-white dark:hover:bg-white/10",
        )}
        variant="secondary"
      >
        {plan.period === "year" && <CalendarDays className="h-4 w-4" />}
        {plan.buttonText}
        <ArrowRight className="h-4 w-4 rtl:rotate-180" />
      </LandingButton>

      <div className="my-5 h-px bg-zinc-200/80 dark:bg-white/10" />

      <ul className="mt-auto space-y-2.5">
        {plan.features.map((feature) => {
          const isIncluded = feature.included !== false;

          return (
            <li className="flex items-start gap-3" key={feature.title}>
              {isIncluded ? (
                <CircleCheck className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <CircleX className="mt-1 h-3.5 w-3.5 shrink-0 text-red-500/80 dark:text-red-300/80" />
              )}
              <span
                className={cn(
                  "text-[13px] font-bold leading-relaxed",
                  isIncluded ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-500 dark:text-zinc-500",
                )}
              >
                {feature.title}
              </span>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
