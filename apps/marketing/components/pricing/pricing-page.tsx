"use client";

import { Fragment, useState, useMemo } from "react";
import { useLocale } from "next-intl";

import { cn } from "@/lib/utils";

import { BillingToggle } from "./billing-toggle";
import { PlanCard } from "./plan-card";
import { FeatureTable } from "./feature-table";
import { FaqAccordion } from "./faq-accordion";
import type { BillingCycle, Plan, FeatureSection } from "./types";

const platformComparison = {
  en: {
    eyebrow: "PLATFORM COMPARISON",
    title: "Compare through the client-delivery lens.",
    description: "Qentrah connects the client record, opportunity, project, documents, and tasks behind a delivery—not simply a list of tasks.",
    button: "Compare platforms",
    columns: ["Qentrah", "ClickUp", "Asana", "Notion"],
    sections: [
      { label: "OPERATING MODEL", rows: [
        ["Primary center of gravity", "Client work and delivery", "Configurable work", "Goals and cross-functional work", "Docs and databases"],
        ["Projects and tasks", "Connected to clients", "Native", "Native", "Native"],
        ["Documents alongside work", "Project-linked", "Docs", "Project updates", "Native"],
        ["Client record", "Native workspace resource", "Configured", "Configured", "Databases"],
      ] },
      { label: "CONTROL AND EXECUTION", rows: [
        ["Access model", "Organization · space · project", "Workspace setup", "Project setup", "Database setup"],
        ["Agent and tool scope", "Scoped MCP tools", "Workspace capabilities", "Work management capabilities", "Page and database context"],
        ["Work handoff context", "Client, project, task, and document", "Configured relationships", "Projects and tasks", "Relations and databases"],
      ] },
      { label: "AI WORK", rows: [
        ["AI assistance", "Scoped workspace actions", "ClickUp Brain", "Asana AI", "Notion AI"],
        ["Context supplied to AI", "Projects, clients, documents", "Workspace content", "Work graph", "Pages and databases"],
      ] },
    ],
    labels: ["Capability", "Qentrah", "ClickUp", "Asana", "Notion"],
    note: "Product descriptions are condensed summaries. Check each vendor’s current product documentation before making a purchasing decision.",
  },
  ar: {
    eyebrow: "مقارنة المنصات",
    title: "قارن من خلال منظور العميل والتسليم.",
    description: "يربط Qentrah سجل العميل والفرصة والمشروع والمستندات والمهام خلف التسليم، لا مجرد قائمة مهام.",
    button: "قارن المنصات",
    columns: ["Qentrah", "ClickUp", "Asana", "Notion"],
    sections: [
      { label: "نموذج التشغيل", rows: [
        ["نقطة التركيز الرئيسية", "عمل العميل والتسليم", "عمل قابل للتخصيص", "الأهداف والعمل عبر الفرق", "المستندات وقواعد البيانات"],
        ["المشاريع والمهام", "مرتبطة بالعملاء", "مدمجة", "مدمجة", "مدمجة"],
        ["المستندات بجانب العمل", "مرتبطة بالمشروع", "مستندات", "تحديثات المشاريع", "مدمجة"],
        ["سجل العميل", "مورد أصيل لمساحة العمل", "إعداد مخصص", "إعداد مخصص", "قواعد بيانات"],
      ] },
      { label: "التحكم والتنفيذ", rows: [
        ["نموذج الوصول", "المؤسسة · المساحة · المشروع", "إعداد مساحة العمل", "إعداد المشروع", "إعداد قاعدة البيانات"],
        ["نطاق الوكلاء والأدوات", "أدوات MCP ضمن النطاق", "قدرات مساحة العمل", "قدرات إدارة العمل", "سياق الصفحة وقاعدة البيانات"],
        ["سياق تسليم العمل", "العميل والمشروع والمهمة والمستند", "علاقات مخصصة", "المشاريع والمهام", "العلاقات وقواعد البيانات"],
      ] },
      { label: "العمل بالذكاء الاصطناعي", rows: [
        ["المساعدة بالذكاء الاصطناعي", "إجراءات مساحة عمل ضمن النطاق", "ClickUp Brain", "Asana AI", "Notion AI"],
        ["السياق المقدم للذكاء", "مشاريع وعملاء ومستندات", "محتوى مساحة العمل", "رسم العمل", "الصفحات وقواعد البيانات"],
      ] },
    ],
    labels: ["القدرة", "Qentrah", "ClickUp", "Asana", "Notion"],
    note: "هذه الأوصاف ملخصات مختصرة. راجع وثائق كل مزود الحالية قبل اتخاذ قرار الشراء.",
  },
} as const;

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
    originalMonthlyPrice: 10,
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
    monthlyPrice: 19,
    annuallyPrice: 190,
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
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const features = useMemo(() => buildFeatures(isAr), [isAr]);
  const plans = isAr ? PLANS_AR : PLANS_CONFIG;
  const comparison = isAr ? platformComparison.ar : platformComparison.en;

  return (
    <main className="cu-pricing-root" dir={isAr ? "rtl" : "ltr"}>
      <div className="cu-pricing-inner">

        {/* ── 1. HERO ────────────────────────────────────────────── */}
        <section className="cu-pricing-hero">
          <p className="cu-pricing-eyebrow">{isAr ? "التسعير" : "PRICING"}</p>
          <h1 className="cu-pricing-headline">
            {isAr ? (
              <>
                <span className="cu-hl-dark">مساحة عمل واحدة </span>
                <span className="cu-hl-faded">لعمل</span>
                <br />
                <span className="cu-hl-dark">العميل و</span>
                <span className="cu-hl-faded">التسليم.</span>
              </>
            ) : (
              <>
                <span className="cu-hl-dark">One workspace for </span>
                <span className="cu-hl-faded">client</span>
                <br />
                <span className="cu-hl-dark">work and </span>
                <span className="cu-hl-faded">delivery.</span>
              </>
            )}
          </h1>
          <p className="cu-pricing-subtitle">
            {isAr
            ? "ابدأ بالخطة المناسبة لفريقك، ثم حافظ على العميل والمشروع والمستندات والتنفيذ مترابطة في مساحة عمل واحدة."
              : "Choose a plan for your team, then keep the client, project, documents, and delivery work connected in one workspace."}
          </p>
          <a className="cu-pricing-compare-link" href="#platform-comparison">{comparison.button} <span aria-hidden>↓</span></a>
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
          />
        </div>

        {/* ── 3. PLAN CARDS ─────────────────────────────────────── */}
        <section className="cu-pricing-cards" aria-label={isAr ? "خطط التسعير" : "Pricing plans"}>
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} billing={billing} isAr={isAr} />
          ))}
        </section>
        <p className="cu-pricing-compare-note">
          {isAr ? "قارن كل المزايا وخيارات الدعم أدناه." : "Compare every feature and support option below."}
        </p>

        <section className="cu-platform-comparison" id="platform-comparison" aria-labelledby="platform-comparison-title">
          <div className="cu-platform-comparison-copy">
            <p>{comparison.eyebrow}</p>
            <h2 id="platform-comparison-title">{comparison.title}</h2>
            <span>{comparison.description}</span>
          </div>
          <div className="cu-platform-comparison-scroll" tabIndex={0} aria-label={comparison.title}>
            <table className="cu-platform-comparison-table">
              <thead>
                <tr>
                  {comparison.labels.map((label, index) => <th className={index === 1 ? "cu-platform-comparison-qentrah-head" : undefined} key={label}>{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {comparison.sections.map((section) => (
                  <Fragment key={section.label}>
                    <tr className="cu-platform-comparison-category"><td colSpan={comparison.labels.length}>{section.label}</td></tr>
                    {section.rows.map(([capability, ...values]) => (
                      <tr key={capability}>
                        <th scope="row">{capability}</th>
                        {values.map((value, index) => <td className={index === 0 ? "cu-platform-comparison-qentrah-cell" : undefined} key={`${capability}-${index}`}>{value}</td>)}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <p className="cu-platform-comparison-note">{comparison.note}</p>
        </section>

      </div>

      <div className="cu-pricing-inner">
        {/* ── 4. FEATURE COMPARISON ─────────────────────────────── */}
        <FeatureTable
          plans={plans}
          sections={features}
          billing={billing}
          highlightIndex={2}
          isAr={isAr}
        />

        {/* ── 5. FAQ ────────────────────────────────────────────── */}
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
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (max-width: 640px) {
          .cu-pricing-inner { padding: 0 16px; }
        }

        /* Hero */
        .cu-pricing-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(260px, .75fr);
          column-gap: 64px;
          align-items: end;
          padding: 148px 0 56px;
        }
        .cu-pricing-eyebrow {
          grid-column: 1 / -1;
          margin: 0 0 24px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--q-text-muted);
        }
        .cu-pricing-headline {
          font-size: clamp(2.75rem, 6vw, 4.75rem);
          font-weight: 700;
          line-height: 1;
          letter-spacing: -0.055em;
          margin: 0;
          text-align: start;
        }
        .cu-hl-dark   { color: var(--q-text-primary); }
        .cu-hl-faded  { color: var(--q-text-muted); }
        .cu-pricing-subtitle {
          max-width: 430px;
          margin: 0;
          font-size: 17px;
          line-height: 1.6;
          color: var(--q-text-secondary);
        }

        /* Controls row: guarantee left, toggle right */
        .cu-pricing-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          max-width: 1240px;
          margin: 0 auto 36px;
          padding: 0 24px;
          flex-wrap: wrap;
          border-top: 1px solid var(--q-border);
          padding-top: 24px;
        }
        @media (max-width: 640px) {
          .cu-pricing-controls-row { padding: 0 16px; justify-content: center; }
        }
        .cu-pricing-guarantee {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          color: var(--q-text-secondary);
        }

        /* Plan cards */
        .cu-pricing-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0;
        }
        .cu-pricing-compare-note {
          margin: 20px 0 0;
          font-size: 14px;
          text-align: center;
          color: var(--q-text-muted);
        }
        .cu-pricing-compare-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          grid-column: 1;
          justify-self: start;
          margin-top: 20px;
          color: var(--q-text-primary);
          font-size: 14px;
          font-weight: 650;
          text-decoration: none;
        }
        .cu-pricing-compare-link:hover { color: var(--q-text-secondary); }
        .cu-platform-comparison {
          margin-top: 96px;
          padding: 40px 0;
          border-top: 1px solid var(--q-border);
          border-bottom: 1px solid var(--q-border);
        }
        .cu-platform-comparison-copy {
          display: grid;
          grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr);
          gap: 32px;
          align-items: end;
          margin-bottom: 36px;
        }
        .cu-platform-comparison-copy p {
          grid-column: 1 / -1;
          margin: 0;
          color: var(--q-text-muted);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: .12em;
        }
        .cu-platform-comparison-copy h2 {
          margin: 0;
          font-size: clamp(2rem, 4vw, 3.5rem);
          font-weight: 700;
          line-height: 1.02;
          letter-spacing: -.055em;
          color: var(--q-text-primary);
        }
        .cu-platform-comparison-copy > span {
          max-width: 520px;
          color: var(--q-text-secondary);
          font-size: 16px;
          line-height: 1.6;
        }
        .cu-platform-comparison-scroll {
          overflow-x: auto;
          border-radius: 12px;
          scrollbar-color: var(--q-border-strong) transparent;
          scrollbar-width: thin;
        }
        .cu-platform-comparison-table {
          width: 100%;
          min-width: 860px;
          border-collapse: collapse;
          border: 1px solid var(--q-border);
          border-radius: 12px;
        }
        .cu-platform-comparison-table th,
        .cu-platform-comparison-table td {
          padding: 15px 18px;
          border-bottom: 1px solid var(--q-border);
          border-inline-end: 1px solid var(--q-border);
          color: var(--q-text-secondary);
          font-size: 13px;
          line-height: 1.45;
          text-align: left;
          vertical-align: middle;
        }
        .cu-platform-comparison-table th:last-child,
        .cu-platform-comparison-table td:last-child { border-inline-end: 0; }
        .cu-platform-comparison-table thead th {
          background: var(--q-card);
          color: var(--q-text-primary);
          font-size: 13px;
          font-weight: 700;
          text-align: center;
        }
        .cu-platform-comparison-table thead th:first-child {
          width: 220px;
          text-align: left;
        }
        .cu-platform-comparison-table tbody > tr:last-child > * { border-bottom: 0; }
        .cu-platform-comparison-table tbody th {
          background: var(--q-card);
          color: var(--q-text-primary);
          font-weight: 600;
        }
        .cu-platform-comparison-category td {
          padding: 10px 18px;
          background: var(--q-bg-secondary);
          color: var(--q-text-muted);
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .12em;
        }
        .cu-platform-comparison-qentrah-head {
          background: var(--q-text-primary) !important;
          color: var(--q-bg) !important;
        }
        .cu-platform-comparison-qentrah-cell {
          background: var(--q-bg-secondary);
          color: var(--q-text-primary) !important;
          font-weight: 600;
        }
        .cu-platform-comparison-note { margin: 18px 0 0; color: var(--q-text-muted); font-size: 12px; line-height: 1.5; }
        @media (max-width: 720px) {
          .cu-platform-comparison { margin-top: 72px; }
          .cu-platform-comparison-copy { grid-template-columns: 1fr; gap: 16px; }
          .cu-platform-comparison-table th,
          .cu-platform-comparison-table td { padding: 13px 16px; }
        }
        /* Keep cards equal height without forcing a shared container. */
        .cu-pricing-cards .cu-plan-card {
          min-height: 100%;
        }
        .cu-pricing-cards .cu-plan-card:hover { box-shadow: none; }
        @media (max-width: 900px) {
          .cu-pricing-cards { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .cu-pricing-cards { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .cu-pricing-hero {
            grid-template-columns: 1fr;
            row-gap: 22px;
            padding: 120px 0 48px;
          }
          .cu-pricing-eyebrow { margin-bottom: 0; }
          .cu-pricing-subtitle { max-width: 520px; }
        }
      `}</style>
    </main>
  );
}
