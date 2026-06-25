"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageShellProps {
  /** The sticky toolbar — use <PageToolbar /> */
  toolbar: ReactNode;
  /** Page content — rendered in a flex-1 overflow-auto full-width container */
  children: ReactNode;
  className?: string;
  /** Extra class applied to the scrollable content wrapper */
  contentClassName?: string;
}

/**
 * PageShell
 *
 * Standard full-height layout wrapper used by every domain screen.
 * Renders a sticky toolbar at the top with zero gap, then a
 * full-width, vertically scrollable content area below.
 */
export function PageShell({
  toolbar,
  children,
  className,
  contentClassName,
}: PageShellProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden bg-background",
        className,
      )}
    >
      {toolbar}
      <div
        className={cn(
          "flex-1 w-full overflow-auto",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
