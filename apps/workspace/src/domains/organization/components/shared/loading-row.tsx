"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingRow({ label, rows = 1 }: { label: string; rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label={label}>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40 max-w-full rounded-full" />
              <Skeleton className="h-3 w-56 max-w-full rounded-full" />
            </div>
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}
