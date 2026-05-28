"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";

function useMotionReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return ready;
}

export function CinematicSpotlight() {
  const reduceMotion = useReducedMotion();
  const ready = useMotionReady();
  const { scrollYProgress } = useScroll();
  const canAnimate = ready && !reduceMotion;
  const drift = useTransform(scrollYProgress, [0, 0.35], canAnimate ? ["0px", "140px"] : ["0px", "0px"]);
  const glow = useTransform(scrollYProgress, [0, 0.35], canAnimate ? [0.34, 0.08] : [0.34, 0.34]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <motion.div
        style={{ y: drift, opacity: glow }}
        className="absolute left-1/2 top-[-180px] h-[620px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(91,118,255,0.52),rgba(20,184,166,0.12)_38%,transparent_68%)] blur-3xl"
      />
      <motion.div
        animate={canAnimate ? { opacity: [0.18, 0.36, 0.18], scale: [1, 1.08, 1] } : undefined}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-[-18%] top-[12%] h-[360px] w-[360px] rounded-full bg-cyan-400/20 blur-3xl"
      />
      <motion.div
        animate={canAnimate ? { opacity: [0.12, 0.28, 0.12], scale: [1.05, 1, 1.05] } : undefined}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        className="absolute left-[-16%] top-[20%] h-[340px] w-[340px] rounded-full bg-orange-300/20 blur-3xl"
      />
    </div>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ready = useMotionReady();

  if (!ready || reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function HeroProductReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const ready = useMotionReady();

  if (!ready || reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 46, rotateX: 10, scale: 0.96, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 1.05, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className={cn("[transform-style:preserve-3d]", className)}
    >
      {children}
    </motion.div>
  );
}

export function CinematicCard({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const ready = useMotionReady();

  if (!ready || reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 1, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -4, borderColor: "rgba(255,255,255,0.18)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedMetric({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ready = useMotionReady();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!ready || reduceMotion) {
      return;
    }

    let frame = 0;
    const total = 44;
    const id = window.setInterval(() => {
      frame += 1;
      const eased = 1 - Math.pow(1 - frame / total, 3);
      setDisplay(Math.round(value * eased));
      if (frame >= total) window.clearInterval(id);
    }, 24);

    return () => window.clearInterval(id);
  }, [ready, reduceMotion, value]);

  const shownValue = ready && reduceMotion ? value : display;

  return (
    <span>
      {shownValue}
      {suffix}
    </span>
  );
}

export function MotionButtonShell({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  const ready = useMotionReady();

  if (!ready || reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.025 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={cn("relative", className)}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-xl bg-white/20 blur-xl"
        animate={{ opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

export function InfinitePartnerRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const ready = useMotionReady();

  if (!ready || reduceMotion) {
    return (
      <div className={cn("flex flex-wrap justify-center gap-3", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        className="flex w-max gap-3"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        <div className="flex gap-3">{children}</div>
        <div className="flex gap-3" aria-hidden="true">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
