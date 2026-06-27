"use client";

import { AppPageShell } from "@/components/shared";
import { Skeleton } from "@/components/ui/skeleton";

export function IntegrationDetailSkeleton() {
  return (
    <AppPageShell maxWidth="full">
      <div className="space-y-6">
        <div className="flex items-center justify-between animate-pulse">
          <Skeleton className="h-9 w-20 rounded-[10px] bg-muted dark:bg-white/[0.06]" />
          <Skeleton className="h-9 w-28 rounded-[10px] bg-muted dark:bg-white/[0.06]" />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 animate-pulse">
          <Skeleton className="h-24 w-24 sm:h-28 sm:w-28 rounded-[22%] shrink-0 bg-muted dark:bg-white/[0.06]" />
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-7 w-48 sm:h-8 sm:w-64 rounded-lg bg-muted dark:bg-white/[0.06]" />
            <Skeleton className="h-4 w-36 rounded bg-muted dark:bg-white/[0.06]" />
            <Skeleton className="h-7 w-24 rounded-[12px] bg-muted dark:bg-white/[0.06]" />
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-4 gap-x-2 py-5 border-t border-b border-border dark:border-white/[0.04] animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center justify-between min-h-[52px] border-e border-border dark:border-white/[0.04] last:border-0 px-2 space-y-2">
              <Skeleton className="h-2.5 w-12 rounded bg-muted dark:bg-white/[0.06]" />
              <Skeleton className="h-6 w-16 rounded bg-muted dark:bg-white/[0.06]" />
              <Skeleton className="h-3 w-14 rounded bg-muted dark:bg-white/[0.06]" />
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-0 divide-y divide-border dark:divide-white/[0.04]">
            <div className="py-6 space-y-4 animate-pulse">
              <Skeleton className="h-4 w-20 rounded bg-muted dark:bg-white/[0.06]" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full rounded bg-muted dark:bg-white/[0.06]" />
                <Skeleton className="h-3 w-full rounded bg-muted dark:bg-white/[0.06]" />
                <Skeleton className="h-3 w-3/4 rounded bg-muted dark:bg-white/[0.06]" />
              </div>
            </div>
            <div className="py-6 space-y-4 animate-pulse">
              <Skeleton className="h-4 w-24 rounded bg-muted dark:bg-white/[0.06]" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="flex gap-3 p-4 border border-border/80 bg-white rounded-[12px] dark:border-white/[0.06] dark:bg-white/[0.02]">
                    <Skeleton className="h-6 w-6 rounded-full shrink-0 bg-muted dark:bg-white/[0.06]" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4.5 w-32 rounded bg-muted dark:bg-white/[0.06]" />
                      <Skeleton className="h-3.5 w-full rounded bg-muted dark:bg-white/[0.06]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 xl:pt-6 animate-pulse">
            <div className="rounded-[12px] border border-border/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] space-y-4">
              <Skeleton className="h-4 w-24 rounded bg-muted dark:bg-white/[0.06]" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((k) => (
                  <div key={k} className="flex justify-between items-center py-2 border-b border-border last:border-0 dark:border-white/[0.04]">
                    <Skeleton className="h-3 w-16 rounded bg-muted dark:bg-white/[0.06]" />
                    <Skeleton className="h-3 w-24 rounded bg-muted dark:bg-white/[0.06]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppPageShell>
  );
}
