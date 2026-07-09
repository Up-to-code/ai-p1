"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const AI_GRADIENT =
  "conic-gradient(from var(--angle,0deg),#0C7DF3 0deg,#45C5F9 48deg,#3446EC 95deg,#834DF1 145deg,#DF3FDD 190deg,#F2488B 238deg,#F9724F 292deg,#EBA7E7 330deg,#0C7DF3 360deg) border-box";

export function AiChatsPill({ onClick }: { onClick: () => void }) {
  const elRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  const start = () => {
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
    <div
      ref={elRef}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={start}
      onMouseLeave={stop}
      title="Open AI Chats"
      className="group relative flex h-5 cursor-pointer select-none items-center gap-1 rounded-full px-2 focus-visible:outline-none"
      style={{
        background: `linear-gradient(var(--background),var(--background)) padding-box,${AI_GRADIENT}`,
        border: "1.5px solid transparent",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/ai/logo.png"
        alt=""
        width={15}
        height={15}
        className="h-3.5 w-3.5 shrink-0 object-contain transition-transform duration-200 group-hover:scale-110"
      />
      <span className="hidden text-[11px] font-medium text-text-muted transition-colors group-hover:text-text-primary sm:inline">
        AI Chats
      </span>
    </div>
  );
}
