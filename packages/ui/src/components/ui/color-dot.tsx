"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export type ColorDotSize = "xs" | "sm" | "md" | "lg";

export interface ColorDotProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  color?: string;
  dotClassName?: string;
  size?: ColorDotSize;
  ring?: boolean;
  label?: string;
}

const SIZE_CLASS: Record<ColorDotSize, string> = {
  xs: "w-1.5 h-1.5",
  sm: "w-2 h-2",
  md: "w-2.5 h-2.5",
  lg: "w-3 h-3",
};

export const ColorDot = forwardRef<HTMLSpanElement, ColorDotProps>(
  ({ color, dotClassName, size = "sm", ring = false, label, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center gap-2", className)}
        {...props}
      >
        <span
          aria-hidden={!label}
          className={cn(
            "inline-block rounded-full flex-shrink-0",
            SIZE_CLASS[size],
            dotClassName,
            !dotClassName && ring && "ring-1 ring-offset-1 ring-offset-background",
          )}
          style={
            dotClassName
              ? undefined
              : {
                  backgroundColor: color,
                  ...(ring ? { boxShadow: `0 0 0 1px ${color}` } : {}),
                }
          }
        />
        {label && <span className="text-[13px] text-foreground">{label}</span>}
      </span>
    );
  }
);
ColorDot.displayName = "ColorDot";
