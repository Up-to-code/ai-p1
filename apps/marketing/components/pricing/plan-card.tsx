import { cn } from "@/lib/utils";
import type { Plan, BillingCycle } from "./types";

// ── Check icons ────────────────────────────────────────────────────────────────
function CheckGray() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cu-card-check cu-card-check--gray"><polyline points="20 6 9 17 4 12" /></svg>
  );
}
function CheckGreen() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="cu-card-check cu-card-check--green"><circle cx="12" cy="12" r="10" fill="var(--q-human-green, #2BB673)" /><polyline points="16 9 10.5 15 8 12.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

// ── Feature bullet data ────────────────────────────────────────────────────────
type FeatureBulletData = {
  sectionHeader?: string;
  items: string[];
  moreLabel?: string;
};

const FEATURES: Record<string, FeatureBulletData> = {
  free: {
    sectionHeader: "KEY FEATURES:",
    items: [
      "60 MB Storage",
      "Unlimited Tasks",
      "Unlimited Free Plan Members",
      "Two-Factor Authentication",
      "Collaborative Docs",
      "Kanban Boards",
      "Sprint Management",
      "Calendar View",
      "Basic Custom Field Manager",
      "In-App Video Recording",
      "24/7 Support",
    ],
  },
  good: {
    sectionHeader: "EVERYTHING IN FREE FOREVER, PLUS:",
    items: [
      "Unlimited Spaces, Folders, and Forms",
      "Unlimited Gantt Charts",
      "Unlimited Integrations",
      "Unlimited Storage",
      "Unlimited Custom Fields",
      "Native Time Tracking",
      "Goals & Portfolio Management",
      "Guests With Permission Control",
      "Resource Management",
      "Qentrah Chat",
      "Email in Qentrah",
      "Integrations like HubSpot, Zapier, Google Drive, and more",
    ],
    moreLabel: "and much more...",
  },
  better: {
    sectionHeader: "EVERYTHING IN UNLIMITED, PLUS:",
    items: [
      "Unlimited Dashboards with Advanced Cards",
      "Unlimited Message History",
      "Unlimited Activity Views",
      "Unlimited Timeline Views",
      "Webhooks & Automation Integrations",
      "5K Automations Per Month",
      "Mind Mapping",
      "Private Whiteboards",
      "Custom Exporting",
      "Sprint Points & Reporting",
      "Portfolio Workload Management",
      "Google SSO",
      "SMS 2-Factor Authentication",
      "Unlimited Proofing",
    ],
    moreLabel: "and much more...",
  },
  custom: {
    sectionHeader: "EVERYTHING IN BUSINESS, PLUS:",
    items: [
      "Enterprise Permissions and Governance",
      "Unlimited Custom Roles",
      "SAML SSO & SCIM Provisioning",
      "Audit Log",
      "Session Management",
      "Enterprise API",
      "250K Automations Per Month",
      "Custom Branding",
      "Default Personal Views",
      "MSA & HIPAA Available",
      "Data Residency",
      "Enterprise-Scale Automations & Integrations",
      "Enterprise-Scale API Usage",
      "Live Onboarding Training",
      "Customer Success Manager",
      "Access to Managed Services",
    ],
    moreLabel: "and much more...",
  },
};

