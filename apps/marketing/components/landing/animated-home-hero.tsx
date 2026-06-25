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
          ? "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--q-border)] bg-[var(--q-card)] px-6 text-sm font-bold text-[var(--q-text-primary)] backdrop-blur-xl transition hover:bg-[var(--q-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--q-accent)]"
          : "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--q-accent)] px-7 text-sm font-bold text-[var(--q-bg)] transition hover:bg-[var(--q-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--q-accent)]"
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

      {/* Dashboard screenshot removed */}

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

      <div className="relative z-30 flex min-h-[100dvh] items-end justify-start px-6 pb-24 pt-20 sm:px-12 md:px-16 lg:px-20 xl:px-24 lg:pb-32 overflow-hidden">
        <div className="w-full max-w-4xl">
          <p
            className="mb-6 inline-flex rounded-full border border-[var(--q-accent-border)] bg-[var(--q-accent-muted)] px-5 py-2.5 text-[10px] font-black uppercase text-[var(--q-accent)] backdrop-blur-xl transition-colors duration-300 hover:bg-[var(--q-accent)] hover:text-[var(--q-text-primary)]"
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
            className="text-3xl font-light leading-tight text-[var(--q-text-primary)] sm:text-4xl md:text-5xl lg:text-6xl rtl:leading-[1.2] tracking-tight"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(24px)",
              transform: heroReady ? "translateY(0px)" : "translateY(32px)",
              transition: "opacity 1s cubic-bezier(0.16,1,0.3,1), filter 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {isAr ? (
              <>
                برنامج جعل كل شيء <span className="font-semibold text-[var(--q-accent)]">بسيط</span> و<span className="font-semibold text-[var(--q-accent)]">ذكي</span>
              </>
            ) : (
              <>Software made it <span className="font-semibold text-[var(--q-accent)]">simple</span> and <span className="font-semibold text-[var(--q-accent)]">smart</span></>
            )}
          </h1>
          <p
            className="mt-6 text-base font-medium text-[var(--q-text-secondary)] md:text-lg"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(16px)",
              transform: heroReady ? "translateY(0px)" : "translateY(20px)",
              transition: "opacity 0.85s cubic-bezier(0.16,1,0.3,1) 80ms, filter 0.85s cubic-bezier(0.16,1,0.3,1) 80ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) 80ms",
            }}
          >
            {isAr ? "كل مشاريعك وعملائك والذكاء الاصطناعي وفرقك والأتمتة" : "all your projects, clients, AI, teams & automation"}
          </p>
          <ul
            className="mt-8 space-y-3"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(16px)",
              transform: heroReady ? "translateY(0px)" : "translateY(20px)",
              transition: "opacity 0.85s cubic-bezier(0.16,1,0.3,1) 110ms, filter 0.85s cubic-bezier(0.16,1,0.3,1) 110ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) 110ms",
            }}
          >
            <li className="flex items-start gap-2.5">
              <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--q-accent)]/10 text-[var(--q-accent)]">
                <Check className="size-3" />
              </div>
              <span className="text-[14px] font-semibold leading-snug text-[var(--q-text-secondary)]">
                {isAr ? "وفّر المال. كل تطبيقاتك وخطط الذكاء الاصطناعي ومشاريعك في مكان واحد." : "Save money. All your apps, AI plans, and projects in one place."}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--q-accent)]/10 text-[var(--q-accent)]">
                <Check className="size-3" />
              </div>
              <span className="text-[14px] font-semibold leading-snug text-[var(--q-text-secondary)]">
                {isAr ? "وصّل كل شيء. بروتوكول MCP يتيح للمطورين ووكلاء الذكاء الاصطناعي العمل بسلاسة." : "Connect everything. MCP protocol lets developers and AI agents work seamlessly."}
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--q-accent)]/10 text-[var(--q-accent)]">
                <Check className="size-3" />
              </div>
              <span className="text-[14px] font-semibold leading-snug text-[var(--q-text-secondary)]">
                {isAr ? "إنتاجية لا نهائية. وكلاء ذكاء اصطناعي ينفذون، لا يتحدثون فقط." : "Create infinite productivity. AI Agents that execute, not just chat."}
              </span>
            </li>
          </ul>
          <div
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            style={{
              opacity: heroReady ? 1 : 0,
              filter: heroReady ? "blur(0px)" : "blur(16px)",
              transform: heroReady ? "translateY(0px)" : "translateY(18px)",
              transition: "opacity 0.85s cubic-bezier(0.16,1,0.3,1) 180ms, filter 0.85s cubic-bezier(0.16,1,0.3,1) 180ms, transform 0.85s cubic-bezier(0.16,1,0.3,1) 180ms",
            }}
          >
            <HeroLink href="/dashboard" label={isAr ? "ابدأ الآن — مجاني للأبد" : "Get started — Free forever"} isAr={isAr} />
            <HeroLink href="/contact" label={isAr ? "بدون بطاقة ائتمان" : "No credit card needed"} isAr={isAr} secondary />
          </div>
        </div>
      </div>
    </section>
  );
}
