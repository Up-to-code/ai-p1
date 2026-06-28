"use client";

import { PublicSection } from "@/components/landing/public-landing-kit";
import { GsapReveal } from "@/components/landing/gsap-reveal";
import { useGsapStaggerReveal } from "@/hooks/use-gsap-scroll";

const copy = {
  en: {
    tag: "CLIENTS",
    headline: (
      <>
        Your clients, your pipeline — <em>all in view.</em>
      </>
    ),
    subtext: (
      <>From first contact to project delivery, manage every client relationship with full history, context, and AI-powered insights.</>
    ),
    highlight: "No more hunting through inboxes for client details.",
    features: [
      { label: "360° client view", desc: "Projects, tasks, docs, and chat — all linked" },
      { label: "Pipeline management", desc: "Track deals from lead to close" },
      { label: "Communication log", desc: "Every interaction, automatically recorded" },
      { label: "Client portal", desc: "Share updates and deliverables securely" },
    ],
    stats: [
      { value: "3x", desc: "Faster client onboarding" },
      { value: "100%", desc: "Context retention across teams" },
      { value: "40%", desc: "Less time in status meetings" },
    ],
  },
  ar: {
    tag: "العملاء",
    headline: (
      <>
        عملاؤك وقنوات مبيعاتك — <em>كلها في مرمى البصر.</em>
      </>
    ),
    subtext: (
      <>من أول اتصال إلى تسليم المشروع، أدر كل علاقة عميل بسجل كامل وسياق ورؤى مدعومة بالذكاء الاصطناعي.</>
    ),
    highlight: "لا مزيد من البحث في صناديق البريد عن تفاصيل العملاء.",
    features: [
      { label: "عرض 360° للعميل", desc: "المشاريع والمهام والمستندات والمحادثات — كلها مرتبطة" },
      { label: "إدارة قنوات البيع", desc: "تتبع الصفقات من البداية إلى الإغلاق" },
      { label: "سجل التواصل", desc: "كل تفاعل، مسجل تلقائياً" },
      { label: "بوابة العميل", desc: "مشاركة التحديثات والتسليمات بشكل آمن" },
    ],
    stats: [
      { value: "3x", desc: "أسرع في تأهيل العملاء" },
      { value: "١٠٠٪", desc: "الاحتفاظ بالسياق عبر الفرق" },
      { value: "٤٠٪", desc: "وقت أقل في اجتماعات المتابعة" },
    ],
  },
};

export function ClientsSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;
  const staggerRef = useGsapStaggerReveal<HTMLDivElement>(".client-feature-item", { stagger: 0.12, start: "top 85%" });
  const statsStaggerRef = useGsapStaggerReveal<HTMLDivElement>(".client-stat-item", { stagger: 0.15, start: "top 85%" });

  return (
    <PublicSection id="clients" tone="default">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <GsapReveal>
              <span className="text-xs font-bold tracking-wider uppercase text-[var(--coral)] mb-2.5 block" style={{ letterSpacing: "0.06em" }}>
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
                <div key={i} className="client-feature-item flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[var(--coral)] flex items-center justify-center flex-shrink-0 mt-0.5">
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
            <GsapReveal delay={0.3} y={40}>
              <div className="aspect-[4/5] w-full max-w-lg mx-auto overflow-hidden rounded-2xl border border-[var(--q-border)] bg-[var(--q-bg)]">
                <img
                  src="/landing-images/clients-section.png"
                  alt="Qentrah clients management"
                  className="h-full w-full object-cover"
                />
              </div>
            </GsapReveal>
          </div>
        </div>
        <div ref={statsStaggerRef} className="mt-16 grid grid-cols-3 gap-px bg-[var(--q-border)] border border-[var(--q-border)] rounded-2xl overflow-hidden">
          {labels.stats.map((stat, i) => (
            <div key={i} className="client-stat-item bg-[var(--q-bg)] p-6 sm:p-8 text-center transition-colors hover:bg-[var(--q-card-hover)]">
              <div className="text-3xl sm:text-4xl font-bold tracking-tight mb-1.5 text-[var(--coral)]" style={{ letterSpacing: "-0.03em" }}>
                {stat.value}
              </div>
              <p className="text-sm text-[var(--q-text-secondary)] leading-relaxed">
                {stat.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </PublicSection>
  );
}
