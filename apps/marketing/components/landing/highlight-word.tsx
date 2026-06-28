"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type HighlightWordProps = {
  children: ReactNode;
  className?: string;
  color?: string;
  delay?: number;
};

export function HighlightWord({ children, className = "", color, delay = 0 }: HighlightWordProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const highlightColor = color ?? (isDark ? "rgba(173, 216, 230, 0.25)" : "rgba(173, 216, 230, 0.3)");

    el.style.position = "relative";
    el.style.display = "inline-block";
    el.style.zIndex = "1";

    const pseudo = document.createElement("span");
    pseudo.className = "highlight-pseudo";
    pseudo.style.cssText = `
      position: absolute;
      inset: 0;
      background: ${highlightColor};
      border-radius: 2px;
      z-index: -1;
      transform-origin: left center;
      transform: scaleX(0);
    `;
    el.appendChild(pseudo);

    const ctx = gsap.context(() => {
      gsap.to(pseudo, {
        scaleX: 1,
        duration: 0.8,
        delay,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 88%",
          toggleActions: "play none none reverse",
        },
      });
    }, el);

    return () => {
      ctx.revert();
      if (pseudo.parentNode) pseudo.parentNode.removeChild(pseudo);
    };
  }, [color, delay]);

  return (
    <span ref={ref} className={`relative inline-block font-semibold ${className}`}>
      {children}
    </span>
  );
}
