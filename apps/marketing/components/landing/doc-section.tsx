"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { GsapReveal } from "@/components/landing/gsap-reveal";
import { useGsapStaggerReveal } from "@/hooks/use-gsap-scroll";

const copy = {
  en: {
    tag: "DOCUMENTS",
    headline: (
      <>
        Knowledge lives <em>here.</em>
      </>
    ),
    subtext: (
      <>Write, share, and collaborate on documents that live alongside your projects, not buried in a drive somewhere.</>
    ),
    highlight: "Context is everything. Every doc knows which project it belongs to.",
    features: [
      { label: "Live collaboration", desc: "Edit together in real-time" },
      { label: "Rich content", desc: "Embed tasks, timelines, and data" },
      { label: "Version history", desc: "Every change tracked and reversible" },
      { label: "AI-powered writing", desc: "Draft, summarize, and refine with AI" },
    ],
    tools: [
      { name: "Rich Editor", desc: "Full markdown + block-based editing" },
      { name: "Project Docs", desc: "Auto-linked to your workspaces" },
      { name: "Client Reports", desc: "Shareable with stakeholders" },
      { name: "Knowledge Base", desc: "Searchable across your org" },
    ],
  },
  ar: {
    tag: "المستندات",
    headline: (
      <>
        المعرفة تعيش <em>هنا.</em>
      </>
    ),
    subtext: (
      <>اكتب وشارك وتعاون في مستندات تعيش بجانب مشاريعك، وليس مدفونة في محرك أقراص في مكان ما.</>
    ),
    highlight: "السياق هو كل شيء. كل مستند يعرف المشروع الذي ينتمي إليه.",
    features: [
      { label: "تعاون مباشر", desc: "التحرير معاً في الوقت الفعلي" },
      { label: "محتوى غني", desc: "تضمين المهام والجداول الزمنية والبيانات" },
      { label: "سجل النسخ", desc: "كل تغيير يتم تتبعه وقابل للتراجع" },
      { label: "كتابة بالذكاء الاصطناعي", desc: "مسودة وتلخيص وتحسين بالذكاء الاصطناعي" },
    ],
    tools: [
      { name: "محرر غني", desc: "ماركداون كامل + تحرير قائم على الكتل" },
      { name: "مستندات المشروع", desc: "مرتبطة تلقائياً بمساحات عملك" },
      { name: "تقارير العملاء", desc: "قابلة للمشاركة مع أصحاب المصلحة" },
      { name: "قاعدة المعرفة", desc: "قابلة للبحث عبر مؤسستك" },
    ],
  },
};

export function DocSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;
  const staggerRef = useGsapStaggerReveal<HTMLDivElement>(".doc-feature-item", { stagger: 0.12, start: "top 85%" });
  const toolsStaggerRef = useGsapStaggerReveal<HTMLDivElement>(".doc-tool-item", { stagger: 0.1, start: "top 85%" });

  return (
    <PublicSection id="documents" tone="very-dark">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-1">
            <GsapReveal delay={0.3} y={40}>
              <div className="aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img
                  src="/landing-images/doc-section.png"
                  alt="Qentrah documents"
                  className="h-full w-full object-cover"
                />
              </div>
            </GsapReveal>
          </div>
          <div className="order-2">
            <GsapReveal>
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--purple)] mb-2.5 block" style={{ letterSpacing: "0.06em" }}>
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
                <div key={i} className="doc-feature-item flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--purple)] flex items-center justify-center flex-shrink-0 mt-0.5">
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
                <div key={i} className="doc-tool-item bg-white/5 border border-white/10 rounded-xl p-4 transition-colors hover:bg-white/10">
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
