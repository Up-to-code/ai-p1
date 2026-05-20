"use client";

import NumberFlow from "@number-flow/react";
import Image from "next/image";
import { ArrowRight, CircleCheck } from "lucide-react";

import { LandingButton, PublicSection } from "@/components/landing/public-landing-kit";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type TooltipKey = "sync" | "ai" | "governance";

type PricingPlan = {
  id: "saudi" | "custom";
  name: string;
  price: number | "custom";
  country?: string;
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
    popular: "Saudi Arabia",
    perMonth: "per month",
    customPrice: "Custom",
    tooltips: {
      sync: "Keeps projects, units, media, pricing, and availability aligned across teams.",
      ai: "AI assists with triage, drafting, summaries, and repetitive operational work.",
      governance: "Controls roles, approvals, audit trails, and trusted organization access.",
    },
    plans: [
      {
        id: "saudi",
        name: "Saudi Arabia",
        country: "Saudi Arabia",
        price: 499,
        description: "For teams operating in Saudi Arabia that need Qentrah connected to daily sales and follow-up work.",
        buttonText: "Start setup",
        isPopular: true,
        features: [
          { title: "Free setup phase included" },
          { title: "Project, unit, and client workspace", tooltip: "sync" },
          { title: "WhatsApp, Telegram, and automation support" },
          { title: "Core organization roles", tooltip: "governance" },
        ],
      },
      {
        id: "custom",
        name: "Custom",
        price: "custom",
        description: "For larger teams, advanced automations, private workflows, or multi-country operating models.",
        buttonText: "Talk to Qentrah",
        features: [
          { title: "Custom pricing by scope" },
          { title: "Advanced automation chains", tooltip: "ai" },
          { title: "Private integrations and webhooks", tooltip: "sync" },
          { title: "Portfolio audit exports", tooltip: "governance" },
        ],
      },
    ],
  },
  ar: {
    eyebrow: "التسعير",
    popular: "السعودية",
    perMonth: "شهرياً",
    customPrice: "مخصص",
    tooltips: {
      sync: "يحافظ على توافق المشاريع والوحدات والوسائط والأسعار والتوفر بين الفرق.",
      ai: "يساعد الذكاء الاصطناعي في الفرز، الصياغة، التلخيص، والعمل التشغيلي المتكرر.",
      governance: "يدير الأدوار، الموافقات، سجلات التدقيق، ووصول المؤسسة الموثوق.",
    },
    plans: [
      {
        id: "saudi",
        name: "السعودية",
        country: "المملكة العربية السعودية",
        price: 499,
        description: "للفرق العاملة في السعودية التي تحتاج ربط كانترا بالمبيعات والمتابعات اليومية.",
        buttonText: "ابدأ الإعداد",
        isPopular: true,
        features: [
          { title: "مرحلة إعداد مجانية" },
          { title: "مساحة للمشاريع والوحدات والعملاء", tooltip: "sync" },
          { title: "دعم واتساب وتيليجرام والأتمتة" },
          { title: "أدوار المؤسسة الأساسية", tooltip: "governance" },
        ],
      },
      {
        id: "custom",
        name: "مخصص",
        price: "custom",
        description: "للفرق الأكبر، الأتمتة المتقدمة، سير العمل الخاص، أو التشغيل في أكثر من سوق.",
        buttonText: "تحدث مع كانترا",
        features: [
          { title: "تسعير حسب النطاق" },
          { title: "سلاسل أتمتة متقدمة", tooltip: "ai" },
          { title: "تكاملات خاصة وWebhooks", tooltip: "sync" },
          { title: "تصدير تدقيق للمحفظة", tooltip: "governance" },
        ],
      },
    ],
  },
} satisfies Record<
  "en" | "ar",
  {
    eyebrow: string;
    popular: string;
    perMonth: string;
    customPrice: string;
    tooltips: Record<string, string>;
    plans: PricingPlan[];
  }
>;

export function Pricing03({ locale }: { locale: string }) {
  const copy = locale === "ar" ? planCopy.ar : planCopy.en;

  return (
    <PublicSection
      id="pricing"
      className="relative bg-white py-14 dark:bg-zinc-950 md:py-20"
    >
      <div className="relative mx-auto grid max-w-4xl grid-cols-1 gap-4 lg:grid-cols-2">
        {copy.plans.map((plan) => {
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
                {plan.country && (
                  <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-200">
                    {plan.country}
                  </p>
                )}
                <p className="mt-4 min-h-[64px] text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {plan.description}
                </p>
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
                  <p className="flex items-end gap-2">
                    {typeof plan.price === "number" ? (
                      <>
                        <NumberFlow
                          className="text-4xl font-bold tracking-tight md:text-5xl"
                          value={plan.price}
                        />
                        <Image
                          alt={copy.perMonth}
                          className="mb-1 h-7 w-7 dark:invert md:h-9 md:w-9"
                          height={36}
                          src="/saudi-riyal-symbol.svg"
                          width={36}
                        />
                        <span className="pb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                          {copy.perMonth}
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold tracking-tight md:text-5xl">
                        {copy.customPrice}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <LandingButton
                href={plan.id === "custom" ? "/contact" : "/dashboard"}
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
