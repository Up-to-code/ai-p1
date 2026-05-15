"use client";

import NumberFlow from "@number-flow/react";
import { ArrowRight, CircleCheck } from "lucide-react";
import { useState } from "react";

import { LandingButton, PublicSection } from "@/components/landing/public-landing-kit";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const YEARLY_DISCOUNT = 20;
type TooltipKey = "sync" | "ai" | "governance";

type PricingPlan = {
  id: "launch" | "operate" | "institutional";
  name: string;
  price: number;
  description: string;
  buttonText: string;
  isPopular?: boolean;
  features: Array<{
    title: string;
    tooltip?: TooltipKey;
  }>;
};

const planCopy = {
  en: {
    eyebrow: "Pricing",
    title: "Choose the operating layer your team needs now.",
    description:
      "Start focused, then expand into deeper automation, verified inventory, broker coordination, and AI-assisted workflows as your portfolio grows.",
    monthly: "Monthly",
    yearly: `Yearly (Save ${YEARLY_DISCOUNT}%)`,
    popular: "Most Popular",
    perMonth: "per month",
    tooltips: {
      sync: "Keeps projects, units, media, pricing, and availability aligned across teams.",
      ai: "AI assists with triage, drafting, summaries, and repetitive operational work.",
      governance: "Controls roles, approvals, audit trails, and trusted organization access.",
    },
    plans: [
      {
        id: "launch",
        name: "Launch",
        price: 79,
        description: "For lean teams moving live inventory and client work into one trusted workspace.",
        buttonText: "Start launch",
        features: [
          { title: "Project and unit workspace", tooltip: "sync" },
          { title: "Client and broker coordination" },
          { title: "Media and document uploads" },
          { title: "Core organization roles", tooltip: "governance" },
        ],
      },
      {
        id: "operate",
        name: "Operate",
        price: 149,
        description: "For growing property teams that need approvals, automation, and cleaner market data.",
        buttonText: "Scale operations",
        isPopular: true,
        features: [
          { title: "Everything in Launch" },
          { title: "AI action center", tooltip: "ai" },
          { title: "Advanced access rules", tooltip: "governance" },
          { title: "Priority inventory sync", tooltip: "sync" },
        ],
      },
      {
        id: "institutional",
        name: "Institutional",
        price: 299,
        description: "For multi-team operators who need stronger governance and portfolio-grade execution.",
        buttonText: "Talk to Qentrah",
        features: [
          { title: "Everything in Operate" },
          { title: "Custom onboarding workflows" },
          { title: "Portfolio audit exports", tooltip: "governance" },
          { title: "Dedicated implementation support" },
        ],
      },
    ],
  },
  ar: {
    eyebrow: "التسعير",
    title: "اختر طبقة التشغيل المناسبة لفريقك الآن.",
    description:
      "ابدأ بنطاق واضح، ثم توسع إلى الأتمتة، المخزون الموثق، تنسيق الوسطاء، وسير العمل المدعوم بالذكاء الاصطناعي مع نمو محفظتك.",
    monthly: "شهري",
    yearly: `سنوي (وفر ${YEARLY_DISCOUNT}%)`,
    popular: "الأكثر استخداماً",
    perMonth: "شهرياً",
    tooltips: {
      sync: "يحافظ على توافق المشاريع والوحدات والوسائط والأسعار والتوفر بين الفرق.",
      ai: "يساعد الذكاء الاصطناعي في الفرز، الصياغة، التلخيص، والعمل التشغيلي المتكرر.",
      governance: "يدير الأدوار، الموافقات، سجلات التدقيق، ووصول المؤسسة الموثوق.",
    },
    plans: [
      {
        id: "launch",
        name: "إطلاق",
        price: 79,
        description: "للفرق الصغيرة التي تنقل المخزون والعملاء إلى مركز موثوق واحد.",
        buttonText: "ابدأ الإطلاق",
        features: [
          { title: "مساحة للمشاريع والوحدات", tooltip: "sync" },
          { title: "تنسيق العملاء والوسطاء" },
          { title: "رفع الوسائط والمستندات" },
          { title: "أدوار المؤسسة الأساسية", tooltip: "governance" },
        ],
      },
      {
        id: "operate",
        name: "تشغيل",
        price: 149,
        description: "لفرق العقار النامية التي تحتاج الموافقات، الأتمتة، وبيانات سوق أوضح.",
        buttonText: "وسّع العمليات",
        isPopular: true,
        features: [
          { title: "كل ما في إطلاق" },
          { title: "مركز إجراءات الذكاء الاصطناعي", tooltip: "ai" },
          { title: "قواعد وصول متقدمة", tooltip: "governance" },
          { title: "مزامنة مخزون ذات أولوية", tooltip: "sync" },
        ],
      },
      {
        id: "institutional",
        name: "مؤسسي",
        price: 299,
        description: "للمشغلين متعددي الفرق الذين يحتاجون حوكمة أقوى وتنفيذاً مؤسسياً.",
        buttonText: "تحدث مع كانترا",
        features: [
          { title: "كل ما في تشغيل" },
          { title: "سير عمل مخصص للتفعيل" },
          { title: "تصدير تدقيق للمحفظة", tooltip: "governance" },
          { title: "دعم تنفيذ مخصص" },
        ],
      },
    ],
  },
} satisfies Record<
  "en" | "ar",
  {
    eyebrow: string;
    title: string;
    description: string;
    monthly: string;
    yearly: string;
    popular: string;
    perMonth: string;
    tooltips: Record<string, string>;
    plans: PricingPlan[];
  }
