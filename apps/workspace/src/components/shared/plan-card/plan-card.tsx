"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, Play } from "lucide-react";

export type PlanCardProps = {
  children: ReactNode;
  onImplement: () => void;
  isImplementing?: boolean;
  defaultExpanded?: boolean;
  className?: string;
};

export function PlanCard({
  children,
  onImplement,
  isImplementing = false,
  defaultExpanded = false,
  className,
}: PlanCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-primary/20 bg-primary/[0.03] overflow-hidden transition-all",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-primary/[0.02]"
      >
        <span className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-primary">
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          Plan
        </span>
        {!expanded && (
          <span className="text-[11px] font-medium text-text-muted">
            Click to expand
          </span>
        )}
      </button>

      {expanded && (
        <div className="border-t border-primary/10 px-4 py-3">
          <div className="text-sm leading-relaxed text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {children}
          </div>
        </div>
      )}

      {expanded && (
        <div className="border-t border-primary/10 px-4 py-3">
          <button
            type="button"
            onClick={onImplement}
            disabled={isImplementing}
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-black uppercase tracking-widest text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
          >
            {isImplementing ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Implementing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="h-3 w-3 fill-current" />
                Implement
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
