"use client";

import { Skeleton } from "@/components/ui/skeleton";

const GROUPS = ["todo", "inProgress", "waiting", "done"];
const TASKS_PER_GROUP = [3, 2, 1, 2];

export function TaskListSkeleton() {
  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
      {GROUPS.map((group, gi) => (
        <div key={group} className="space-y-1 bg-card rounded-2xl border border-border/80 p-3 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-4 w-6 rounded-full" />
          </div>
          <div className="pt-2 space-y-1">
            {Array.from({ length: TASKS_PER_GROUP[gi] }).map((_, ti) => (
              <div key={ti} className="flex items-center justify-between py-2.5">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
