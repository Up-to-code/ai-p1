"use client";

import type { ReactNode } from "react";
import { useGsapReveal } from "@/hooks/use-gsap-scroll";

type GsapRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  duration?: number;
  scale?: number;
  start?: string;
};

export function GsapReveal({
  children,
  className,
  delay = 0,
  y = 28,
  duration = 0.8,
  scale = 1,
  start = "top 88%",
}: GsapRevealProps) {
  const ref = useGsapReveal<HTMLDivElement>({ delay, y, duration, scale, start });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