>;

export function Pricing03({ locale }: { locale: string }) {
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState("monthly");
  const copy = locale === "ar" ? planCopy.ar : planCopy.en;

  return (
    <PublicSection
      id="pricing"
      className="relative bg-white py-14 dark:bg-zinc-950 md:py-20"
    >
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] border border-zinc-200/70 bg-white dark:border-white/10 dark:bg-white/[0.04]">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
          <div className="grid items-center gap-8 p-6 md:p-8 lg:grid-cols-[1fr_360px]">
            <div className="max-w-2xl text-start">
              <span className="inline-flex rounded-full border border-blue-500/15 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-blue-700 dark:border-blue-400/20 dark:bg-white/5 dark:text-blue-200">
                {copy.eyebrow}
              </span>
              <h2 className="mt-5 text-3xl font-bold tracking-tight text-black dark:text-white md:text-4xl rtl:leading-[1.18]">
                {copy.title}
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {copy.description}
              </p>
            </div>

            <div>
              <div className="grid h-12 min-w-[320px] grid-cols-2 gap-1 rounded-full border border-zinc-200 bg-zinc-50 p-1 dark:border-white/10 dark:bg-zinc-950/50">
                {(["monthly", "yearly"] as const).map((period) => {
                  const isActive = selectedBillingPeriod === period;

                  return (
                    <button
                      className={cn(
                        "inline-flex h-10 items-center justify-center rounded-full px-5 text-xs font-bold text-zinc-500 transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 dark:text-zinc-400",
                        isActive && "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950",
                      )}
                      key={period}
                      onClick={() => setSelectedBillingPeriod(period)}
                      type="button"
                    >
                      {period === "monthly" ? copy.monthly : copy.yearly}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      <div className="relative mt-9 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {copy.plans.map((plan) => {
          const price =
            selectedBillingPeriod === "monthly"
              ? plan.price
              : plan.price * ((100 - YEARLY_DISCOUNT) / 100);

          return (
            <article
              className={cn(
                "relative flex min-h-[430px] flex-col overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-zinc-50/60 p-6 text-start transition duration-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]",
                plan.isPopular && "border-blue-500 bg-blue-50/40 text-zinc-950 hover:bg-blue-50/50 dark:border-blue-400/70 dark:bg-blue-500/10 dark:text-white dark:hover:bg-blue-500/10",
              )}
              key={plan.name}
            >
              <div className={cn("absolute inset-x-6 top-0 h-1 rounded-b-full", plan.isPopular ? "bg-blue-500" : "bg-zinc-200 dark:bg-white/10")} />
              {plan.isPopular && (
                <Badge className="absolute end-6 top-5 bg-blue-600 text-white dark:bg-blue-600 dark:text-white">
                  {copy.popular}
                </Badge>
              )}

              <div>
                <h3 className={cn("text-xl font-bold tracking-tight", plan.isPopular && "pe-24")}>{plan.name}</h3>
                <p className="mt-4 min-h-[64px] text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {plan.description}
                </p>
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="flex items-end gap-2">
                    <NumberFlow
                      className="text-4xl font-bold tracking-tight md:text-5xl"
                      prefix="$"
                      value={price}
                    />
                    <span className="pb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                      {copy.perMonth}
                    </span>
                  </p>
                </div>
              </div>

              <LandingButton
                href={plan.id === "institutional" ? "/contact" : "/dashboard"}
                className={cn(
                  "mt-5 h-11 w-full rounded-full",
                  plan.isPopular
                    ? "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    : "border border-zinc-200 bg-white text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10",
                )}
                variant="secondary"
              >
                {plan.buttonText}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </LandingButton>

              <div className="my-6 h-px bg-zinc-200 dark:bg-white/10" />

              <ul className="mt-auto space-y-3">
                {plan.features.map((feature) => (
                  <li className="flex items-start gap-3" key={feature.title}>
                    <CircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold leading-relaxed">{feature.title}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </PublicSection>
  );
}
