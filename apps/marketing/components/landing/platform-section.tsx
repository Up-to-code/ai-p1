"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";
import { ArrowRight } from "lucide-react";

const copy = {
  en: {
    tag: "PLATFORM",
    headline: "Built around how agencies actually work.",
    subtext: "Five core pillars that power every aspect of your business.",
    pillars: [
      { name: "Projects", color: "blue", icon: "projects" },
      { name: "CRM", color: "coral", icon: "crm" },
      { name: "Docs", color: "purple", icon: "docs" },
      { name: "AI", color: "green", icon: "ai" },
      { name: "Messages", color: "blue", icon: "comms" }
    ],
    products: [
      {
        title: "Project Management",
        desc: "Manage delivery and execution with clarity.",
        href: "/dashboard",
        color: "blue"
      },
      {
        title: "CRM & Clients",
        desc: "Manage clients, pipelines, and relationships.",
        href: "/dashboard",
        color: "coral"
      },
      {
        title: "Document Hub",
        desc: "Capture knowledge and context in one place.",
        href: "/dashboard",
        color: "purple"
      }
    ]
  },
  ar: {
    tag: "المنصة",
    headline: "مبنية حول كيف تعمل الوكالات فعلياً.",
    subtext: "خمسة أركان أساسية تدعم كل جانب من أعمالك.",
    pillars: [
      { name: "المشاريع", color: "blue", icon: "projects" },
      { name: "إدارة العملاء", color: "coral", icon: "crm" },
      { name: "المستندات", color: "purple", icon: "docs" },
      { name: "الذكاء الاصطناعي", color: "green", icon: "ai" },
      { name: "الرسائل", color: "blue", icon: "comms" }
    ],
    products: [
      {
        title: "إدارة المشاريع",
        desc: "إدارة التسليم والتنفيذ بوضوح.",
        href: "/dashboard",
        color: "blue"
      },
      {
        title: "إدارة العملاء",
        desc: "إدارة العملاء وقنوات المبيعات والعلاقات.",
        href: "/dashboard",
        color: "coral"
      },
      {
        title: "مركز المستندات",
        desc: "توثيق المعرفة والسياق في مكان واحد.",
        href: "/dashboard",
        color: "purple"
      }
    ]
  }
};

const pillarColors: Record<string, string> = {
  blue: "bg-[var(--blue-pale)] text-[var(--blue)]",
  coral: "bg-[var(--coral)]/10 text-[var(--coral)]",
  purple: "bg-[var(--purple)]/10 text-[var(--purple)]",
  green: "bg-[var(--green)]/10 text-[var(--green)]"
};

function PillarIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    projects: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    crm: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    docs: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    ai: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
        <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
      </svg>
    ),
    comms: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    )
  };
  return <>{icons[type] || icons.projects}</>;
}

export function PlatformSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;

  return (
    <PublicSection id="platform" tone="very-dark">
      <div className="wrap">
        {/* Header */}
        <div className="text-center mb-12">
          <Reveal>
            <span className="text-xs font-bold tracking-wider uppercase text-[var(--blue)] mb-2.5 block" style={{ letterSpacing: "0.06em" }}>
              {labels.tag}
            </span>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3.5" style={{ letterSpacing: "-0.03em" }}>
              {labels.headline}
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-base text-[var(--q-text-secondary)] max-w-md mx-auto">
              {labels.subtext}
            </p>
          </Reveal>
        </div>

        {/* 5-Pillar Grid */}
        <Reveal delay={0.3}>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-[var(--q-border)] border border-[var(--q-border)] rounded-2xl overflow-hidden mb-6">
            {labels.pillars.map((pillar, i) => (
              <div key={i} className="bg-[var(--q-bg-very-dark)] p-4 sm:p-5 text-center transition-colors hover:bg-[var(--q-bg)] cursor-default">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${pillarColors[pillar.color]}`}>
                  <PillarIcon type={pillar.icon} />
                </div>
                <div className="text-xs sm:text-sm font-semibold">{pillar.name}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {labels.products.map((product, i) => (
            <Reveal key={i} delay={0.4 + i * 0.08}>
              <div className="bg-[var(--q-bg-very-dark)] border border-[var(--q-border)] rounded-2xl p-6 transition-all duration-250 hover:shadow-lg hover:-translate-y-0.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3.5 ${pillarColors[product.color]}`}>
                  <PillarIcon type={product.color === "coral" ? "crm" : product.color} />
                </div>
                <h3 className="text-base font-bold mb-1.5 tracking-tight">{product.title}</h3>
                <p className="text-sm text-[var(--q-text-secondary)] leading-relaxed">
                  {product.desc}
                </p>
                <a href={product.href} className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[var(--blue)] mt-3 group">
                  Learn more
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </PublicSection>
  );
}
