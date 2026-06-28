"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { GsapReveal } from "@/components/landing/gsap-reveal";
import { useGsapStaggerReveal } from "@/hooks/use-gsap-scroll";

const copy = {
  en: {
    tag: "TASKS",
    headline: (
      <>
        Tasks that move as fast <em>as you do.</em>
      </>
    ),
    subtext: (
      <>From quick to-dos to complex workflows — manage every piece of work with clarity, deadlines, and full context.</>
    ),
    highlight: "No more lost sticky notes or buried emails.",
    features: [
      { label: "Smart prioritization", desc: "AI suggests what to work on next" },
      { label: "Visual workflows", desc: "Kanban, list, timeline — any view" },
      { label: "Context-rich", desc: "Every task connected to projects, clients, and chats" },
      { label: "Recurring & automated", desc: "Repetitive work, handled for you" },
    ],
    cards: [
      { title: "Kanban Boards", desc: "Drag-and-drop workflow management", color: "blue" },
      { title: "Timeline View", desc: "See deadlines and dependencies at a glance", color: "coral" },
      { title: "Task Templates", desc: "Standardize recurring project work", color: "purple" },
    ],
  },
  ar: {
    tag: "المهام",
    headline: (
      <>
        مهام تتحرك بسرعة <em>مثلك.</em>
      </>
    ),
    subtext: (
      <>من المهام البسيطة إلى سير العمل المعقد — أدر كل جزء من العمل بوضوح ومواعيد نهائية وسياق كامل.</>
    ),
    highlight: "لا مزيد من الملاحظات المفقودة أو رسائل البريد الإلكتروني المدفونة.",
    features: [
      { label: "أولوية ذكية", desc: "الذكاء الاصطناعي يقترح ما يجب العمل عليه بعد ذلك" },
      { label: "سير عمل بصري", desc: "كانبان، قائمة، جدول زمني — أي عرض" },
      { label: "غني بالسياق", desc: "كل مهمة مرتبطة بالمشاريع والعملاء والمحادثات" },
      { label: "متكرر ومؤتمت", desc: "العمل المتكرر، يتم التعامل معه نيابة عنك" },
    ],
    cards: [
      { title: "لوحات كانبان", desc: "إدارة سير العمل بالسحب والإفلات", color: "blue" },
      { title: "عرض الجدول الزمني", desc: "رؤية المواعيد النهائية والتبعيات في لمحة", color: "coral" },
      { title: "قوالب المهام", desc: "توحيد العمل المتكرر في المشاريع", color: "purple" },
    ],
  },
};

const cardColors: Record<string, string> = {
  blue: "bg-[var(--blue-pale)] text-[var(--blue)]",
  coral: "bg-[var(--coral)]/10 text-[var(--coral)]",
  purple: "bg-[var(--purple)]/10 text-[var(--purple)]",
};

export function TaskSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;
  const staggerRef = useGsapStaggerReveal<HTMLDivElement>(".task-feature-item", { stagger: 0.12, start: "top 85%" });

  return (
    <PublicSection id="tasks" tone="default">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <GsapReveal>
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--blue)] mb-2.5 block" style={{ letterSpacing: "0.06em" }}>
                {labels.tag}
              </span>
            </GsapReveal>
            <GsapReveal delay={0.1}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
                {labels.headline}
              </h2>
            </GsapReveal>
            <GsapReveal delay={0.2}>
              <p className="text-base text-[var(--q-text-secondary)] leading-relaxed mb-4">
                {labels.subtext}
              </p>
            </GsapReveal>
            <GsapReveal delay={0.3}>
              <p className="text-base font-medium mb-8">
                {labels.highlight}
              </p>
            </GsapReveal>
            <div ref={staggerRef} className="space-y-3">
              {labels.features.map((feature, i) => (
                <div key={i} className="task-feature-item flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-0.5">{feature.label}</div>
                    <div className="text-xs text-[var(--q-text-secondary)]">{feature.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <GsapReveal delay={0.4} y={40}>
              <div className="aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--q-bg)]">
                <img
                  src="/landing-images/task-section.png"
                  alt="Qentrah task management"
                  className="h-full w-full object-cover"
                />
              </div>
            </GsapReveal>
          </div>
        </div>
      </div>
    </PublicSection>
  );
}
