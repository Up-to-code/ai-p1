"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { AnimatedSphere } from "./animated-sphere";

const words = ["simple", "smart", "connected", "universal"];

export function AnimatedHomeHero() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden border-b border-[var(--q-border)] bg-[var(--q-bg)]">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-40 pointer-events-none">
        <AnimatedSphere />
      </div>
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-[var(--q-text-muted)]">
            <span className="w-8 h-px bg-[var(--q-border)]" />
            FROM QENTRAH WITH LOVE
          </span>
        </div>

        <div className="mb-12">
          <h1
            className={`text-[clamp(2.5rem,10vw,8rem)] font-light leading-[0.9] tracking-tight text-[var(--q-text-primary)] transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <span className="block">Software made it</span>
            <span className="block">
              <span className="relative inline-block">
                <span key={wordIndex} className="inline-flex">
                  {words[wordIndex].split("").map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block animate-char-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[var(--q-accent)]/10" />
              </span>
            </span>
          </h1>
        </div>

        <p
          className={`text-xl lg:text-2xl text-[var(--q-text-secondary)] leading-relaxed max-w-xl transition-all duration-700 delay-200 mb-10 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          All your projects, clients, AI, teams & automation — connected through shared context.
        </p>

        <div
          className={`flex flex-col sm:flex-row items-start gap-4 transition-all duration-700 delay-300 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Link
            href="/dashboard"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--q-accent)] px-8 text-sm font-bold text-[var(--q-bg)] transition-all hover:bg-[var(--q-accent-hover)] group"
          >
            Get started — Free forever
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[var(--q-border)] px-8 text-sm font-bold text-[var(--q-text-primary)] transition-all hover:bg-[var(--q-card-hover)]"
          >
            No credit card needed
          </Link>
        </div>
      </div>

    </section>
  );
}
