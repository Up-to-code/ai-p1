"use client";

import type { ReactNode } from "react";
import { WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useTaskWorkspace } from "../task-workspace-provider";

export function TaskRouteState({ children }: { children: ReactNode }) {
  const { workspaceStatus } = useTaskWorkspace();
  if (workspaceStatus === "ready") return <>{children}</>;
  return (
    <div className="flex h-full items-center justify-center">
      <WorkspaceQueryState status={workspaceStatus} variant="table" />
    </div>
  );
}

export function TaskRoutePagination() {
  const { tasks, page, totalPages, pageStart, pageEnd, setPage } =
    useTaskWorkspace();
  if (tasks.length <= 50) return null;
  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-t border-border bg-background px-4 text-xs text-muted-foreground">
      <span>
        Showing {pageStart}-{pageEnd} of {tasks.length}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((value) => Math.max(1, value - 1))}
          className="h-7 rounded-md bg-[var(--q-sidebar)] px-2 font-medium text-foreground disabled:opacity-40"
        >
          Previous
        </button>
        <span className="min-w-16 text-center">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          className="h-7 rounded-md bg-[var(--q-sidebar)] px-2 font-medium text-foreground disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
