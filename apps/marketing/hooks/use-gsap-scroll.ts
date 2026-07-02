"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ── Single element fade-up reveal ────────────────────────────────────────────

type RevealOptions = {
  delay?: number;
  y?: number;
  duration?: number;
  scale?: number;
  start?: string;
};

export function useGsapReveal<T extends HTMLElement = HTMLElement>(
  options: RevealOptions = {},
) {
  const { delay = 0, y = 28, duration = 0.8, scale = 1, start = "top 88%" } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y, scale: scale !== 1 ? scale * 0.95 : 1 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start,
            toggleActions: "play none none none",
          },
        },
      );
    });

    return () => ctx.revert();
  }, [delay, y, duration, scale, start]);

  return ref;
}

// ── Staggered children reveal ─────────────────────────────────────────────────

type StaggerOptions = {
  stagger?: number;
  y?: number;
  duration?: number;
  start?: string;
};

export function useGsapStaggerReveal<T extends HTMLElement = HTMLElement>(
  childSelector: string,
  options: StaggerOptions = {},
) {
  const { stagger = 0.1, y = 20, duration = 0.6, start = "top 85%" } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const children = container.querySelectorAll(childSelector);
      if (!children.length) return;

      gsap.fromTo(
        children,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger,
          ease: "power3.out",
          scrollTrigger: {
            trigger: container,
            start,
            toggleActions: "play none none none",
          },
        },
      );
    }, container);

    return () => ctx.revert();
  }, [childSelector, stagger, y, duration, start]);

  return ref;
}
