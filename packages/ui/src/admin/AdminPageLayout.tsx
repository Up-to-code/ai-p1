import type { CSSProperties, ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

export type AdminPageLayoutVariant = "dashboard" | "analytics" | "list" | "detail" | "form";

type AdminPageLayoutProps = {
  main: ReactNode;
  rail?: ReactNode;
  variant?: AdminPageLayoutVariant;
  className?: string;
  mainClassName?: string;
  railClassName?: string;
  railSticky?: boolean;
  railScroll?: boolean;
  contentWidth?: "full" | "contained";
  railBehavior?: "sticky" | "static";
  stickyRailTopClassName?: string;
  stickyRailMaxHeightClassName?: string;
};

type AdminMetricGridProps = {
  children: ReactNode;
  className?: string;
  minItemWidth?: number;
};

type AdminSectionStackProps = {
  children: ReactNode;
  className?: string;
};

const layoutVariantClasses: Record<AdminPageLayoutVariant, string> = {
  dashboard: "xl:grid-cols-[minmax(0,1.9fr)_minmax(280px,340px)]",
  analytics: "xl:grid-cols-[minmax(0,1.75fr)_minmax(280px,336px)]",
  list: "xl:grid-cols-[minmax(0,1.85fr)_minmax(260px,320px)]",
  detail: "xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,360px)]",
  form: "xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,360px)]",
};

/**
 * WHY:   Admin pages need one grid-first composition contract so dashboard, detail, and form surfaces behave consistently with fixed chrome.
 * WHAT:  Arranges a main canvas and an optional right rail with sticky and local-scroll behavior tuned for desktop dashboards.
 * HOW:   Uses measured `minmax()` grid tracks on large screens while keeping mobile stacked and allowing the rail to pin under the sticky header.
 */
export default function AdminPageLayout({
  main,
  rail,
  variant = "detail",
  className,
  mainClassName,
  railClassName,
  railSticky = true,
  railScroll = true,
  contentWidth,
  railBehavior,
  stickyRailTopClassName = "xl:top-[5.5rem]",
  stickyRailMaxHeightClassName = "xl:max-h-[calc(100dvh-5.5rem)]",
}: AdminPageLayoutProps) {
  const resolvedContentWidth = contentWidth ?? (variant === "dashboard" || variant === "analytics" ? "full" : "contained");
  const resolvedRailBehavior = railBehavior ?? (variant === "dashboard" || variant === "analytics" ? "sticky" : "static");
  const stickyRail = railSticky && resolvedRailBehavior === "sticky";
  const widthClassName =
    resolvedContentWidth === "full" ? "w-full" : "mx-auto w-full max-w-[1420px]";

  if (!rail) {
    return (
      <div className={cn("grid min-w-0 max-w-full content-start gap-4 xl:gap-[1.125rem]", widthClassName, className)}>
        {main}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid min-w-0 max-w-full items-start gap-4 xl:gap-4",
        widthClassName,
        layoutVariantClasses[variant],
        className,
      )}
    >
      <div className={cn("grid min-w-0 content-start gap-4 xl:gap-4", mainClassName)}>{main}</div>
      <aside
        className={cn(
          "grid min-w-0 content-start gap-4 xl:gap-4",
          stickyRail && stickyRailTopClassName,
          stickyRail && railScroll && stickyRailMaxHeightClassName,
          stickyRail && railScroll && "xl:overflow-y-auto xl:pr-1",
          railClassName,
        )}
      >
        {rail}
      </aside>
    </div>
  );
}

/**
 * WHY:   KPI cards and small insight blocks should wrap gracefully without every page hand-authoring grid math.
 * WHAT:  Renders an auto-fit metric grid with a configurable minimum cell width.
 * HOW:   Uses a CSS variable-backed `repeat(auto-fit, minmax())` template so panels stay stable with long Arabic labels and wide screens.
 */
export function AdminMetricGrid({ children, className, minItemWidth = 240 }: AdminMetricGridProps) {
  return (
    <div
      className={cn(
        "grid min-w-0 max-w-full gap-4 [grid-template-columns:repeat(auto-fit,minmax(var(--admin-metric-min),1fr))]",
        className,
      )}
      style={{ "--admin-metric-min": `${minItemWidth}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}

/**
 * WHY:   Page sections need a default vertical rhythm that stays grid-based instead of relying on ad-hoc flex stacks.
 * WHAT:  Provides a simple content stack for grouping panels and sections.
 * HOW:   Uses a one-column grid with consistent gaps so nested layouts remain predictable inside larger canvases.
 */
export function AdminSectionStack({ children, className }: AdminSectionStackProps) {
  return <div className={cn("grid min-w-0 max-w-full content-start gap-4 xl:gap-4", className)}>{children}</div>;
}
