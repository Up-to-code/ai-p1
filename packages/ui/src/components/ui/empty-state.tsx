"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@qentrah/platform-core/classnames";

export type EmptyStateSize = "sm" | "md" | "lg";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  size?: EmptyStateSize;
  action?: ReactNode;
  children?: ReactNode;
  className?: string;
}

const SIZE_PADDING: Record<EmptyStateSize, string> = {
  sm: "p-6 min-h-[120px]",
  md: "p-8 min-h-[200px]",
  lg: "p-10 min-h-[256px]",
};

const ICON_SIZE: Record<EmptyStateSize, string> = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const TITLE_SIZE: Record<EmptyStateSize, string> = {
  sm: "text-[11px] font-semibold",
  md: "text-sm font-semibold",
  lg: "text-base font-semibold",
};

const DESC_SIZE: Record<EmptyStateSize, string> = {
  sm: "text-[10px]",
  md: "text-xs",
  lg: "text-sm",
};

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, size = "md", action, children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border",
          SIZE_PADDING[size],
          className,
        )}
      >
        {icon && (
          <div className={cn("text-muted-foreground/60 mb-2", ICON_SIZE[size])} aria-hidden>
            {icon}
          </div>
        )}
        <p className={cn("text-foreground", TITLE_SIZE[size])}>{title}</p>
        {description && (
          <p className={cn("mt-1 text-muted-foreground max-w-md", DESC_SIZE[size])}>{description}</p>
        )}
        {action && <div className="mt-3">{action}</div>}
        {children}
      </div>
    );
  }
);
EmptyState.displayName = "EmptyState";
