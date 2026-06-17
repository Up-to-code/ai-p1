"use client";

import { PricingCard } from "./pricing-card";
import { PublicSection } from "./public-landing-kit";

type PricingFeature = {
  title: string;
  included?: boolean;
};

type PricingPlan = {
  name: string;
  description: string;
  price: number | string;
  priceSuffix: string;
  priceNote?: string;
  buttonText: string;
  buttonHref: string;
  features: PricingFeature[];
  isPopular: boolean;
  popularBadgeText: string;
};

const planCopy = {
  en: {
    sectionLabel: "PRICING",
    sectionTitle: "Plans that scale with you.",
    plans: [
      {
        name: "Starter",
        description: "For individuals and small teams getting started.",
        price: 0,
        priceSuffix: "forever free",
        priceNote: "No credit card required",
        buttonText: "Get started",
        buttonHref: "/sign-up",
        features: [
          { title: "Up to 3 users" },
          { title: "5 active projects" },
          { title: "Basic task management" },
          { title: "Client portal" },
          { title: "Calendar sync" },
          { included: false, title: "AI agents" },
          { included: false, title: "Custom integrations" },
        ],
        isPopular: false,
        popularBadgeText: "",
      },
      {
        name: "Growth",
        description: "For growing teams that need AI-powered workflows.",
        price: 19,
        priceSuffix: "per user / month",
        priceNote: "Billed annually",
        buttonText: "Start free trial",
        buttonHref: "/sign-up?plan=growth",
        features: [
          { title: "Unlimited users" },
          { title: "Unlimited projects" },
          { title: "AI agents and workflows" },
          { title: "All apps and integrations" },
          { title: "Priority support" },
          { title: "Advanced analytics" },
          { title: "Custom automations" },
        ],
        isPopular: true,
        popularBadgeText: "Most Popular",
      },
      {
        name: "Enterprise",
        description: "For organizations that need custom workflows and dedicated support.",
        price: "Custom",
        priceSuffix: "tailored to your needs",
        priceNote: undefined,
        buttonText: "Talk to sales",
        buttonHref: "/contact",
        features: [
          { title: "Everything in Growth" },
          { title: "Custom AI credit allocation" },
          { title: "Private MCP workflows" },
          { title: "Dedicated account manager" },
          { title: "SSO and SAML" },
          { title: "SLA guarantee" },
        ],
        isPopular: false,
        popularBadgeText: "",
      },
    ] as PricingPlan[],
  },
  ar: {
    sectionLabel: "التسعير",
    sectionTitle: "خطط تناسب نموك.",
    plans: [
      {
        name: "Starter",
        description: "للأفراد والفرق الصغيرة التي تبدأ.",
        price: 0,
        priceSuffix: "مجانيForever",
        priceNote: "لا حاجة لبطاقة ائتمان",
        buttonText: "ابدأ الآن",
        buttonHref: "/sign-up",
        features: [
          { title: "حتى 3 مستخدمين" },
          { title: "5 مشاريع نشطة" },
          { title: "إدارة مهام أساسية" },
          { title: "بوابة العملاء" },
          { title: "مزامنة التقويم" },
          { included: false, title: "وكلاء الذكاء الاصطناعي" },
          { included: false, title: "تكاملات مخصصة" },
        ],
        isPopular: false,
        popularBadgeText: "",
      },
      {
        name: "Growth",
        description: "للفرق النمو التي تحتاج سير عمل مدعوم بالذكاء الاصطناعي.",
        price: 19,
        priceSuffix: "لكل مستخدم / شهرياً",
        priceNote: "الفوترة سنوية",
        buttonText: "ابدأ التجربة المجانية",
        buttonHref: "/sign-up?plan=growth",
        features: [
          { title: "مستخدمون غير محدودين" },
          { title: "مشاريع غير محدودة" },
          { title: "وكلاء الذكاء الاصطناعي وسير العمل" },
          { title: "جميع التطبيقات والتكاملات" },
          { title: "دعم ذو أولوية" },
          { title: "تحليلات متقدمة" },
          { title: "أتمتة مخصصة" },
        ],
        isPopular: true,
        popularBadgeText: "الأكثر شعبية",
      },
      {
        name: "Enterprise",
        description: "للمنظمات التي تحتاج سير عمل مخصص ودعم مخصص.",
        price: "مخصص",
        priceSuffix: "مصمم لاحتياجاتك",
        priceNote: undefined,
        buttonText: "تحدث مع المبيعات",
        buttonHref: "/contact",
        features: [
          { title: "كل مزايا Growth" },
          { title: "تخصيص رصيد الذكاء الاصطناعي" },
          { title: "سير عمل MCP خاص" },
          { title: "مدير حساب مخصص" },
          { title: "SSO و SAML" },
          { title: "ضمان SLA" },
        ],
        isPopular: false,
        popularBadgeText: "",
      },
    ] as PricingPlan[],
  },
};

export function PricingSection({ locale }: { locale: string }) {
  const copy = locale === "ar" ? planCopy.ar : planCopy.en;

  return (
    <PublicSection
      id="pricing"
      className="relative bg-[var(--q-bg)] py-12 md:py-16"
    >
      <div className="mx-auto max-w-[1080px] px-[18px]">
        <div className="mb-8">
          <span className="block text-[10px] font-medium uppercase tracking-[0.1em] text-[var(--q-text-muted)]">
            {copy.sectionLabel}
          </span>
          <h2 className="mt-1 text-[18px] font-medium tracking-[-0.01em] text-[var(--q-text-primary)]">
            {copy.sectionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-[10px] md:grid-cols-3">
          {copy.plans.map((plan) => (
            <PricingCard
              key={plan.name}
              planName={plan.name}
              description={plan.description}
              price={plan.price}
              priceSuffix={plan.priceSuffix}
              priceNote={plan.priceNote}
              buttonText={plan.buttonText}
              buttonHref={plan.buttonHref}
              features={plan.features}
              isPopular={plan.isPopular}
              popularBadgeText={plan.popularBadgeText}
            />
          ))}
        </div>
      </div>
    </PublicSection>
  );
}
