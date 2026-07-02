"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { GsapReveal } from "@/components/landing/gsap-reveal";
import { useGsapStaggerReveal } from "@/hooks/use-gsap-scroll";

const copy = {
  en: {
    tag: "AI AGENTS",
    headline: (
      <>
        AI that understands your <em>context.</em>
      </>
    ),
    subtext: (
      <>AI agents that see your projects, docs, and conversations to execute real work with full awareness of your business context.</>
    ),
    highlight: "No more generic AI — agents that truly know your business.",
    features: [
      { label: "Context-aware actions", desc: "Agents see projects, clients, and history" },
      { label: "MCP protocol", desc: "Connect any tool or service" },
      { label: "Automated workflows", desc: "Let AI handle repetitive tasks" },
      { label: "Smart suggestions", desc: "AI that learns from your patterns" },
    ],
    tools: [
      { name: "Task Agents", desc: "Auto-create and organize tasks" },
      { name: "Document AI", desc: "Draft and refine content" },
      { name: "Client Intelligence", desc: "Insights from deal history" },
      { name: "Workflow Automation", desc: "Trigger actions across tools" },
    ],
  },
  ar: {
    tag: "وكلاء الذكاء",
    headline: (
      <>
        ذكاء اصطناعي يفهم <em>سياقك.</em>
      </>
    ),
    subtext: (
      <>وكلاء ذكاء اصطناعي يرون مشاريعك ومستنداتك ومحادثاتك لتنفيذ عمل حقيقي مع فهم كامل لسياق عملك.</>
    ),
    highlight: "لا المزيد من الذكاء الاصطناعي العام — وكلاء يعرفون عملك حقاً.",
    features: [
      { label: "إجراءات واعية بالسياق", desc: "الوكلاء يرون المشاريع والعملاء والتاريخ" },
      { label: "بروتوكول MCP", desc: "اتصل بأي أداة أو خدمة" },
      { label: "سير عمل مؤتمت", desc:"دع الذكاء الاصطناعي يعالج المهام المتكررة" },
      { label: "اقتراحات ذكية", desc: "ذكاء اصطناعي يتعلم من أنماطك" },
    ],
    tools: [
      { name: "وكلاء المهام", desc: "إنشاء وتنظيم المهام تلقائياً" },
      { name: "ذكاء المستندات", desc: "مسودة وتحسين المحتوى" },
      { name: "ذكاء العملاء", desc: "رؤى من تاريخ الصفقات" },
      { name: "أتمتة سير العمل", desc: "تشغيل إجراءات عبر الأدوات" },
    ],
  },
};

export function AISection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;
  const staggerRef = useGsapStaggerReveal<HTMLDivElement>(".ai-feature-item", { stagger: 0.12, start: "top 85%" });
  const toolsStaggerRef = useGsapStaggerReveal<HTMLDivElement>(".ai-tool-item", { stagger: 0.1, start: "top 85%" });

  return (
    <PublicSection id="ai" tone="very-dark">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-1">
            <GsapReveal delay={0.3} y={40}>
              <div className="aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img
                  src="/landing-images/ai-section.png"
                  alt="Qentrah AI agents"
                  className="h-full w-full object-cover"
                />
              </div>
            </GsapReveal>
          </div>
          <div className="order-2">
            <GsapReveal>
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--green)] mb-2.5 block" style={{ letterSpacing: "0.06em" }}>
                {labels.tag}
              </span>
            </GsapReveal>
            <GsapReveal delay={0.1}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
                {labels.headline}
              </h2>
            </GsapReveal>
            <GsapReveal delay={0.2}>
              <p className="text-base text-white/70 leading-relaxed mb-4">
                {labels.subtext}
              </p>
            </GsapReveal>
            <GsapReveal delay={0.3}>
              <p className="text-base font-medium mb-8">
                {labels.highlight}
              </p>
            </GsapReveal>
            <div ref={staggerRef} className="space-y-3 mb-10">
              {labels.features.map((feature, i) => (
                <div key={i} className="ai-feature-item flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--green)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-0.5">{feature.label}</div>
                    <div className="text-xs text-white/70">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div ref={toolsStaggerRef} className="grid grid-cols-2 gap-3">
              {labels.tools.map((tool, i) => (
                <div key={i} className="ai-tool-item bg-white/5 border border-white/10 rounded-xl p-4 transition-colors hover:bg-white/10">
                  <div className="text-sm font-semibold mb-0.5">{tool.name}</div>
                  <div className="text-xs text-white/70">{tool.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicSection>
  );
}
