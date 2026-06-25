"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function LoadingCardGrid({ label }: { label: string }) {
  return (
    <div className="contents" role="status" aria-label={label}>
      {[0, 1].map((item) => (
        <div key={item} className="rounded-2xl border border-border bg-card p-4.5">
          <div className="flex h-full flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-40 max-w-full rounded-full" />
              </div>
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <Skeleton className="h-16 rounded-xl" />
              <Skeleton className="h-16 rounded-xl" />
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
