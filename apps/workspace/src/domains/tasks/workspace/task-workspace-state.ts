import type { WorkspaceStatus } from "@/domains/auth";

/** The mutually exclusive states a Task route must render. */
export type TaskWorkspaceState =
  | { status: Exclude<WorkspaceStatus, "ready"> }
  | { status: "loading" }
  | { status: "error"; message?: string }
  | { status: "empty" }
  | { status: "filteredEmpty" }
  | { status: "ready" };

/**
 * Keeps authentication, reactive-query, and presentation emptiness distinct.
 * A filtered empty result is not the same domain state as an empty workspace.
 */
export function resolveTaskWorkspaceState(input: {
  workspaceStatus: WorkspaceStatus;
  queryLoading: boolean;
  queryError?: string;
  sourceCount: number;
  visibleCount: number;
  hasActiveFilter: boolean;
  hasMore: boolean;
}): TaskWorkspaceState {
  if (input.workspaceStatus !== "ready") {
    return { status: input.workspaceStatus };
  }
  if (input.queryLoading) return { status: "loading" };
  if (input.queryError) return { status: "error", message: input.queryError };
  if (input.sourceCount === 0 && !input.hasMore) return { status: "empty" };
  if (input.visibleCount === 0 && input.hasActiveFilter) {
    return { status: "filteredEmpty" };
  }
  return { status: "ready" };
}
