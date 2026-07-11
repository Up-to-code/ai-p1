"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { Reveal } from "@/components/landing/cinematic-motion";

const copy = {
  en: {
    label: "VISION",
    headline: (
      <>
        Better work does not need more <span className="font-semibold">tabs</span>.
      </>
    ),
    subtext: (
      <>It needs one trusted place where your team, your knowledge, and your AI can move work forward together.</>
    )
  },
  ar: {
    label: "الرؤية",
    headline: (
      <>
        العمل الأفضل لا يحتاج إلى المزيد من <span className="font-semibold">علامات التبويب</span>.
      </>
    ),
    subtext: (
      <>بل إلى مكان موثوق يجمع فريقك ومعرفته والذكاء الاصطناعي لدفع العمل إلى الأمام.</>
    )
  },
  fr: {
    label: "VISION",
    headline: <>Mieux travailler ne demande pas plus <span className="font-semibold">d’onglets</span>.</>,
    subtext: <>Il faut un espace fiable où votre équipe, vos connaissances et l’IA font avancer le travail ensemble.</>
  }
};

export function VisionSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = locale === "ar" ? copy.ar : locale === "fr" ? copy.fr : copy.en;

  return (
    <PublicSection id="vision" tone="default">
      <div className="mx-auto max-w-5xl text-center">
        {/* Section Label */}
        <Reveal>
          <p className="mb-12 text-[10px] font-black uppercase tracking-[0.35em] text-[var(--q-text-muted)]">
            {labels.label}
          </p>
        </Reveal>

        {/* Headline */}
        <Reveal>
          <h2 className="my-16 text-3xl font-light tracking-tight text-[var(--q-text-primary)] sm:text-4xl md:text-5xl lg:text-6xl rtl:leading-[1.2]">
            {labels.headline}
          </h2>
        </Reveal>

        {/* Subtext */}
        <Reveal delay={0.1}>
          <p className="mx-auto max-w-3xl text-lg font-medium leading-relaxed text-[var(--q-text-secondary)] md:text-xl lg:text-2xl rtl:leading-[1.6]">
            {labels.subtext}
          </p>
        </Reveal>
      </div>
    </PublicSection>
  );
}
