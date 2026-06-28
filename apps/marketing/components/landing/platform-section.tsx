"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PublicSection } from "@/components/landing/public-landing-kit";
import { GsapReveal } from "@/components/landing/gsap-reveal";

gsap.registerPlugin(ScrollTrigger);

const copy = {
  en: {
    tag: "PLATFORM",
    headline: "Built around how agencies actually work.",
    subtext: "Five integrated layers that power your entire operation — from project intake to delivery.",
    bridge: [
      {
        zone: "Orchestration",
        items: ["Projects", "Tasks", "Timelines", "Milestones"],
        color: "#4A7CF7",
      },
      {
        zone: "Relationships",
        items: ["CRM", "Clients", "Deals", "Pipeline"],
        color: "#5B8DEF",
      },
      {
        zone: "Knowledge",
        items: ["Docs", "Wikis", "Reports", "Templates"],
        color: "#6B9AFF",
      },
      {
        zone: "Intelligence",
        items: ["AI Agents", "Automation", "Context", "Insights"],
        color: "#4388FF",
      },
      {
        zone: "Communication",
        items: ["Messages", "Threads", "Channels", "Inbox"],
        color: "#7AACFF",
      },
    ],
    connections: [
      { from: "Projects", to: "CRM", via: "Client Context" },
      { from: "CRM", to: "Docs", via: "Proposals" },
      { from: "Docs", to: "AI", via: "Knowledge" },
      { from: "AI", to: "Messages", via: "Actions" },
      { from: "Messages", to: "Projects", via: "Tasks" },
    ],
    stats: [
      { label: "Integrated Tools", value: "12+" },
      { label: "Avg Onboarding", value: "< 5min" },
      { label: "Data Sync", value: "Real-time" },
    ],
  },
  ar: {
    tag: "المنصة",
    headline: "مبنية حول كيف تعمل الوكالات فعلياً.",
    subtext: "خمس طبقات متكاملة تدير عملياتك بالكامل — من استلام المشروع إلى التسليم.",
    bridge: [
      {
        zone: "التنسيق",
        items: ["المشاريع", "المهام", "الجداول", "المعالم"],
        color: "#4A7CF7",
      },
      {
        zone: "العلاقات",
        items: ["العملاء", "الصفقات", "القنوات", "الشراكات"],
        color: "#5B8DEF",
      },
      {
        zone: "المعرفة",
        items: ["المستندات", "الويكي", "التقارير", "القوالب"],
        color: "#6B9AFF",
      },
      {
        zone: "الذكاء",
        items: ["وكلاء الذكاء", "الأتمتة", "السياق", "الرؤى"],
        color: "#4388FF",
      },
      {
        zone: "التواصل",
        items: ["الرسائل", "السلاسل", "القنوات", "البريد"],
        color: "#7AACFF",
      },
    ],
    connections: [
      { from: "المشاريع", to: "العملاء", via: "سياق العميل" },
      { from: "العملاء", to: "المستندات", via: "العروض" },
      { from: "المستندات", to: "الذكاء", via: "المعرفة" },
      { from: "الذكاء", to: "الرسائل", via: "الإجراءات" },
      { from: "الرسائل", to: "المشاريع", via: "المهام" },
    ],
    stats: [
      { label: "أداة متكاملة", value: "12+" },
      { label: "متوسط التفعيل", value: "< 5د" },
      { label: "مزامنة البيانات", value: "فورية" },
    ],
  },
};

