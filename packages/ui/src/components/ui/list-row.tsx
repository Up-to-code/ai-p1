"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export type ListRowVariant = "default" | "compact" | "card";

export interface ListRowProps extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "title"> {
  leading?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  trailing?: ReactNode;
  meta?: ReactNode;
  selected?: boolean;
  variant?: ListRowVariant;
  href?: string;
  onClick?: () => void;
}

const VARIANT_CLASSES: Record<ListRowVariant, string> = {
  default: "border-b border-border hover:bg-muted/30",
  compact: "rounded-lg hover:bg-muted/40 px-2 py-1.5",
  card: "rounded-xl border border-border bg-card hover:bg-muted/20",
};

export const ListRow = forwardRef<HTMLDivElement, ListRowProps>(
  (
    { leading, title, subtitle, trailing, meta, selected, variant = "default", href, onClick, className, ...props },
    ref,
  ) => {
    const interactive = Boolean(href || onClick);
    return (
      <div
        ref={ref}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          interactive
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onClick?.();
                }
              }
            : undefined
        }
        className={cn(
          "flex items-center gap-3 px-4 py-3 transition-colors",
          VARIANT_CLASSES[variant],
          selected && "bg-primary/5",
          interactive && "cursor-pointer",
          className,
        )}
        {...props}
      >
        {leading && <div className="shrink-0">{leading}</div>}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{title}</div>
          {subtitle && (
            <div className="text-xs text-muted-foreground truncate mt-0.5">{subtitle}</div>
          )}
        </div>
        {meta && <div className="shrink-0 text-xs text-muted-foreground">{meta}</div>}
        {trailing && <div className="shrink-0">{trailing}</div>}
      </div>
    );
  }
);
ListRow.displayName = "ListRow";
