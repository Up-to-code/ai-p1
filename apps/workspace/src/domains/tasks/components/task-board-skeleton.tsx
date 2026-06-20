"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { taskBoardStatuses } from "../task-pipeline-order";

export function TaskBoardSkeleton() {
  return (
    <div className="flex gap-4">
      {taskBoardStatuses.map((status) => (
        <div
          key={status}
          className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-border"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
          <div className="flex flex-col gap-2 p-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
