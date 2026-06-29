"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { getViewMeta, type ViewMeta, type ViewType } from "./view-catalog";

interface ViewIconProps {
  type: ViewType | string;
  catalog?: readonly ViewMeta[];
  size?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Renders a view icon by type using the ClickUp SVGs from
 * `/public/icons/clickup/`. Icons are applied as a `mask-image`
 * so the parent's `color` (or the `style.color` override) drives
 * the icon fill — keeping it consistent with the theme tokens.
 */
export function ViewIcon({
  type,
  catalog,
  size = 14,
  className,
  style,
}: ViewIconProps) {
  const meta = getViewMeta(type, catalog);
  const iconPath = meta?.iconPath ?? "/icons/clickup/menu.svg";
  const color = meta?.color ?? "currentColor";

  return (
    <span
      role="img"
      aria-label={meta?.label ?? type}
      className={cn("inline-block shrink-0", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: `url(${iconPath})`,
        maskImage: `url(${iconPath})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        ...style,
      }}
    />
  );
}
