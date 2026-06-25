"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";

const copy = {
  en: {
    label: "PROBLEM",
    headline: (
      <>
        The problem isn't work.<br />
        It's <em>fragmentation.</em>
      </>
    ),
    subtext: (
      <>Projects, conversations, documents, clients, and AI are scattered across disconnected tools. Teams spend more time searching for context than executing work.</>
    ),
    nodes: [
      { icon: "projects", label: "Projects", sub: "Scattered tasks" },
      { icon: "clients", label: "Clients", sub: "Lost in emails" },
      { icon: "docs", label: "Documents", sub: "Version chaos" },
      { icon: "ai", label: "AI Tools", sub: "No context" },
      { icon: "comms", label: "Messages", sub: "Endless threads" }
    ],
    stats: [
      { 
        tag: "CONTEXT",
        value: "40%",
        desc: "Lost to Context Switching"
      },
      { 
        tag: "TIME",
        value: "3 Hours",
        desc: "Lost Every Day"
      },
      { 
        tag: "AI",
        value: "85%",
        desc: "Fail Without Context"
      },
      { 
        tag: "PRODUCTIVITY",
        value: "2.5x",
        desc: "Faster With Unity"
      }
    ]
  },
  ar: {
    label: "المشكلة",
    headline: (
      <>
        المشكلة ليست في العمل.<br />
        إنها <em>التشتت.</em>
      </>
    ),
    subtext: (
      <>المشاريع والمحادثات والمستندات والعملاء والذكاء الاصطناعي موزعة عبر أدوات منفصلة. تقضي الفرق وقتاً في البحث عن السياق أكثر من تنفيذ العمل.</>
    ),
    nodes: [
      { icon: "projects", label: "المشاريع", sub: "مهام مبعثرة" },
      { icon: "clients", label: "العملاء", sub: "ضائعة في البريد" },
      { icon: "docs", label: "المستندات", sub: "فوضى النسخ" },
      { icon: "ai", label: "الذكاء الاصطناعي", sub: "بدون سياق" },
      { icon: "comms", label: "الرسائل", sub: "سلاسل لا تنتهي" }
    ],
    stats: [
      { 
        tag: "السياق",
        value: "40٪",
        desc: "مفقود في تبديل السياق"
      },
      { 
        tag: "الوقت",
        value: "3 ساعات",
        desc: "مفقودة كل يوم"
      },
      { 
        tag: "الذكاء الاصطناعي",
        value: "85٪",
        desc: "يفشل بدون سياق"
      },
      { 
        tag: "الإنتاجية",
        value: "2.5x",
        desc: "أسرع مع الوحدة"
      }
    ]
  }
};

function NodeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    projects: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    clients: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    docs: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    ai: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
        <path d="M16 14H8a4 4 0 0 0-4 4v2h16v-2a4 4 0 0 0-4-4z"/>
        <circle cx="18" cy="6" r="2"/>
        <circle cx="6" cy="6" r="2"/>
      </svg>
    ),
    comms: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="9" y1="10" x2="15" y2="10"/>
        <line x1="12" y1="7" x2="12" y2="13"/>
      </svg>
    )
  };
  return <>{icons[type] || icons.projects}</>;
}

export function ProblemSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;

  return (
    <PublicSection id="problem" tone="light">
      <div className="wrap">
        {/* Centered Headline */}
        <div className="text-center mb-14">
          <Reveal>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-tight max-w-2xl mx-auto mb-4" style={{ letterSpacing: "-0.03em" }}>
              {labels.headline}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-base text-[var(--q-text-secondary)] max-w-md mx-auto">
              {labels.subtext}
            </p>
          </Reveal>
        </div>

        {/* Disconnected Nodes */}
        <Reveal delay={0.2}>
          <div className="flex items-center justify-center gap-0 mb-12 flex-wrap">
            {labels.nodes.map((node, i) => (
              <div key={i} className="flex items-center">
                <div className="text-center px-6 sm:px-8">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-[var(--q-border)] flex items-center justify-center mx-auto mb-2.5 bg-[var(--q-bg)]">
                    <NodeIcon type={node.icon} />
                  </div>
                  <div className="text-xs font-semibold mb-1">{node.label}</div>
                  <div className="text-[11px] text-[var(--q-text-muted)] max-w-[130px] mx-auto leading-tight">
                    {node.sub}
                  </div>
                </div>
                {i < labels.nodes.length - 1 && (
                  <div className="flex-1 h-px max-w-20" style={{ background: "linear-gradient(90deg, transparent, var(--q-border), transparent)" }} />
                )}
              </div>
            ))}
          </div>
        </Reveal>

        {/* Statistics Grid */}
        <Reveal delay={0.3}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[var(--q-border)] border border-[var(--q-border)] rounded-2xl overflow-hidden">
            {labels.stats.map((stat, i) => (
              <div key={i} className="bg-[var(--q-bg-light)] p-7 sm:p-8 transition-colors hover:bg-[var(--q-bg)]">
                <div className="text-[11px] font-bold tracking-wider uppercase text-[var(--blue)] mb-2" style={{ letterSpacing: "0.06em" }}>
                  {stat.tag}
                </div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1.5" style={{ letterSpacing: "-0.03em" }}>
                  {stat.value}
                </div>
                <p className="text-sm text-[var(--q-text-secondary)] leading-relaxed">
                  {stat.desc}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </PublicSection>
  );
}
