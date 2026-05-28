"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Link } from "@/i18n/routing";
import { IntroAnimation, introRevealMs } from "@/components/landing/intro-animation";

type HeroStat = {
  value: string;
  label: string;
};

type AnimatedHomeHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  isAr: boolean;
};

const heroVideoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4";

function HeroArrow({ isAr, secondary = false }: { isAr: boolean; secondary?: boolean }) {
  if (secondary) return <ArrowUpRight className={isAr ? "size-4 -rotate-90" : "size-4"} />;
  return <ArrowRight className={isAr ? "size-4 rotate-180" : "size-4"} />;
}

function HeroLink({
  href,
  label,
  isAr,
  secondary = false,
}: {
  href: "/dashboard" | "/contact";
  label: string;
  isAr: boolean;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        secondary
          ? "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--hero-text)_15%,transparent)] bg-[color-mix(in_srgb,var(--hero-bg)_70%,transparent)] px-6 text-sm font-bold text-[var(--hero-text)] backdrop-blur-xl transition hover:bg-[var(--hero-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b5cff]"
          : "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--hero-text)] px-7 text-sm font-bold text-[var(--hero-bg)] transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b5cff]"
      }
    >
      {label}
      <HeroArrow isAr={isAr} secondary={secondary} />
    </Link>
  );
}

export function AnimatedHomeHero({ eyebrow, title, description, primaryLabel, secondaryLabel, isAr }: AnimatedHomeHeroProps) {
  const [heroReady, setHeroReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const introLabel = isAr ? "كانترا" : "QENTRAH";
  const revealDelay = useMemo(() => introRevealMs(isAr ? 1 : Array.from(introLabel).length), [introLabel, isAr]);
  const stats: HeroStat[] = isAr
    ? [
        { value: "01", label: "رؤية السوق" },
        { value: "02", label: "حركة الطلب" },
        { value: "03", label: "إدارة المبيعات" },
      ]
    : [
        { value: "01", label: "Market truth" },
        { value: "02", label: "Partner motion" },
        { value: "03", label: "Workspace action" },
      ];

  const handleIntroDone = useCallback(() => {
    setHeroReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setVideoReady(true), revealDelay);
    return () => window.clearTimeout(timer);
  }, [revealDelay]);

  return (
    <section className="relative min-h-screen overflow-hidden border-b border-[color-mix(in_srgb,var(--hero-text)_10%,transparent)] bg-[var(--hero-bg)] text-[var(--hero-text)] [--hero-bg:#f5f4f0] [--hero-text:#111111] dark:[--hero-bg:#050505] dark:[--hero-text:#f8fafc]">
      <IntroAnimation label={introLabel} onDone={handleIntroDone} />

      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover dark:opacity-45"
        src={heroVideoUrl}
        style={{
          transform: videoReady ? "scale(1.05)" : "scale(0.86)",
          transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: "65%",
          background:
            "linear-gradient(to top, var(--hero-bg) 0%, var(--hero-bg) 18%, color-mix(in srgb, var(--hero-bg) 86%, transparent) 36%, color-mix(in srgb, var(--hero-bg) 50%, transparent) 56%, color-mix(in srgb, var(--hero-bg) 15%, transparent) 76%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: "22%",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: "40%",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: "58%",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
        }}
      />

      <div className="relative z-30 flex min-h-screen items-end px-5 pb-9 pt-32 sm:px-8 md:px-12 md:pb-12">
        <div className="grid w-full max-w-7xl gap-8 lg:grid-cols-[minmax(0,0.86fr)_minmax(260px,0.34fr)] lg:items-end">
          <div className="max-w-4xl">
            <p
              className="mb-5 inline-flex rounded-full border border-[color-mix(in_srgb,var(--hero-text)_10%,transparent)] bg-[color-mix(in_srgb,var(--hero-bg)_70%,transparent)] px-4 py-2 text-[10px] font-black uppercase text-[#0b5cff] backdrop-blur-xl dark:text-blue-200"
              style={{
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(14px)",
                transform: heroReady ? "translateY(0px)" : "translateY(16px)",
                transition: "opacity 0.8s cubic-bezier(0.16,1,0.3,1), filter 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {eyebrow}
            </p>
            <h1
              className="max-w-4xl text-5xl font-light leading-none text-[var(--hero-text)] sm:text-6xl md:text-7xl lg:text-8xl rtl:leading-[1.14]"
              style={{
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(24px)",
                transform: heroReady ? "translateY(0px)" : "translateY(32px)",
                transition: "opacity 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {title}
            </h1>
            <p
              className="mt-6 max-w-2xl text-base font-medium leading-8 text-[color-mix(in_srgb,var(--hero-text)_62%,transparent)] md:text-lg"
              style={{
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(16px)",
                transform: heroReady ? "translateY(0px)" : "translateY(20px)",
                transition: "opacity 0.85s cubic-bezier(0.16,1,0.3,1) 110ms, filter 0.85s cubic-bezier(0.16,1,0.3,1) 110ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) 110ms",
              }}
            >
              {description}
            </p>
            <div
              className="mt-8 flex flex-col gap-3 sm:flex-row"
              style={{
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(16px)",
                transform: heroReady ? "translateY(0px)" : "translateY(18px)",
                transition: "opacity 0.85s cubic-bezier(0.16,1,0.3,1) 180ms, filter 0.85s cubic-bezier(0.16,1,0.3,1) 180ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) 180ms",
              }}
            >
              <HeroLink href="/dashboard" label={primaryLabel} isAr={isAr} />
              <HeroLink href="/contact" label={secondaryLabel} isAr={isAr} secondary />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-5 lg:grid-cols-1 lg:justify-self-end">
            {stats.map((stat, index) => (
              <div
                className="min-w-0"
                key={stat.label}
                style={{
                  opacity: heroReady ? 1 : 0,
                  filter: heroReady ? "blur(0px)" : "blur(16px)",
                  transform: heroReady ? "translateY(0px)" : "translateY(20px)",
                  transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${220 + index * 80}ms, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${220 + index * 80}ms, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${220 + index * 80}ms`,
                }}
              >
                <div className="truncate text-2xl font-light leading-none text-[var(--hero-text)] sm:text-3xl md:text-4xl">{stat.value}</div>
                <div className="mt-2 text-[10px] font-black uppercase leading-4 text-[color-mix(in_srgb,var(--hero-text)_42%,transparent)] sm:text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
