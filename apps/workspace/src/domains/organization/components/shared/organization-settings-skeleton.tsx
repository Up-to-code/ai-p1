"use client";

import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationSettingsSkeleton({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <div className="min-h-screen bg-muted/50" aria-busy="true">
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Skeleton className="h-24 w-24 shrink-0 rounded-[28px]" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>{label}</span>
              </div>
              <Skeleton className="h-7 w-64 max-w-full rounded-xl" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-5 w-28 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-11 w-28 rounded-[22px]" />
          </div>
          <div className="mt-8 flex gap-2">
            <Skeleton className="h-10 w-28 rounded-t-xl" />
            <Skeleton className="h-10 w-28 rounded-t-xl" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-3 w-60 rounded-full" />
          </div>
          {compact ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_260px_auto]">
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
                <Skeleton className="h-11 rounded-xl" />
              </div>
              <div className="mt-5 space-y-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 rounded-xl" />
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-24 rounded-2xl" />
                ))}
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 rounded-2xl" />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
