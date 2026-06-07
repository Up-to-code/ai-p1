import type { TaskFormValues, TaskRecord, TaskStatus } from "./tasks.types";

export const taskBoardStatuses = ["todo", "inProgress", "waiting", "done"] as const satisfies TaskStatus[];

export type PipelineOrderTask = {
  id: string;
  pipelineOrder?: number;
  updatedAt?: number;
};

function taskPipelineOrder(task: PipelineOrderTask, fallbackIndex: number) {
  return typeof task.pipelineOrder === "number" ? task.pipelineOrder : fallbackIndex + 1;
}

export function sortPipelineTasks<TTask extends PipelineOrderTask>(tasks: TTask[]) {
  return tasks
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const leftOrder = taskPipelineOrder(left.task, left.index);
      const rightOrder = taskPipelineOrder(right.task, right.index);
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return (right.task.updatedAt ?? 0) - (left.task.updatedAt ?? 0);
    })
    .map(({ task }) => task);
}

export function nextTaskPipelineOrder(statusTasks: PipelineOrderTask[], movingTaskId: string, targetIndex: number) {
  const ordered = sortPipelineTasks(statusTasks).filter((task) => task.id !== movingTaskId);
  const boundedIndex = Math.max(0, Math.min(targetIndex, ordered.length));
  const previous = ordered[boundedIndex - 1];
  const next = ordered[boundedIndex];

  if (!previous && !next) return 1;
  if (!previous) return taskPipelineOrder(next, 0) - 1;
  if (!next) return taskPipelineOrder(previous, boundedIndex - 1) + 1;
  return (taskPipelineOrder(previous, boundedIndex - 1) + taskPipelineOrder(next, boundedIndex)) / 2;
}

export function taskFormValuesForPipeline(task: TaskRecord, status: TaskStatus, pipelineOrder: number): TaskFormValues {
  return {
    title: task.title,
    status,
    pipelineOrder,
    priority: task.priority,
    visibility: task.visibility ?? "team",
    assigneeUserId: task.assigneeUserId ?? "",
    clientId: task.clientId ?? "",
    projectId: task.projectId ?? "",
    dueDate: task.dueDate ?? "",
    description: task.description ?? "",
    tags: (task.tags ?? []).join(", "),
  };
}
