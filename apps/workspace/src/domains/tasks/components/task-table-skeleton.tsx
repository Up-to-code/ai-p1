"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function TaskTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <div className="flex-1 overflow-hidden px-4">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["", "#", "Name", "Assignee", "Status", "Due date", "Priority"].map((h, i) => (
                <th key={i} className="px-2 py-3">
                  <Skeleton className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className="border-b border-border/50">
                {Array.from({ length: 7 }).map((_, j) => (
                  <td key={j} className="px-2 py-3">
                    <Skeleton className={`h-4 ${j === 0 ? "w-4" : j === 1 ? "w-6" : j === 2 ? "w-40" : "w-20"}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
