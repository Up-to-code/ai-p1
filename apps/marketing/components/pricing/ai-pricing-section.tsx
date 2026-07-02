"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type AiPlan = {
  name: string;
  price: string | null;
  perUnit: string | null;
  badge: string | null;
  cta: string;
  ctaHref: string;
  whyLink: string | null;
  highlight: boolean;
  sectionHeader: string;
  features: string[];
  credits: string | null;
};

function CheckGreen() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" fill="var(--q-human-green, #2BB673)" />
      <polyline points="16 9 10.5 15 8 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function buildAiPlans(isAr: boolean): AiPlan[] {
  if (isAr) {
    return [
      {
        name: "مجاني للأبد",
        price: null,
        perUnit: null,
        badge: null,
        cta: "ابدأ الآن",
        ctaHref: "/billing?plan=free",
        whyLink: null,
        highlight: false,
        sectionHeader: "ابدأ باستخدام الذكاء الاصطناعي",
        features: [
          "جرب الذكاء الاصطناعي في المحادثات والمهام والمستندات",
          "تجربة ميزات الذكاء الاصطناعي المتقدمة",
          "الترقية في أي وقت",
        ],
        credits: null,
      },
      {
        name: "Brain AI",
        price: "$9",
        perUnit: "لكل مستخدم/شهر",
        badge: null,
        cta: "ابدأ الآن",
        ctaHref: "/billing?plan=brain_ai",
        whyLink: "لماذا Brain AI",
        highlight: false,
        sectionHeader: "أبرز الميزات",
        features: [
          "مساعد Brain غير محدود",
          "وكيل @Brain غير محدود",
          "محادثة AI غير محدودة — Claude, ChatGPT, Gemini",
          "استخدام موسع لنماذج AI المتقدمة",
          "كتابة AI غير محدودة",
          "بحث المؤسسة — مساحة العمل",
        ],
        credits: "+1,500 رصيد AI Super\nمستخدم / شهر للوكلاء والأتمتة والمزيد",
      },
      {
        name: "Everything AI",
        price: "$28",
        perUnit: "لكل مستخدم/شهر",
        badge: "الموصى به",
        cta: "ابدأ الآن",
        ctaHref: "/billing?plan=everything_ai",
        whyLink: "لماذا Everything AI",
        highlight: true,
        sectionHeader: "الأفضل لمجموعة الوكلاء الكاملة",
        features: [
          "إجابات ذكية غير محدودة",
          "مدوّن ملاحظات AI غير محدود",
          "توليد صور غير محدود *",
          "حقول AI غير محدودة",
          "أتمتة ولوحات AI غير محدودة",
          "تعيين وترتيب أولويات AI غير محدود",
          "استخدام مضاعف للوكلاء الخارقين",
          "بحث المؤسسة — خاص ومساحة العمل",
        ],
        credits: "+5,000 رصيد AI Super\nمستخدم / شهر للوكلاء الخارقين",
      },
    ];
  }
  return [
    {
      name: "Free Forever",
      price: null,
      perUnit: null,
      badge: null,
      cta: "Get started",
      ctaHref: "/billing?plan=free",
      whyLink: null,
      highlight: false,
      sectionHeader: "START USING AI",
      features: [
        "Try AI across chat, tasks and docs",
        "Trial access to advanced AI features",
        "Upgrade at any time",
      ],
      credits: null,
    },
    {
      name: "Brain AI",
      price: "$9",
      perUnit: "Per user/month",
      badge: null,
      cta: "Get started",
      ctaHref: "/billing?plan=brain_ai",
      whyLink: "Why Brain AI",
      highlight: false,
      sectionHeader: "HIGHLIGHTS",
      features: [
        "Unlimited Brain Assistant",
        "Unlimited @Brain Agent",
        "Unlimited AI chat — Claude, ChatGPT, Gemini",
        "Expanded use of Premium AI Models",
        "Unlimited AI writing",
        "Enterprise Search — Workspace",
      ],
      credits: "+1,500 AI Super Credits\nuser / mo for Agents, Automations, & more",
    },
    {
      name: "Everything AI",
      price: "$28",
      perUnit: "Per user/month",
      badge: "RECOMMENDED",
      cta: "Get started",
      ctaHref: "/billing?plan=everything_ai",
      whyLink: "Why Everything AI",
      highlight: true,
      sectionHeader: "BEST FOR FULL AGENTIC SUITE",
      features: [
        "Unlimited Ambient Answers",
        "Unlimited AI Notetaker",
        "Unlimited Image Generation *",
        "Unlimited AI Fields",
        "Unlimited AI Automations & Dashboards",
        "Unlimited AI Assign & Prioritize",
        "2X more usage of Super Agents",
        "Enterprise Search — Private & Workspace",
      ],
      credits: "+5,000 AI Super Credits\nuser / mo for Super Agents",
    },
  ];
}

