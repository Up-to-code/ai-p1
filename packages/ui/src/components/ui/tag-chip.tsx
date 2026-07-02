"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export type TagChipTone = "gray" | "blue" | "green" | "amber" | "red" | "purple" | "pink" | "cyan" | "custom";

export interface TagChipProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  tone?: TagChipTone;
  label: ReactNode;
  size?: "sm" | "md";
  outline?: boolean;
  customBg?: string;
  customColor?: string;
  removable?: boolean;
  onRemove?: () => void;
  icon?: ReactNode;
}

const TONE_SOLID: Record<TagChipTone, string> = {
  gray: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/20",
  blue: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/20",
  green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/20",
  red: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/20",
  purple: "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/20",
  pink: "bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/20",
  cyan: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/20",
  custom: "",
};

const SIZE_CLASS = {
  sm: "px-1.5 py-0.5 text-[9px]",
  md: "px-2 py-0.5 text-[10px]",
};

export const TagChip = forwardRef<HTMLSpanElement, TagChipProps>(
  (
    { tone = "gray", label, size = "md", outline = false, customBg, customColor, removable, onRemove, icon, className, ...props },
    ref,
  ) => {
    const style: React.CSSProperties = tone === "custom"
      ? { backgroundColor: customBg, color: customColor }
      : {};

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border font-semibold whitespace-nowrap",
          SIZE_CLASS[size],
          tone === "custom" ? "border-transparent" : TONE_SOLID[tone],
          outline && "bg-transparent",
          className,
        )}
        style={style}
        {...props}
      >
        {icon}
        {label}
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            aria-label="Remove tag"
            className="ml-0.5 inline-flex items-center justify-center h-3 w-3 rounded-sm hover:bg-black/10 dark:hover:bg-white/10"
          >
            <svg viewBox="0 0 12 12" className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M3 3 L9 9 M9 3 L3 9" />
            </svg>
          </button>
        )}
      </span>
    );
  }
);
TagChip.displayName = "TagChip";
