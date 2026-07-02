"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export type FilterChipSize = "sm" | "md" | "lg";

export interface FilterChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  size?: FilterChipSize;
  count?: number;
  children?: ReactNode;
}

const SIZE_CLASS: Record<FilterChipSize, string> = {
  sm: "px-2.5 py-1 text-[10px]",
  md: "px-3.5 py-1.5 text-[11px]",
  lg: "px-5 py-2 text-[11px]",
};

export const FilterChip = forwardRef<HTMLButtonElement, FilterChipProps>(
  ({ active = false, size = "md", count, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-lg border font-bold tracking-wide transition-all",
          SIZE_CLASS[size],
          active
            ? "border-foreground bg-foreground text-background shadow-sm"
            : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:bg-muted/20 hover:text-foreground",
          className,
        )}
        {...props}
      >
        {children}
        {count !== undefined && (
          <span
            className={cn(
              "rounded-full px-1.5 text-[9px] font-bold",
              active ? "bg-background/20 text-background" : "bg-muted text-muted-foreground",
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  }
);
FilterChip.displayName = "FilterChip";

export interface FilterChipBarProps {
  chips: Array<{ key: string; label: string; count?: number }>;
  activeKey: string;
  onChange: (key: string) => void;
  size?: FilterChipSize;
  className?: string;
}

export function FilterChipBar({ chips, activeKey, onChange, size = "md", className }: FilterChipBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)} role="group">
      {chips.map((chip) => (
        <FilterChip
          key={chip.key}
          active={activeKey === chip.key}
          onClick={() => onChange(chip.key)}
          size={size}
          count={chip.count}
        >
          {chip.label}
        </FilterChip>
      ))}
    </div>
  );
}
