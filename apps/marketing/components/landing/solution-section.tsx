"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";

const copy = {
  en: {
    tag: "SOLUTION",
    headline: (
      <>
        Everything your agency needs.<br />
        One <em>workspace.</em>
      </>
    ),
    subtext: (
      <>
        Projects. Clients. Documents. Communication. AI.<br /><br />
        <span className="font-medium">Connected through shared context.</span>
      </>
    ),
    features: [
      { label: "Unified workspace", desc: "All tools in one place" },
      { label: "Shared context", desc: "No more information silos" },
      { label: "AI-powered", desc: "Smart automation everywhere" }
    ]
  },
  ar: {
    tag: "الحل",
    headline: (
      <>
        كل ما تحتاجه وكالتك.<br />
        في <em>مساحة واحدة.</em>
      </>
    ),
    subtext: (
      <>
        المشاريع. العملاء. المستندات. التواصل. الذكاء الاصطناعي.<br /><br />
        <span className="font-medium">متصلة عبر سياق مشترك.</span>
      </>
    ),
    features: [
      { label: "مساحة عمل موحدة", desc: "كل الأدوات في مكان واحد" },
      { label: "سياق مشترك", desc: "لا المزيد من عزل المعلومات" },
      { label: "مدعوم بالذكاء الاصطناعي", desc: "أتمتة ذكية في كل مكان" }
    ]
  }
};

export function SolutionSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;

  return (
    <PublicSection id="solution" tone="default">
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
              <p className="text-base text-[var(--q-text-secondary)] leading-relaxed mb-8 whitespace-pre-line">
                {labels.subtext}
              </p>
            </Reveal>

            {/* Feature Checklist */}
            <div className="space-y-3">
              {labels.features.map((feature, i) => (
                <Reveal key={i} delay={0.3 + i * 0.08}>
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

          {/* Right: Image */}
          <div className="order-1 lg:order-2">
            <Reveal delay={0.4}>
              <div className="aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--q-bg)]">
                <img
                  src="/landing-images/solution-section.png"
                  alt="Qentrah workspace solution"
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
