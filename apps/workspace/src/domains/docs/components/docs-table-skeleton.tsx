"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DocsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border shrink-0">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
      <div className="flex-1 overflow-auto px-6">
        <div className="flex flex-col gap-2 py-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center border-b border-border/50 pb-3">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-40 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
