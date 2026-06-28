"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/routing";
import { workspaceLinks } from "@/lib/workspace-links";
import { AnimatedTetrahedron } from "./animated-tetrahedron";

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden bg-[var(--q-bg)] border-t border-[var(--q-border)]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          className={`relative border border-[var(--q-border)] transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          onMouseMove={handleMouseMove}
        >
          <div
            className="absolute inset-0 opacity-[0.07] pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, var(--q-text-primary), transparent 40%)`,
            }}
          />

          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1">
                <h2 className="text-4xl lg:text-7xl font-light tracking-tight text-[var(--q-text-primary)] mb-8 leading-[0.95]">
                  Ready to simplify
                  <br />
                  your workflow?
                </h2>

                <p className="text-xl text-[var(--q-text-secondary)] mb-12 leading-relaxed max-w-xl">
                  Join thousands of teams shipping faster with Qentrah. Start free, scale infinitely.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <a
                    href={workspaceLinks.signUp}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[var(--q-accent)] px-8 text-sm font-bold text-[var(--q-bg)] transition-all hover:bg-[var(--q-accent-hover)] group"
                  >
                    Start building free
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </a>
                  <Link
                    href="/contact"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-[var(--q-border)] px-8 text-sm font-bold text-[var(--q-text-primary)] transition-all hover:bg-[var(--q-card-hover)]"
                  >
                    Talk to sales
                  </Link>
                </div>

                <p className="text-sm text-[var(--q-text-muted)] mt-8 font-mono">
                  No credit card required
                </p>
              </div>

              <div className="hidden lg:flex items-center justify-center w-[500px] h-[500px] -mr-16 dark-invert-canvas">
                <AnimatedTetrahedron />
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 border-b border-l border-[var(--q-border)]/50" />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-t border-r border-[var(--q-border)]/50" />
        </div>
      </div>
    </section>
  );
}
