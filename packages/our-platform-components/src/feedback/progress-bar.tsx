"use client";

import { cn } from "@qentrah/platform-core";

export type ProgressBarSize = "xs" | "sm" | "md" | "lg";

export interface ProgressBarProps {
  value: number;
  max?: number;
  size?: ProgressBarSize;
  color?: string;
  showLabel?: boolean;
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}

const SIZE_TRACK: Record<ProgressBarSize, string> = {
  xs: "h-0.5",
  sm: "h-1",
  md: "h-1.5",
  lg: "h-2",
};

export function ProgressBar({
  value,
  max = 100,
  size = "md",
  color,
  showLabel = false,
  className,
  trackClassName,
  fillClassName,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100;
  const pct = Math.max(0, Math.min(100, (value / safeMax) * 100));
  const fillStyle: React.CSSProperties = color
    ? { width: `${pct}%`, backgroundColor: color }
    : { width: `${pct}%` };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground mb-1">
          <span>Progress</span>
          <span>{Math.round(pct)}%</span>
        </div>
      )}
      <div
        className={cn(
          "w-full bg-muted rounded-full overflow-hidden shrink-0",
          SIZE_TRACK[size],
          trackClassName,
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            "h-full bg-primary rounded-full transition-all duration-300",
            fillClassName,
          )}
          style={fillStyle}
        />
      </div>
    </div>
  );
}
