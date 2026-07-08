"use client";

import { useCallback } from "react";
import { TaskBoardSkeleton } from "@/domains/tasks/components/task-board-skeleton";
import { useTasksQuery } from "@/domains/tasks/api/tasks";
import { TaskBoardView as SharedTaskBoardView } from "@/domains/tasks/components/views/task-board-view";
import { useTaskMutations } from "@/domains/tasks/hooks/use-task-mutations";
import type { TaskStatus } from "@/domains/tasks/tasks.types";

const PROJECT_TASK_STAGES = [
  { key: "todo", name: "To Do", color: "#6b7280", order: 0 },
  { key: "inProgress", name: "In Progress", color: "#3b82f6", order: 1 },
  { key: "waiting", name: "Waiting", color: "#f59e0b", order: 2 },
  { key: "done", name: "Done", color: "#22c55e", order: 3 },
  { key: "canceled", name: "Canceled", color: "#ef4444", order: 4 },
];

export function TaskBoardView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];
  const { moveTask } = useTaskMutations(organizationId);

  const handleCardMove = useCallback(
    (itemId: string, _fromStage: string, toStage: string, targetIndex: number) => {
      const task = tasks.find((candidate) => candidate.id === itemId);
      if (!task) return;
      const nextStatus = toStage as TaskStatus;
      const statusTasks = tasks.filter((candidate) => candidate.status === nextStatus);
      moveTask(task, nextStatus, statusTasks, targetIndex);
    },
    [moveTask, tasks],
  );

  if (tasksResult.data === undefined) return <TaskBoardSkeleton />;

  return (
    <SharedTaskBoardView
      tasks={tasks}
      stages={PROJECT_TASK_STAGES}
      onCardMove={handleCardMove}
      className="h-[550px]"
    />
  );
}
