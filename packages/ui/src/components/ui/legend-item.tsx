"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export interface LegendItemProps extends HTMLAttributes<HTMLDivElement> {
  color: string;
  label: ReactNode;
  value?: ReactNode;
  icon?: ReactNode;
  size?: "sm" | "md";
}

export const LegendItem = forwardRef<HTMLDivElement, LegendItemProps>(
  ({ color, label, value, icon, size = "sm", className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5",
          size === "sm" ? "text-[10px]" : "text-xs",
          className,
        )}
        {...props}
      >
        {icon ?? (
          <span
            aria-hidden
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />
        )}
        <span className="font-semibold text-muted-foreground">{label}</span>
        {value !== undefined && (
          <span className="font-bold text-foreground">{value}</span>
        )}
      </div>
    );
  }
);
LegendItem.displayName = "LegendItem";
