"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export type ColorSwatchSize = "xs" | "sm" | "md" | "lg";

export interface ColorSwatchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  color: string;
  selected?: boolean;
  size?: ColorSwatchSize;
  ariaLabel?: string;
}

const SIZE_CLASS: Record<ColorSwatchSize, string> = {
  xs: "h-4 w-4",
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-8 w-8",
};

export const ColorSwatch = forwardRef<HTMLButtonElement, ColorSwatchProps>(
  ({ color, selected = false, size = "md", ariaLabel, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={selected}
        aria-label={ariaLabel ?? `Color ${color}`}
        className={cn(
          "rounded-full border-2 transition-all",
          SIZE_CLASS[size],
          selected
            ? "border-foreground scale-110"
            : "border-transparent hover:scale-105",
          className,
        )}
        style={{ backgroundColor: color }}
        {...props}
      />
    );
  }
);
ColorSwatch.displayName = "ColorSwatch";
