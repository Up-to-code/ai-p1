"use client";

import { useEffect, useMemo, useState } from "react";

const LETTER_IN_STAGGER = 90;
const LETTER_IN_DUR = 700;
const HOLD_DURATION = 300;
const LETTER_OUT_STAGGER = 55;
const LETTER_OUT_DUR = 450;

const lettersInTotal = (count: number) => LETTER_IN_STAGGER * Math.max(count - 1, 0) + LETTER_IN_DUR + HOLD_DURATION;
const curtainDelay = (count: number) => lettersInTotal(count) + 100;
const curtainDuration = 1300;
const lettersOutTotal = (count: number) => LETTER_OUT_STAGGER * Math.max(count - 1, 0) + LETTER_OUT_DUR;
const animTotal = (count: number) => curtainDelay(count) + lettersOutTotal(count) + 1400;

export function introRevealMs(count: number) {
  return curtainDelay(count) + curtainDuration - 150;
}

type Phase = "idle" | "in" | "out" | "done";

export function IntroAnimation({ label, onDone }: { label: string; onDone: () => void }) {
  const letters = useMemo(() => {
    const compactLabel = label.replace(/\s+/g, "");
    const needsConnectedScript = /[\u0600-\u06ff]/.test(compactLabel);
    return needsConnectedScript ? [compactLabel] : Array.from(compactLabel);
  }, [label]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [curtainUp, setCurtainUp] = useState(false);

  useEffect(() => {
    const count = Math.max(letters.length, 1);
    const t0 = window.setTimeout(() => setPhase("in"), 80);
    const t1 = window.setTimeout(() => setPhase("out"), lettersInTotal(count));
    const t2 = window.setTimeout(() => setCurtainUp(true), curtainDelay(count));
    const t3 = window.setTimeout(() => onDone(), introRevealMs(count));
    const t4 = window.setTimeout(() => setPhase("done"), animTotal(count));

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(t4);
    };
  }, [letters.length, onDone]);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[70] pointer-events-none" aria-hidden="true">
      <div
        className="absolute inset-x-0 top-0 bg-[#f5f4f1] dark:bg-[#050505]"
        style={{
          bottom: curtainUp ? "100%" : "0%",
          transition: curtainUp ? "bottom 1.3s cubic-bezier(0.76, 0, 0.24, 1)" : "none",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden px-6">
        <div className="flex max-w-full" style={{ gap: "0.08em" }}>
          {letters.map((letter, index) => {
            const isIdle = phase === "idle";
            const isIn = phase === "in";
            const isOut = phase === "out";
            const opacity = isIdle ? 0 : isIn ? 1 : 0;
            const blur = isIdle ? 36 : isIn ? 0 : 24;
            const translateY = isIdle ? 48 : isIn ? 0 : -20;
            const transition = isOut
              ? `opacity ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${index * LETTER_OUT_STAGGER}ms, filter ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${index * LETTER_OUT_STAGGER}ms, transform ${LETTER_OUT_DUR}ms cubic-bezier(0.4,0,1,1) ${index * LETTER_OUT_STAGGER}ms`
              : isIn
                ? `opacity ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${index * LETTER_IN_STAGGER}ms, filter ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${index * LETTER_IN_STAGGER}ms, transform ${LETTER_IN_DUR}ms cubic-bezier(0.16,1,0.3,1) ${index * LETTER_IN_STAGGER}ms`
                : "none";

            return (
              <span
                key={`${letter}-${index}`}
                className="select-none text-5xl font-bold leading-none text-[#111111] dark:text-white sm:text-7xl md:text-8xl lg:text-9xl"
                style={{
                  opacity,
                  filter: `blur(${blur}px)`,
                  transform: `translateY(${translateY}px)`,
                  transition,
                  willChange: "opacity, filter, transform",
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