function BridgeArc({ color, delay = 0 }: { color: string; delay?: number }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    const ctx = gsap.context(() => {
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.5,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: path,
          start: "top 90%",
          toggleActions: "play none none reverse",
        },
      });
    }, path);

    return () => ctx.revert();
  }, [color, delay]);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 120" preserveAspectRatio="none">
      <path
        ref={pathRef}
        d="M 40 100 Q 200 -20 360 100"
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function PlatformGrid({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;

    const cells = el.querySelectorAll<HTMLDivElement>(".bridge-cell");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cells,
        { opacity: 0, y: 20, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          stagger: 0.04,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
      {labels.bridge.map((zone, zi) => (
        <div key={zi} className="bridge-cell relative bg-[var(--q-bg-very-dark)] border border-[var(--q-border)] rounded-xl p-4 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div
            className="absolute top-0 left-0 w-full h-0.5"
            style={{ background: zone.color }}
          />
          <div
            className="text-[11px] font-bold tracking-wider uppercase mb-2.5"
            style={{ color: zone.color, letterSpacing: "0.06em" }}
          >
            {zone.zone}
          </div>
          <div className="space-y-1.5">
            {zone.items.map((item, ii) => (
              <div
                key={ii}
                className="text-xs font-medium text-[var(--q-text-secondary)] transition-colors hover:text-[var(--q-text-primary)]"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ConnectionFlow({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;
  const flowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = flowRef.current;
    if (!el) return;

    const items = el.querySelectorAll<HTMLDivElement>(".connection-item");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={flowRef} className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
      {labels.connections.map((conn, i) => (
        <div key={i} className="connection-item flex items-center gap-2">
          <span className="font-semibold text-[var(--q-text-primary)]">{conn.from}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--q-text-muted)" strokeWidth="1.5" strokeLinecap="round" className="opacity-50">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
          <span className="text-[var(--q-text-muted)] italic">{conn.via}</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--q-text-muted)" strokeWidth="1.5" strokeLinecap="round" className="opacity-50">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
          <span className="font-semibold text-[var(--q-text-primary)]">{conn.to}</span>
          {i < labels.connections.length - 1 && (
            <div className="hidden sm:block w-6 h-px bg-gradient-to-r from-transparent via-[var(--q-border)] to-transparent" />
          )}
        </div>
      ))}
    </div>
  );
}

function BridgeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg sm:text-xl font-bold tracking-tight text-[#4A7CF7]">{value}</div>
      <div className="text-xs text-[var(--q-text-secondary)]">{label}</div>
    </div>
  );
}

export function PlatformSection({ locale }: { locale: string }) {
  const isAr = locale === "ar";
  const labels = isAr ? copy.ar : copy.en;

  return (
    <PublicSection id="platform" tone="very-dark">
      <div className="wrap">
        <div className="text-center mb-10">
          <GsapReveal>
            <span className="text-xs font-bold tracking-wider uppercase text-[#4A7CF7] mb-2.5 block" style={{ letterSpacing: "0.06em" }}>
              {labels.tag}
            </span>
          </GsapReveal>
          <GsapReveal delay={0.1}>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3.5" style={{ letterSpacing: "-0.03em" }}>
              {labels.headline}
            </h2>
          </GsapReveal>
          <GsapReveal delay={0.2}>
            <p className="text-base text-[var(--q-text-secondary)] max-w-lg mx-auto">
              {labels.subtext}
            </p>
          </GsapReveal>
        </div>

        <PlatformGrid locale={locale} />

        <GsapReveal delay={0.3}>
          <div className="mt-8 p-5 sm:p-6 bg-[var(--q-bg-very-dark)] border border-[var(--q-border)] rounded-xl relative overflow-hidden">
            <div className="text-[11px] font-bold tracking-wider uppercase text-[var(--q-text-muted)] mb-3" style={{ letterSpacing: "0.06em" }}>
              Data Flow
            </div>
            <ConnectionFlow locale={locale} />
          </div>
        </GsapReveal>

        <GsapReveal delay={0.4}>
          <div className="mt-6 grid grid-cols-3 gap-px bg-[var(--q-border)] border border-[var(--q-border)] rounded-xl overflow-hidden">
            {labels.stats.map((stat, i) => (
              <div key={i} className="bg-[var(--q-bg-very-dark)] p-4 sm:p-5 transition-colors hover:bg-[var(--q-bg)]">
                <BridgeStat label={stat.label} value={stat.value} />
              </div>
            ))}
          </div>
        </GsapReveal>
      </div>
    </PublicSection>
  );
}