export function AiPricingSection({ isAr }: { isAr: boolean }) {
  const plans = buildAiPlans(isAr);
  const [billing, setBilling] = useState<"monthly" | "annually">("annually");

  return (
    <section className="cu-ai-section" dir={isAr ? "rtl" : "ltr"}>
      <div className="cu-ai-inner">
        {/* Header */}
        <p className="cu-ai-eyebrow">
          {isAr ? "[ تسعير الذكاء الاصطناعي ]" : "[ AI PRICING ]"}
        </p>
        <h2 className="cu-ai-headline">
          {isAr ? (
            <>أكثر ذكاء اصطناعي<br />تقدماً في العالم للعمل</>
          ) : (
            <>The world&apos;s most<br />advanced AI for work</>
          )}
        </h2>

        {/* Toggle */}
        <div className="cu-ai-toggle-row">
          <span className="cu-ai-save-text">
            {isAr ? "وفّر حتى 20 % مع السنوي" : "Save up to 20% with yearly"}
          </span>
          <div className="cu-ai-toggle-pill">
            <button
              type="button"
              className={cn("cu-ai-toggle-btn", billing === "monthly" && "cu-ai-toggle-btn--active")}
              onClick={() => setBilling("monthly")}
            >
              {isAr ? "شهري" : "Monthly"}
            </button>
            <button
              type="button"
              className={cn("cu-ai-toggle-btn", billing === "annually" && "cu-ai-toggle-btn--active")}
              onClick={() => setBilling("annually")}
            >
              {isAr ? "سنوي" : "Yearly"}
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="cu-ai-cards">
          {plans.map((plan) => (
            <div key={plan.name} className={cn("cu-ai-card", plan.highlight && "cu-ai-card--highlight")}>
              <div className="cu-ai-card-top">
                <div className="cu-ai-name-row">
                  <span className="cu-ai-name">{plan.name}</span>
                  {plan.badge && <span className="cu-ai-badge">{plan.badge}</span>}
                </div>
                {plan.price ? (
                  <>
                    <div className="cu-ai-price">{plan.price}</div>
                    {plan.perUnit && <p className="cu-ai-per">{plan.perUnit}</p>}
                  </>
                ) : null}
              </div>

              <a href={plan.ctaHref} className={cn("cu-ai-cta", plan.highlight ? "cu-ai-cta--primary" : "cu-ai-cta--outline")}>
                {plan.cta}
              </a>
              {plan.whyLink && (
                <a href="#" className="cu-ai-why-link">
                  {plan.whyLink} <span className="cu-ai-why-icon">ⓘ</span>
                </a>
              )}

              <div className="cu-ai-features">
                <p className="cu-ai-features-header">{plan.sectionHeader}</p>
                <ul className="cu-ai-features-list" role="list">
                  {plan.features.map((f) => (
                    <li key={f} className="cu-ai-feature-item">
                      <CheckGreen />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {plan.credits && (
                <div className="cu-ai-credits">
                  {plan.credits.split("\n").map((line, i) => (
                    <p key={i} className={i === 0 ? "cu-ai-credits-amount" : "cu-ai-credits-desc"}>
                      {line}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom tabs */}
        <div className="cu-ai-bottom-bar">
          <div className="cu-ai-bottom-item">
            <span className="cu-ai-bottom-label">{isAr ? "أرصدة AI Super" : "AI Super Credits"}</span>
          </div>
          <div className="cu-ai-bottom-item cu-ai-bottom-item--center">
            <span className="cu-ai-bottom-price">$0.001</span>
            <span className="cu-ai-bottom-sub">
              {isAr ? "$10 لكل 10,000 رصيد" : "$10 per 10,000 credits"}
            </span>
          </div>
          <div className="cu-ai-bottom-item">
            <span className="cu-ai-bottom-label">
              {isAr ? "وكلاء قنترة المعتمدون" : "Qentrah Certified Agents"}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .cu-ai-section {
          background: var(--q-text-primary);
          color: var(--q-bg);
          margin: 60px -24px 0;
          padding: 0 24px;
        }
        @media (max-width: 640px) {
          .cu-ai-section { margin: 40px -16px 0; padding: 0 16px; }
        }
        .cu-ai-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 72px 0 0;
        }

        .cu-ai-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: rgba(255,255,255,0.4);
          margin-bottom: 20px;
        }
        .cu-ai-headline {
          font-size: clamp(2rem, 4vw, 2.8rem);
          font-weight: 800;
          line-height: 1.12;
          letter-spacing: -0.02em;
          color: var(--q-bg);
          margin-bottom: 40px;
        }

        .cu-ai-toggle-row {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 14px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .cu-ai-save-text {
          font-size: 13px;
          font-weight: 600;
          color: var(--q-human-green, #2BB673);
        }
        .cu-ai-toggle-pill {
          display: inline-flex;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 3px;
        }
        .cu-ai-toggle-btn {
          border-radius: 9999px;
          padding: 7px 18px;
          font-size: 13px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          background: none;
          color: rgba(255,255,255,0.5);
          transition: background 0.2s, color 0.2s;
        }
        .cu-ai-toggle-btn--active {
          background: rgba(255,255,255,1);
          color: var(--q-text-primary);
          font-weight: 600;
        }

        .cu-ai-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0;
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 16px;
          overflow: hidden;
        }
        @media (max-width: 768px) {
          .cu-ai-cards { grid-template-columns: 1fr; }
        }
        .cu-ai-card {
          padding: 32px 24px 36px;
          border-right: 1px solid rgba(255,255,255,0.1);
          display: flex;
          flex-direction: column;
        }
        .cu-ai-card:last-child { border-right: none; }
        [dir="rtl"] .cu-ai-card { border-right: none; border-left: 1px solid rgba(255,255,255,0.1); }
        [dir="rtl"] .cu-ai-card:last-child { border-left: none; }
        .cu-ai-card--highlight {
          background: rgba(255,255,255,0.06);
        }

        .cu-ai-card-top { margin-bottom: 20px; }
        .cu-ai-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .cu-ai-name { font-size: 18px; font-weight: 700; color: var(--q-bg); }
        .cu-ai-badge {
          font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
          background: rgba(255,255,255,0.15); color: var(--q-bg); border-radius: 4px; padding: 2px 8px;
        }
        .cu-ai-price { font-size: 34px; font-weight: 800; letter-spacing: -0.03em; color: var(--q-bg); line-height: 1.1; }
        .cu-ai-per { font-size: 12px; color: rgba(255,255,255,0.5); }

        .cu-ai-cta {
          display: flex; align-items: center; justify-content: center;
          border-radius: 8px; padding: 11px 20px; font-size: 14px; font-weight: 600;
          text-decoration: none; margin-bottom: 10px; transition: opacity 0.15s;
        }
        .cu-ai-cta:hover { opacity: 0.85; }
        .cu-ai-cta--primary { background: var(--q-bg); color: var(--q-text-primary); }
        .cu-ai-cta--outline { border: 1px solid rgba(255,255,255,0.3); color: var(--q-bg); }

        .cu-ai-why-link {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 12px; color: rgba(255,255,255,0.6); text-decoration: none; margin-bottom: 20px;
          justify-content: center;
        }
        .cu-ai-why-link:hover { color: var(--q-bg); }
        .cu-ai-why-icon { font-size: 14px; }

        .cu-ai-features { flex: 1; }
        .cu-ai-features-header {
          font-size: 9px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          color: rgba(255,255,255,0.4); margin-bottom: 14px;
        }
        .cu-ai-features-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .cu-ai-feature-item {
          display: flex; align-items: flex-start; gap: 10px;
          font-size: 13px; line-height: 1.5; color: rgba(255,255,255,0.8);
        }

        .cu-ai-credits {
          margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);
        }
        .cu-ai-credits-amount {
          font-size: 13px; font-weight: 700; color: var(--q-agent-purple, #8A5CFF);
        }
        .cu-ai-credits-desc {
          font-size: 11px; color: rgba(255,255,255,0.4);
        }

        .cu-ai-bottom-bar {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          border-top: 1px solid rgba(255,255,255,0.15);
          margin-top: 0;
        }
        @media (max-width: 768px) {
          .cu-ai-bottom-bar { grid-template-columns: 1fr; }
        }
        .cu-ai-bottom-item {
          padding: 24px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          border-right: 1px solid rgba(255,255,255,0.1);
        }
        .cu-ai-bottom-item:last-child { border-right: none; }
        .cu-ai-bottom-item--center { align-items: center; text-align: center; }
        .cu-ai-bottom-label { font-size: 16px; font-weight: 700; color: var(--q-bg); }
        .cu-ai-bottom-price { font-size: 28px; font-weight: 800; color: var(--q-bg); }
        .cu-ai-bottom-sub { font-size: 11px; color: rgba(255,255,255,0.4); }
      `}</style>
    </section>
  );
}
