"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const AI_GRADIENT =
  "conic-gradient(from var(--angle,0deg),#0C7DF3 0deg,#45C5F9 48deg,#3446EC 95deg,#834DF1 145deg,#DF3FDD 190deg,#F2488B 238deg,#F9724F 292deg,#EBA7E7 330deg,#0C7DF3 360deg) border-box";

export function AskAiButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  const elRef = useRef<HTMLButtonElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  const start = () => {
    if (disabled) return;
    const el = elRef.current;
    if (!el) return;
    ctxRef.current?.revert();
    ctxRef.current = gsap.context(() =>
      gsap.to(el, { "--angle": "360deg", duration: 2.8, ease: "none", repeat: -1 }),
    );
  };
  const stop = () => {
    ctxRef.current?.revert();
    ctxRef.current = null;
    if (elRef.current) gsap.set(elRef.current, { "--angle": "0deg" });
  };
  useEffect(() => () => { ctxRef.current?.revert(); }, []);

  return (
    <button
      ref={elRef}
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={start}
      onMouseLeave={stop}
      className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition-opacity disabled:pointer-events-none disabled:opacity-35"
      style={{
        background: `linear-gradient(var(--card),var(--card)) padding-box,${AI_GRADIENT}`,
        border: "1.5px solid transparent",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ai/logo.png" alt="" width={14} height={14} className="h-[14px] w-[14px] object-contain" />
      <span className="text-text-primary">Ask AI</span>
    </button>
  );
}