const FEATURES_AR: Record<string, FeatureBulletData> = {
  free: {
    sectionHeader: "الميزات الأساسية:",
    items: [
      "60 ميجابايت تخزين",
      "مهام غير محدودة",
      "أعضاء مجانيون غير محدودين",
      "مصادقة ثنائية",
      "مستندات تعاونية",
      "لوحات كانبان",
      "إدارة السبرنت",
      "عرض التقويم",
      "مدير الحقول المخصصة",
      "تسجيل فيديو داخلي",
      "دعم على مدار الساعة",
    ],
  },
  good: {
    sectionHeader: "كل ما في المجاني، بالإضافة إلى:",
    items: [
      "مساحات ومجلدات ونماذج غير محدودة",
      "مخططات Gantt غير محدودة",
      "تكاملات غير محدودة",
      "تخزين غير محدود",
      "حقول مخصصة غير محدودة",
      "تتبع الوقت الأصلي",
      "إدارة الأهداف والمحافظ",
      "ضيوف مع التحكم بالأذونات",
      "إدارة الموارد",
      "محادثة قنترة",
      "البريد في قنترة",
      "تكامل مع HubSpot وZapier وGoogle Drive والمزيد",
    ],
    moreLabel: "والمزيد...",
  },
  better: {
    sectionHeader: "كل ما في Unlimited، بالإضافة إلى:",
    items: [
      "لوحات معلومات غير محدودة مع بطاقات متقدمة",
      "سجل رسائل غير محدود",
      "عروض نشاط غير محدودة",
      "عروض جدول زمني غير محدودة",
      "تكامل Webhooks والأتمتة",
      "5 آلاف أتمتة شهرياً",
      "خرائط ذهنية",
      "سبورات بيضاء خاصة",
      "تصدير مخصص",
      "نقاط السبرنت والتقارير",
      "إدارة حمل العمل للمحافظ",
      "Google SSO",
      "مصادقة SMS ثنائية",
      "مراجعة غير محدودة",
    ],
    moreLabel: "والمزيد...",
  },
  custom: {
    sectionHeader: "كل ما في Business، بالإضافة إلى:",
    items: [
      "أذونات وحوكمة المؤسسة",
      "أدوار مخصصة غير محدودة",
      "SAML SSO & SCIM",
      "سجل التدقيق",
      "إدارة الجلسات",
      "Enterprise API",
      "250 ألف أتمتة شهرياً",
      "علامة تجارية مخصصة",
      "عروض شخصية افتراضية",
      "MSA & HIPAA متاح",
      "إقامة البيانات",
      "أتمتة وتكاملات على نطاق المؤسسة",
      "استخدام API على نطاق المؤسسة",
      "تدريب إعداد مباشر",
      "مدير نجاح العملاء",
      "الوصول إلى الخدمات المُدارة",
    ],
    moreLabel: "والمزيد...",
  },
};

