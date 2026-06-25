import { Skeleton } from "@/components/ui/skeleton";
import type { UsageTab } from "../config/usage-tabs.config";

export function UsageLoadingSkeleton({ activeTab, label }: { activeTab: UsageTab; label: string }) {
  if (activeTab === "payments") {
    return (
      <div
        className="max-w-5xl overflow-hidden rounded-2xl border border-border bg-white dark:border-white/[0.06] dark:bg-[#111]"
        role="status"
        aria-label={label}
      >
        <div className="flex items-center gap-10 border-b border-border bg-muted/50 px-5 py-3 dark:border-white/5 dark:bg-white/[0.02]">
          {[0, 1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-3 w-20 rounded-full" />
          ))}
        </div>
        <div className="divide-y divide-border dark:divide-white/[0.04]">
          {[0, 1, 2, 3].map((row) => (
            <div
              key={row}
              className="grid grid-cols-[1fr_0.8fr_1.5fr_0.7fr_0.6fr] items-center gap-6 px-5 py-4"
            >
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-40 rounded-full" />
              <Skeleton className="h-4 w-16 justify-self-end rounded-full" />
              <Skeleton className="h-6 w-20 justify-self-end rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6" role="status" aria-label={label}>
      <div className="rounded-2xl border border-border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-6 w-52 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-full" />
            <Skeleton className="h-3 w-36 rounded-full" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-white p-6 dark:border-white/[0.06] dark:bg-[#111]">
        <div className="space-y-7">
          {[0, 1].map((item) => (
            <div key={item}>
              <div className="flex items-baseline justify-between gap-4">
                <Skeleton className="h-3 w-36 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-3 rounded-full" />
              <Skeleton className="mt-3 h-7 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-9 w-28 rounded-xl" />
    </div>
  );
}
