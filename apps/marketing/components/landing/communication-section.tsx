"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";

const copy = {
  en: {
    tag: "COMMUNICATION",
    headline: (
      <>
        Work happens through <em>communication.</em>
      </>
    ),
    subtext: (
      <>Every task, project, client request, and decision starts with a conversation.</>
    ),
    highlight: "Qentrah turns communication into execution.",
    features: [
      { label: "Thread-based", desc: "Organized conversations by context" },
      { label: "Action-linked", desc: "Turn messages into tasks instantly" },
      { label: "Unified inbox", desc: "All channels in one place" }
    ]
  },
  ar: {
    tag: "التواصل",
    headline: (
      <>
        العمل يحدث من خلال <em>التواصل.</em>
      </>
    ),
    subtext: (
      <>كل مهمة ومشروع وطلب عميل وقرار يبدأ بمحادثة.</>
    ),
    highlight: "كانترا تحول التواصل إلى تنفيذ.",
    features: [
      { label: "قائم على السلاسل", desc: "محادثات منظمة حسب السياق" },
      { label: "مرتبط بالإجراء", desc: "تحويل الرسائل إلى مهام فوراً" },
      { label: "بريد موحد", desc: "كل القنوات في مكان واحد" }
    ]
  }
};

export function CommunicationSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;

  return (
    <PublicSection id="communication" tone="very-dark">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="order-2 lg:order-1">
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
              <p className="text-base text-white/70 leading-relaxed mb-4">
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
                      <div className="text-xs text-white/70">{feature.desc}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div className="order-1 lg:order-2">
            <Reveal delay={0.5}>
              <div className="aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <img
                  src="/landing-images/communication-section.png"
                  alt="Qentrah communication flow"
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </PublicSection>
  );
}
