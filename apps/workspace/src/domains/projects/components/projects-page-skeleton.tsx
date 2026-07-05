"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProjectsPageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-10 w-32 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
