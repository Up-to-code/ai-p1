export type TaskBulkAction = "complete" | "delete";
export type TaskBulkFailureReason = "not_found" | "forbidden";

export interface TaskBulkOutcome {
  taskId: string;
  status: "succeeded" | "failed";
  reason?: TaskBulkFailureReason;
}

export interface TaskBulkResult {
  action: TaskBulkAction;
  requested: number;
  succeeded: number;
  failed: number;
  outcomes: TaskBulkOutcome[];
}

export type TaskBulkCommand = (
  action: TaskBulkAction,
  taskIds: string[],
) => Promise<TaskBulkResult>;
