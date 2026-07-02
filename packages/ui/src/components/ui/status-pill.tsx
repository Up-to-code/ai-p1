"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export type StatusPillTone = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusPillProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  tone?: StatusPillTone;
  label: ReactNode;
  icon?: ReactNode;
  size?: "sm" | "md";
  variant?: "soft" | "solid" | "outline";
}

const TONE_SOFT: Record<StatusPillTone, string> = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300/90 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-200/90 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-700 dark:text-rose-300/90 border-rose-500/20",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-300/90 border-sky-500/20",
  neutral: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300/90 border-zinc-500/20",
};

const TONE_SOLID: Record<StatusPillTone, string> = {
  success: "bg-emerald-500 text-white border-emerald-500",
  warning: "bg-amber-500 text-white border-amber-500",
  danger: "bg-rose-500 text-white border-rose-500",
  info: "bg-sky-500 text-white border-sky-500",
  neutral: "bg-zinc-500 text-white border-zinc-500",
};

const TONE_OUTLINE: Record<StatusPillTone, string> = {
  success: "border-emerald-500 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500 text-amber-700 dark:text-amber-300",
  danger: "border-rose-500 text-rose-700 dark:text-rose-300",
  info: "border-sky-500 text-sky-700 dark:text-sky-300",
  neutral: "border-zinc-500 text-zinc-700 dark:text-zinc-300",
};

const TONE_MAP = { soft: TONE_SOFT, solid: TONE_SOLID, outline: TONE_OUTLINE };

const SIZE_CLASS = {
  sm: "px-2 py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-[11px]",
};

export const StatusPill = forwardRef<HTMLSpanElement, StatusPillProps>(
  ({ tone = "neutral", label, icon, size = "md", variant = "soft", className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border font-semibold uppercase tracking-wider whitespace-nowrap",
          SIZE_CLASS[size],
          TONE_MAP[variant][tone],
          className,
        )}
        {...props}
      >
        {icon}
        {label}
      </span>
    );
  }
);
StatusPill.displayName = "StatusPill";