export function PlanCard({
  plan,
  billing,
  isAr = false,
}: {
  plan: Plan;
  billing: BillingCycle;
  isAr?: boolean;
}) {
  const price = billing === "monthly" ? plan.monthlyPrice : plan.annuallyPrice;
  const displayPrice =
    price === null
      ? null
      : `$${price}`;
  const originalPrice = billing === "monthly" && plan.originalMonthlyPrice
    ? `$${plan.originalMonthlyPrice}`
    : null;
  const perUnit =
    price !== null && price > 0
      ? billing === "monthly"
        ? isAr ? "لكل مستخدم / شهر" : "Per user / month"
        : isAr ? "لكل مستخدم / سنة، يُفوتر سنوياً" : "Per user / year, billed yearly"
      : null;
  const ctaHref = ["good", "better"].includes(plan.id)
    ? `/billing?plan=${plan.id}_${billing === "annually" ? "yearly" : "monthly"}`
    : plan.ctaHref;

  const featureData = (isAr ? FEATURES_AR : FEATURES)[plan.id];
  const isHighlight = plan.highlight;
  const featurePreview = featureData?.items.slice(0, 6) ?? [];

  return (
    <div
      className={cn(
        "cu-plan-card",
        isHighlight && "cu-plan-card--highlight",
      )}
    >
      {/* Header */}
      <div className="cu-plan-header">
        <div className="cu-plan-name-row">
          <span className="cu-plan-name">{plan.name}</span>
          {plan.label && (
            <span className="cu-plan-badge">{plan.label}</span>
          )}
        </div>
        <p className="cu-plan-description">{plan.description}</p>

        {displayPrice !== null ? (
          <>
            <div className="cu-plan-price-row">
              {originalPrice && <span className="cu-plan-original-price">{originalPrice}</span>}
              <div className="cu-plan-price">{displayPrice}</div>
            </div>
            {perUnit && <p className="cu-plan-per">{perUnit}</p>}
          </>
        ) : (
          <p className="cu-plan-custom-text">
            {isAr ? "احصل على عرض مخصص" : "Get a custom demo"}
          </p>
        )}
      </div>

      {/* CTA */}
      <a
        key={ctaHref}
        href={ctaHref}
        className={cn(
          "cu-plan-cta",
          isHighlight ? "cu-plan-cta--primary" : "cu-plan-cta--outline",
        )}
      >
        {plan.cta}
      </a>

      {/* Features */}
      {featureData && (
        <div className="cu-plan-features">
          {featureData.sectionHeader && (
            <p className="cu-plan-features-header">{featureData.sectionHeader}</p>
          )}
          <ul className="cu-plan-features-list" role="list">
            {featurePreview.map((item) => (
              <li key={item} className="cu-plan-feature-item">
                {isHighlight ? <CheckGreen /> : <CheckGray />}
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {featureData.items.length > featurePreview.length && <p className="cu-plan-more">{isAr ? "قارن جميع المزايا أدناه" : "Compare all features below"}</p>}
        </div>
      )}

      <style>{`
        .cu-plan-card {
          display: flex;
          flex-direction: column;
          border: 1px solid var(--q-border);
          border-radius: 16px;
          padding: 28px 24px 30px;
          background: var(--q-card);
          min-width: 0;
        }
        .cu-plan-card--highlight {
          background: var(--q-text-primary);
          border-color: var(--q-text-primary);
          transform: translateY(-8px);
        }
        .cu-plan-card--highlight .cu-plan-name,
        .cu-plan-card--highlight .cu-plan-price,
        .cu-plan-card--highlight .cu-plan-per,
        .cu-plan-card--highlight .cu-plan-custom-text,
        .cu-plan-card--highlight .cu-plan-features-header,
        .cu-plan-card--highlight .cu-plan-feature-item,
        .cu-plan-card--highlight .cu-plan-more {
          color: var(--q-bg);
        }

        .cu-plan-header {
          /* Keep each CTA aligned even when a plan has a shorter price label. */
          min-height: 176px;
          margin-bottom: 22px;
        }
        .cu-plan-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .cu-plan-name {
          font-size: 21px;
          font-weight: 700;
          color: var(--q-text-primary);
        }
        .cu-plan-description {
          min-height: 40px;
          margin: 8px 0 22px;
          font-size: 14px;
          line-height: 1.45;
          color: var(--q-text-secondary);
        }
        .cu-plan-card--highlight .cu-plan-description { color: rgba(255,255,255,0.7); }
        .cu-plan-badge {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          background: var(--q-bg-secondary);
          color: var(--q-text-secondary);
          border-radius: 4px;
          padding: 2px 8px;
        }
        .cu-plan-card--highlight .cu-plan-badge {
          background: rgba(255,255,255,0.2);
          color: var(--q-bg);
        }
        .cu-plan-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .cu-plan-original-price {
          font-size: 18px;
          font-weight: 600;
          color: var(--q-text-muted);
          text-decoration: line-through;
          text-decoration-thickness: 1.5px;
        }
        .cu-plan-price {
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--q-text-primary);
          line-height: 1.1;
          margin-bottom: 8px;
        }
        .cu-plan-per {
          font-size: 13px;
          color: var(--q-text-muted);
          line-height: 1.4;
        }
        .cu-plan-card--highlight .cu-plan-per { color: rgba(255,255,255,0.6); }
        .cu-plan-custom-text {
          font-size: 14px;
          color: var(--q-text-secondary);
          margin-top: 4px;
        }

        .cu-plan-cta {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          min-height: 48px;
          padding: 12px 20px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 28px;
          transition: opacity 0.15s;
        }
        .cu-plan-cta:hover { opacity: 0.85; }
        .cu-plan-cta--primary {
          background: var(--q-bg);
          color: var(--q-text-primary);
        }
        .cu-plan-cta--primary:hover { opacity: 1; background: var(--q-bg-secondary); }
        .cu-plan-cta--outline {
          border: 1px solid var(--q-border-strong, var(--q-border));
          color: var(--q-text-primary);
          background: none;
        }

        .cu-plan-features { flex: 1; }
        .cu-plan-features-header {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--q-text-muted);
          margin-bottom: 14px;
          line-height: 1.6;
        }
        .cu-plan-card--highlight .cu-plan-features-header {
          color: rgba(255,255,255,0.5);
        }
        .cu-plan-features-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }
        .cu-plan-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 14px;
          line-height: 1.55;
          color: var(--q-text-secondary);
        }
        .cu-card-check {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .cu-card-check--gray { color: var(--q-text-muted); }
        .cu-plan-more {
          margin-top: 18px;
          font-size: 13px;
          font-style: normal;
          color: var(--q-text-muted);
        }
        .cu-plan-card--highlight .cu-plan-more {
          color: rgba(255,255,255,0.5);
        }
        @media (max-width: 900px) {
          .cu-plan-card--highlight { transform: none; }
        }
      `}</style>
    </div>
  );
}
