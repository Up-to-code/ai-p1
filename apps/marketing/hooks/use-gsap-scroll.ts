"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type GsapRevealOptions = {
  delay?: number;
  y?: number;
  duration?: number;
  stagger?: number;
  scale?: number;
  scrub?: boolean | number;
  start?: string;
  end?: string;
  toggleActions?: string;
};

export function useGsapReveal<T extends HTMLElement = HTMLDivElement>(
  options: GsapRevealOptions = {}
) {
  const ref = useRef<T>(null!);
  const deps = [
    options.delay,
    options.duration,
    options.y,
    options.scale,
    options.start,
    options.end,
    options.toggleActions,
    options.stagger,
    options.scrub,
  ];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        {
          opacity: 0,
          y: options.y ?? 40,
          scale: options.scale ?? 1,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: options.duration ?? 0.9,
          delay: options.delay ?? 0,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: options.start ?? "top 88%",
            end: options.end ?? "bottom 20%",
            toggleActions: options.toggleActions ?? "play none none reverse",
            scrub: options.scrub ?? false,
          },
        }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

export function useGsapParallax<T extends HTMLElement = HTMLDivElement>(
  speed: number = 0.4
) {
  const ref = useRef<T>(null!);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        y: () => window.innerHeight * speed,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return ref;
}

export function useGsapStaggerReveal<T extends HTMLElement = HTMLDivElement>(
  childSelector: string,
  options: GsapRevealOptions = {}
) {
  const ref = useRef<T>(null!);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll(childSelector),
        {
          opacity: 0,
          y: options.y ?? 30,
        },
        {
          opacity: 1,
          y: 0,
          duration: options.duration ?? 0.6,
          stagger: options.stagger ?? 0.1,
          delay: options.delay ?? 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: options.start ?? "top 85%",
            toggleActions: options.toggleActions ?? "play none none reverse",
          },
        }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childSelector, options.stagger, options.delay, options.duration, options.y, options.start, options.toggleActions]);

  return ref;
}

export function useGsapCounter(
  endValue: number,
  options: { duration?: number; start?: string; suffix?: string; prefix?: string } = {}
) {
  const ref = useRef<HTMLSpanElement>(null!);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { textContent: 0 },
        {
          textContent: endValue,
          duration: options.duration ?? 2,
          ease: "power2.out",
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: el,
            start: options.start ?? "top 85%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            el.textContent = `${options.prefix ?? ""}${Math.round(Number(el.textContent))}${options.suffix ?? ""}`;
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [endValue, options.duration, options.start, options.suffix, options.prefix]);

  return ref;
}
