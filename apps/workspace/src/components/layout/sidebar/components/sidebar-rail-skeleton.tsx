"use client";

import { Skeleton } from "@/components/loading-ui";

export function SidebarRailSkeleton() {
  return (
    <aside className="relative z-40 flex h-screen w-12 shrink-0 flex-col overflow-hidden bg-secondary">
      {/* Organization header skeleton */}
      <div className="flex h-14 shrink-0 items-center justify-center border-b border-sidebar-border">
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>

      {/* Static nav items skeleton */}
      <div className="flex flex-1 flex-col gap-1 p-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>

      {/* Primary nav items skeleton */}
      <div className="flex flex-1 flex-col gap-1 p-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>

      {/* Bottom nav items skeleton */}
      <div className="flex flex-col gap-1 p-2 border-t border-sidebar-border">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </aside>
  );
}
