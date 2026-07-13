import type { TaskFormValues, TaskRecord, TaskStatus } from "./tasks.types";
import { defaultTaskVisibility } from "./task-visibility";

export const taskBoardStatuses = [
  "todo",
  "inProgress",
  "waiting",
  "done",
] as const satisfies TaskStatus[];

export type PipelineOrderTask = {
  id: string;
  pipelineOrder?: number;
  updatedAt?: number;
};

function taskPipelineOrder(task: PipelineOrderTask, fallbackIndex: number) {
  return typeof task.pipelineOrder === "number"
    ? task.pipelineOrder
    : fallbackIndex + 1;
}

function pipelineTasksWithOrder<TTask extends PipelineOrderTask>(
  tasks: TTask[],
) {
  return tasks
    .map((task, index) => ({ task, order: taskPipelineOrder(task, index) }))
    .sort((left, right) => {
      if (left.order !== right.order) return left.order - right.order;
      return (right.task.updatedAt ?? 0) - (left.task.updatedAt ?? 0);
    });
}

export function sortPipelineTasks<TTask extends PipelineOrderTask>(
  tasks: TTask[],
) {
  return pipelineTasksWithOrder(tasks).map(({ task }) => task);
}

export function nextTaskPipelineOrder(
  statusTasks: PipelineOrderTask[],
  movingTaskId: string,
  targetIndex: number,
) {
  const ordered = pipelineTasksWithOrder(statusTasks).filter(
    ({ task }) => task.id !== movingTaskId,
  );
  const boundedIndex = Math.max(0, Math.min(targetIndex, ordered.length));
  const previous = ordered[boundedIndex - 1];
  const next = ordered[boundedIndex];

  if (!previous && !next) return 1;
  if (!previous) return next.order - 1;
  if (!next) return previous.order + 1;
  return (previous.order + next.order) / 2;
}

export function taskFormValuesForPipeline(
  task: TaskRecord,
  status: TaskStatus,
  pipelineOrder: number,
): TaskFormValues {
  return {
    title: task.title,
    status,
    pipelineOrder,
    priority: task.priority,
    visibility: defaultTaskVisibility(
      task.visibility,
      task.projectId,
      task.spaceId,
    ),
    assigneeUserId: task.assigneeUserId ?? "",
    assigneeUserIds:
      task.assigneeUserIds ??
      (task.assigneeUserId ? [task.assigneeUserId] : []),
    clientId: task.clientId ?? "",
    projectId: task.projectId ?? "",
    spaceId: task.spaceId ?? "",
    startDate: task.startDate ?? "",
    dueDate: task.dueDate ?? "",
    description: task.description ?? "",
    tags: (task.tags ?? []).join(", "),
  };
}
