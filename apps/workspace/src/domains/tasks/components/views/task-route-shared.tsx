"use client";

import type { ReactNode } from "react";
import {
  EmptyWorkspace,
  ErrorState,
  LoadingState,
  WorkspaceQueryState,
} from "@/components/shared/crud-ui";
import { ListChecks, SearchX } from "lucide-react";
import { useTaskWorkspace } from "../task-workspace-provider";

export function TaskRouteState({ children }: { children: ReactNode }) {
  const { state } = useTaskWorkspace();
  if (state.status === "ready") return <>{children}</>;
  let content: ReactNode;
  if (state.status === "loading") content = <LoadingState variant="table" />;
  else if (state.status === "error") content = <ErrorState title="Tasks could not be loaded" description={state.message ?? "Try again."} />;
  else if (state.status === "empty") content = <EmptyWorkspace icon={ListChecks} title="No tasks yet" description="Create a task to start planning work." />;
  else if (state.status === "filteredEmpty") content = <EmptyWorkspace icon={SearchX} title="No matching tasks" description="Change the active filter to see more tasks." />;
  else content = <WorkspaceQueryState status={state.status} variant="table" />;
  return (
    <div className="flex h-full items-center justify-center">
      {content}
    </div>
  );
}

export function TaskRoutePagination() {
  const { tasks, canLoadMore, isLoadingMore, loadMore } = useTaskWorkspace();
  if (!canLoadMore && !isLoadingMore) return null;
  return (
    <div className="flex h-10 shrink-0 items-center justify-between border-t border-border bg-background px-4 text-xs text-muted-foreground">
      <span>{tasks.length} tasks loaded</span>
      <button
        type="button"
        disabled={isLoadingMore}
        onClick={loadMore}
        className="h-7 rounded-md bg-[var(--q-sidebar)] px-3 font-medium text-foreground disabled:opacity-40"
      >
        {isLoadingMore ? "Loading…" : "Load more"}
      </button>
    </div>
  );
}
