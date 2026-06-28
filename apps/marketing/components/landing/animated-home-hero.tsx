"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { Link } from "@/i18n/routing";
import { IntroAnimation, introRevealMs } from "@/components/landing/intro-animation";

gsap.registerPlugin(ScrollTrigger);

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

function HeroFloatingOrbs({ isAr }: { isAr: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const orbs = container.querySelectorAll<HTMLDivElement>(".hero-orb");
    const ctx = gsap.context(() => {
      orbs.forEach((orb, i) => {
        gsap.to(orb, {
          y: i % 2 === 0 ? -20 : 20,
          x: i % 3 === 0 ? 15 : -15,
          rotation: i * 8,
          duration: 3 + i * 0.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.4,
        });
      });
    }, container);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="pointer-events-none absolute inset-0 z-[5] overflow-hidden" aria-hidden>
      <div className="hero-orb absolute -top-10 right-[15%] size-48 rounded-full border border-[var(--q-border)]/20 bg-gradient-to-br from-[var(--q-accent)]/3 to-transparent backdrop-blur-sm" style={{ opacity: 0.6 }} />
      <div className="hero-orb absolute -bottom-8 left-[8%] size-36 rounded-full border border-[var(--q-border)]/15 bg-gradient-to-tr from-[var(--q-agent-purple)]/5 to-transparent backdrop-blur-sm" style={{ opacity: 0.5 }} />
      <div className="hero-orb absolute top-[20%] left-[5%] size-20 rounded-full border border-[var(--q-border)]/10 bg-[var(--q-human-green)]/5 backdrop-blur-sm" style={{ opacity: 0.4 }} />
      <div className="hero-orb absolute top-[60%] right-[5%] size-28 rounded-full border border-[var(--q-border)]/10 bg-[var(--q-automation-orange)]/5 backdrop-blur-sm" style={{ opacity: 0.35 }} />
      <div className="hero-orb absolute -top-5 left-[40%] size-16 rounded-full border border-[var(--q-border)]/10 bg-[var(--q-network-blue)]/5 backdrop-blur-sm" style={{ opacity: 0.3 }} />
    </div>
  );
}

export function AnimatedHomeHero({ eyebrow, title, description, primaryLabel, secondaryLabel, isAr }: AnimatedHomeHeroProps) {
  const [heroReady, setHeroReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const sectionRef = useRef<HTMLDivElement>(null);
  const bgLightRef = useRef<HTMLImageElement>(null);
  const bgDarkRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const introLabel = isAr ? "كانترا" : "QENTRAH";
  const revealDelay = useMemo(() => introRevealMs(isAr ? 1 : Array.from(introLabel).length), [introLabel, isAr]);

  const handleIntroDone = useCallback(() => {
    setHeroReady(true);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setVideoReady(true), revealDelay);
    return () => window.clearTimeout(timer);
  }, [revealDelay]);

  useEffect(() => {
    setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      setTheme(isDark ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!heroReady) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          const progress = self.progress;
          const bg = bgLightRef.current || bgDarkRef.current;
          if (bg) {
            gsap.set(bg, { scale: 1 + progress * 0.08 });
          }
          const content = contentRef.current;
          if (content) {
            gsap.set(content, {
              opacity: 1 - progress * 0.5,
              y: progress * 60,
            });
          }
        },
      });
    }, section);

    return () => ctx.revert();
  }, [heroReady]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden border-b border-[var(--q-border)] bg-[var(--q-bg)] text-[var(--q-text-primary)]">
      <IntroAnimation label={introLabel} onDone={handleIntroDone} />

      <HeroFloatingOrbs isAr={isAr} />

      <img
        ref={bgLightRef}
        src={heroBgLight}
        alt=""
        aria-hidden
        className="absolute inset-0 z-0 h-full w-full object-cover will-change-transform"
        style={{
          opacity: theme === "light" ? 1 : 0,
          transform: `scale(${videoReady ? 1.05 : 0.86})`,
          transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />
      <img
        ref={bgDarkRef}
        src={heroBgDark}
        alt=""
        aria-hidden
        className="absolute inset-0 z-0 h-full w-full object-cover will-change-transform"
        style={{
          opacity: theme === "dark" ? 1 : 0,
          transform: `scale(${videoReady ? 1.05 : 0.86})`,
          transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

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

      <div
        ref={contentRef}
        className="relative z-30 flex min-h-[100dvh] items-end justify-start px-6 pb-24 pt-20 sm:px-12 md:px-16 lg:px-20 xl:px-24 lg:pb-32 overflow-hidden will-change-transform"
      >
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
