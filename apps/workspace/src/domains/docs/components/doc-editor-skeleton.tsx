"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function DocEditorSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border px-6 py-4 shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-6 w-64 rounded-md" />
      </div>
      <div className="flex-1 overflow-hidden px-6 py-4">
        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-5/6 rounded" />
            <Skeleton className="h-4 w-4/6 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
