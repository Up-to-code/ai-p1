"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";

const copy = {
  en: {
    tag: "SOLUTION",
    headline: (
      <>
        One operating layer for<br />
        your <em>client work.</em>
      </>
    ),
    subtext: (
      <>
        Bring projects, clients, documents, conversations, and AI into one connected system.<br /><br />
        <span className="font-medium">Everyone works from the same source of truth.</span>
      </>
    ),
    features: [
      { label: "Connected work", desc: "Projects, clients, and knowledge stay linked" },
      { label: "Clear ownership", desc: "Know what is next and who owns it" },
      { label: "Contextual AI", desc: "Agents act with the right permissions and history" }
    ]
  },
  ar: {
    tag: "الحل",
    headline: (
      <>
        نظام تشغيل واحد<br />
        لكل <em>أعمال عملائك.</em>
      </>
    ),
    subtext: (
      <>
        اجمع المشاريع والعملاء والمستندات والمحادثات والذكاء الاصطناعي في منظومة مترابطة.<br /><br />
        <span className="font-medium">ليعمل الجميع انطلاقاً من مرجع واحد موثوق.</span>
      </>
    ),
    features: [
      { label: "عمل مترابط", desc: "المشاريع والعملاء والمعرفة في سياق واحد" },
      { label: "مسؤوليات واضحة", desc: "اعرف الخطوة التالية ومن يتولاها" },
      { label: "ذكاء يفهم السياق", desc: "وكلاء يعملون بالصلاحيات والسجل المناسبين" }
    ]
  },
  fr: {
    tag: "SOLUTION",
    headline: <>Un seul système pour<br />le <em>travail client.</em></>,
    subtext: <>Réunissez projets, clients, documents, conversations et IA dans un environnement connecté.<br /><br /><span className="font-medium">Toute l’équipe travaille à partir de la même source fiable.</span></>,
    features: [
      { label: "Travail connecté", desc: "Projets, clients et savoir restent liés" },
      { label: "Responsabilités claires", desc: "Sachez quoi faire et qui s’en charge" },
      { label: "IA contextuelle", desc: "Des agents guidés par les bons droits et le bon historique" }
    ]
  }
};

export function SolutionSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = locale === "ar" ? copy.ar : locale === "fr" ? copy.fr : copy.en;

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
