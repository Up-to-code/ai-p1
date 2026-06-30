"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TaskCalendarSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-md flex flex-col h-[550px]">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-7 w-14 rounded-lg" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 mb-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="flex justify-center py-1.5">
            <Skeleton className="h-3 w-8" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 flex-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="rounded-lg p-1.5 min-h-[65px]">
            <Skeleton className="h-3 w-5 mb-1" />
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-3/4 rounded mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
