"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { isLocale } from "@/lib/content";
import { useMarketingContent } from "@/components/marketing/marketing-content-provider";

export function TestimonialsSection() {
  const localeRaw = useLocale();
  const locale = isLocale(localeRaw) ? localeRaw : "en";
  const { testimonials: t } = useMarketingContent();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % t.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, [t.length]);

  const activeTestimonial = t[activeIndex];
  const sectionLabel = locale === "ar" ? "ماذا يقولون عنا" : locale === "fr" ? "Ce qu'ils disent" : "What people say";

  return (
    <section className="relative py-32 lg:py-40 border-t border-[var(--q-border)] lg:pb-14 bg-[var(--q-bg)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-xs tracking-widest text-[var(--q-text-muted)] uppercase">
            {sectionLabel}
          </span>
          <div className="flex-1 h-px bg-[var(--q-border)]" />
          <span className="font-mono text-xs text-[var(--q-text-muted)]">
            {String(activeIndex + 1).padStart(2, "0")} / {String(t.length).padStart(2, "0")}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-8">
            <blockquote
              className={`transition-all duration-300 ${
                isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}
            >
              <p className="font-light text-3xl md:text-4xl lg:text-5xl leading-[1.15] tracking-tight text-[var(--q-text-primary)]">
                &ldquo;{activeTestimonial.quote}&rdquo;
              </p>
            </blockquote>

            <div
              className={`mt-12 flex items-center gap-6 transition-all duration-300 delay-100 ${
                isAnimating ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-[var(--q-card)] border border-[var(--q-border)] flex items-center justify-center">
                <span className="font-medium text-2xl text-[var(--q-text-primary)]">
                  {activeTestimonial.author.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-lg font-medium text-[var(--q-text-primary)]">{activeTestimonial.author}</p>
                <p className="text-[var(--q-text-muted)]">
                  {activeTestimonial.role}, {activeTestimonial.company}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center">
            <div
              className={`p-8 border border-[var(--q-border)] transition-all duration-300 ${
                isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"
              }`}
            >
              <span className="font-mono text-xs tracking-widest text-[var(--q-text-muted)] uppercase block mb-4">
                {locale === "ar" ? "النتيجة الرئيسية" : locale === "fr" ? "Résultat clé" : "Key Result"}
              </span>
              <p className="text-3xl md:text-4xl font-light text-[var(--q-text-primary)]">
                {activeTestimonial.metric}
              </p>
            </div>

            <div className="flex gap-2 mt-8">
              {t.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => {
                      setActiveIndex(idx);
                      setIsAnimating(false);
                    }, 300);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? "w-8 bg-[var(--q-accent)]"
                      : "w-2 bg-[var(--q-accent)]/20 hover:bg-[var(--q-accent)]/40"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-24 pt-12 border-t border-[var(--q-border)]">
          <p className="font-mono text-xs tracking-widest text-[var(--q-text-muted)] uppercase mb-8 text-center">
            {locale === "ar" ? "موثوق من فرق ذات رؤية" : locale === "fr" ? "Utilisé par des équipes avant-gardistes" : "Trusted by forward-thinking teams"}
          </p>
        </div>
      </div>

      <div className="w-full">
        <div className="flex gap-16 items-center marquee">
          {[...Array(2)].map((_, setIdx) => (
            <div key={setIdx} className="flex gap-16 items-center shrink-0">
              {["Meridian Labs", "Flux Systems", "Beacon AI", "Prism Analytics", "Nova Tech", "Quantum Corp", "Atlas Digital", "Vertex Labs"].map(
                (company) => (
                  <span
                    key={`${setIdx}-${company}`}
                    className="font-mono text-sm tracking-widest uppercase text-[var(--q-text-muted)]/40 whitespace-nowrap hover:text-[var(--q-text-muted)] transition-colors duration-300"
                  >
                    {company}
                  </span>
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
