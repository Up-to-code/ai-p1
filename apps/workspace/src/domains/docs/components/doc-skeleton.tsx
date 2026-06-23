"use client";

import { cn } from "@/lib/utils";
import type { DocViewMode } from "../docs.constants";

export function DocSkeleton({ viewMode }: { viewMode: DocViewMode }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {/* Folder skeletons */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={`folder-${i}`}
            className="rounded-xl border border-border p-4 animate-pulse"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          </div>
        ))}
        {/* Doc skeletons */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={`doc-${i}`}
            className="rounded-xl border border-border p-4 animate-pulse"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="h-9 w-9 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-2/3 rounded bg-muted" />
                <div className="h-2 w-1/3 rounded bg-muted" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded bg-muted" />
              <div className="h-2 w-4/5 rounded bg-muted" />
              <div className="h-2 w-3/5 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="h-10 bg-muted/30 border-b border-border" />
      {/* Folder skeletons */}
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={`folder-${i}`}
          className="flex items-center gap-3 px-4 py-3 border-b border-border animate-pulse"
        >
          <div className="h-4 w-4 rounded bg-primary/20" />
          <div className="h-3 w-24 rounded bg-primary/10" />
        </div>
      ))}
      {/* Doc skeletons */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`doc-${i}`}
          className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 animate-pulse"
        >
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
          <div className="flex-1" />
          <div className="h-3 w-16 rounded bg-muted hidden sm:block" />
          <div className="h-5 w-8 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
