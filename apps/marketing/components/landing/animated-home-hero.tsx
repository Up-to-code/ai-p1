"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";

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

// ── Hero background images ── light = daytime landscape, dark = night scene ──
const heroBgLight = "/images/hero-bg-light.png";
const heroBgDark = "/images/hero-bg-dark.png";

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
          ? "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-6 text-sm font-bold text-zinc-900 dark:text-white backdrop-blur-xl transition hover:bg-zinc-50 dark:hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--q-accent)]"
          : "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--q-accent)] px-7 text-sm font-bold text-white transition hover:bg-[var(--q-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--q-accent)]"
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

  const handleIntroDone = useCallback(() => {
    setHeroReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setVideoReady(true), revealDelay);
    return () => window.clearTimeout(timer);
  }, [revealDelay]);

  return (
    <section className="relative min-h-screen overflow-hidden border-b border-zinc-200/80 bg-[var(--q-bg)] text-[var(--q-text-primary)] dark:border-zinc-800/80 dark:bg-[var(--q-bg)] dark:text-[var(--q-text-primary)]">
      <IntroAnimation label={introLabel} onDone={handleIntroDone} />

      {/* ── Hero background: daytime in light mode, night scene in dark mode ── */}
      <img
        src={heroBgLight}
        alt=""
        aria-hidden
        className="absolute inset-0 z-0 h-full w-full object-cover block dark:hidden"
        style={{
          transform: videoReady ? "scale(1.05)" : "scale(0.86)",
          transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      <img
        src={heroBgDark}
        alt=""
        aria-hidden
        className="absolute inset-0 z-0 h-full w-full object-cover hidden dark:block"
        style={{
          transform: videoReady ? "scale(1.05)" : "scale(0.86)",
          transition: "transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      <div 
        className="absolute right-0 top-[15%] z-[5] hidden w-[680px] xl:w-[860px] lg:block"
        style={{
          opacity: heroReady ? 1 : 0,
          filter: heroReady ? "blur(0px)" : "blur(20px)",
          transform: heroReady ? "translateX(18%)" : "translateX(30%)",
          transition: "opacity 1s cubic-bezier(0.16,1,0.3,1) 300ms, filter 1s cubic-bezier(0.16,1,0.3,1) 300ms, transform 1s cubic-bezier(0.16,1,0.3,1) 300ms",
        }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white/5 p-2 shadow-[0_0_60px_rgba(0,0,0,0.15)] backdrop-blur-sm border border-white/10 dark:bg-black/20 dark:border-white/5">
           {/* Light mode screenshot */}
           <img 
             src="/images/hero-app-light.png" 
             alt="Dashboard AI Assistant" 
             className="block dark:hidden rounded-xl w-full h-auto object-cover shadow-[0_30px_60px_rgba(0,0,0,0.15)]" 
           />
           {/* Dark mode screenshot */}
           <img 
             src="/images/hero-app-dark.png" 
             alt="Dashboard AI Assistant" 
             className="hidden dark:block rounded-xl w-full h-auto object-cover shadow-[0_30px_60px_rgba(0,0,0,0.6)]" 
           />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10"
        style={{
          height: "65%",
          background:
            "linear-gradient(to top, var(--q-bg) 0%, var(--q-bg) 18%, color-mix(in srgb, var(--q-bg) 86%, transparent) 36%, color-mix(in srgb, var(--q-bg) 50%, transparent) 56%, color-mix(in srgb, var(--q-bg) 15%, transparent) 76%, transparent 100%)",
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

      <div className="relative z-30 flex min-h-[100dvh] items-end px-5 pb-24 pt-48 sm:px-8 md:px-12 lg:pb-32 overflow-hidden">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-end gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative z-20">
            <p
              className="mb-5 inline-flex rounded-full border border-[var(--q-accent-border)] bg-[var(--q-accent-muted)] px-4 py-2 text-[10px] font-black uppercase text-[var(--q-accent)] backdrop-blur-xl transition-colors duration-300 hover:bg-[var(--q-accent)] hover:text-[var(--q-text-primary)]"
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
              className="max-w-4xl text-5xl font-light leading-none text-[var(--q-text-primary)] sm:text-6xl md:text-7xl lg:text-8xl rtl:leading-[1.14]"
              style={{
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(24px)",
                transform: heroReady ? "translateY(0px)" : "translateY(32px)",
                transition: "opacity 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              {title}
            </h1>
            <ul
              className="mt-8 space-y-4"
              style={{
                opacity: heroReady ? 1 : 0,
                filter: heroReady ? "blur(0px)" : "blur(16px)",
                transform: heroReady ? "translateY(0px)" : "translateY(20px)",
                transition: "opacity 0.85s cubic-bezier(0.16,1,0.3,1) 110ms, filter 0.85s cubic-bezier(0.16,1,0.3,1) 110ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) 110ms",
              }}
            >
              <li className="flex items-start gap-3">
                <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--q-accent)]/10 text-[var(--q-accent)]">
                  <Check className="size-3" />
                </div>
                <span className="text-[15px] font-medium leading-relaxed text-[var(--q-text-secondary)]">
                  {isAr ? "بساطة ذكية. كل تطبيقاتك وعملائك ومشاريعك في مكان واحد." : "Smart simplicity. All your apps, clients, and projects unified."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--q-accent)]/10 text-[var(--q-accent)]">
                  <Check className="size-3" />
                </div>
                <span className="text-[15px] font-medium leading-relaxed text-[var(--q-text-secondary)]">
                  {isAr ? "مستقبل العمل. وكلاء ذكاء اصطناعي يعملون كأعضاء في فريقك." : "Futuristic workflow. AI agents working alongside your team."}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--q-accent)]/10 text-[var(--q-accent)]">
                  <Check className="size-3" />
                </div>
                <span className="text-[15px] font-medium leading-relaxed text-[var(--q-text-secondary)]">
                  {isAr ? "إنجاز حقيقي. توقف عن إدارة المهام وابدأ بتوجيه النتائج." : "Real execution. Stop managing tasks and start directing outcomes."}
                </span>
              </li>
            </ul>
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

          {/* Spacer to preserve grid layout and prevent text overlap on the right */}
          <div className="hidden lg:block"></div>
        </div>
      </div>
    </section>
  );
}
