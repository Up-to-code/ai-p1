"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TaskTimelineSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-md flex flex-col h-[550px]">
      <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex-1 space-y-1.5 pr-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-48 shrink-0">
              <Skeleton className="h-3 w-36 mb-1" />
              <Skeleton className="h-2 w-20" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-6 w-full rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
