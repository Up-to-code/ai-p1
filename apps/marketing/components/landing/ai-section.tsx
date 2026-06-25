"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";

const copy = {
  en: {
    tag: "AI",
    headline: (
      <>
        AI that understands your <em>business.</em>
      </>
    ),
    subtext: (
      <>Most AI tools only see a prompt. Qentrah sees projects, clients, documents, conversations, and workflows.</>
    ),
    highlight: "That context allows AI to do work, not just answer questions.",
    features: [
      { label: "Context-aware", desc: "AI sees your entire workspace" },
      { label: "Action-oriented", desc: "Executes tasks, not just chat" },
      { label: "Business-ready", desc: "Trained on your data" }
    ]
  },
  ar: {
    tag: "الذكاء الاصطناعي",
    headline: (
      <>
        ذكاء اصطناعي يفهم <em>عملك.</em>
      </>
    ),
    subtext: (
      <>معظم أدوات الذكاء الاصطناعي ترى فقط رسالة. كانترا ترى المشاريع والعملاء والمستندات والمحادثات وسير العمل.</>
    ),
    highlight: "هذا السياق يسمح للذكاء الاصطناعي بتنفيذ العمل، وليس فقط الإجابة على الأسئلة.",
    features: [
      { label: "واعي بالسياق", desc: "الذكاء الاصطناعي يرى مساحة عملك بالكامل" },
      { label: "موجه للإجراء", desc: "ينفذ المهام، ليس فقط الدردشة" },
      { label: "جاهز للأعمال", desc: "مدرب على بياناتك" }
    ]
  }
};

export function AISection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;

  return (
    <PublicSection id="ai" tone="default">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Image */}
          <div className="order-1">
            <Reveal>
              <div className="aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--q-bg)]">
                <img
                  src="/landing-images/ai-section.png"
                  alt="Qentrah AI context visualization"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>

          {/* Right: Content */}
          <div className="order-2">
            <Reveal>
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--blue)] mb-2.5 block" style={{ letterSpacing: "0.06em" }}>
                {labels.tag}
              </span>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
                {labels.headline}
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="text-base text-[var(--q-text-secondary)] leading-relaxed mb-4">
                {labels.subtext}
              </p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-base font-medium mb-8">
                {labels.highlight}
              </p>
            </Reveal>

            {/* Feature Checklist */}
            <div className="space-y-3">
              {labels.features.map((feature, i) => (
                <Reveal key={i} delay={0.4 + i * 0.08}>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--blue)] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20,6 9,17 4,12"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-0.5">{feature.label}</div>
                      <div className="text-xs text-[var(--q-text-secondary)]">{feature.desc}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PublicSection>
  );
}
