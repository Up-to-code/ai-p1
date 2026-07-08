"use client";

import type { ViewItem } from "@/components/shared/view-system/types";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import type { TaskRecord } from "../../tasks.types";
import { TaskTableView } from "./task-table-view";
import { TaskBoardView } from "./task-board-view";
import { TaskListView } from "./task-list-view";

interface TaskViewFrameProps {
  tab: ViewItem;
  tasks: TaskRecord[];
  stages: Array<{ key: string; name: string; color?: string; order?: number }>;
  organizationId?: string;
  projectId?: string | null;
  spaceId?: string | null;
  onCardMove: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
  onTaskUpdate?: (task: TaskRecord, changes: Partial<TaskRecord>) => void | Promise<void>;
  onTaskCreate?: (title: string, defaults?: Pick<Partial<TaskRecord>, "status" | "priority" | "assigneeUserId" | "dueDate" | "tags">) => void | Promise<void>;
}

export function TaskViewFrame({ tab, tasks, stages, organizationId, projectId, spaceId, onCardMove, onTaskUpdate, onTaskCreate }: TaskViewFrameProps) {
  switch (tab.type) {
    case "table":
      return <TaskTableView tasks={tasks} organizationId={organizationId} projectId={projectId} spaceId={spaceId} onTaskUpdate={onTaskUpdate} onTaskCreate={onTaskCreate} onTaskMove={onCardMove} />;
    case "board":
      return <TaskBoardView tasks={tasks} stages={stages} onCardMove={onCardMove} onTaskCreate={onTaskCreate} />;
    case "list":
      return <TaskListView tasks={tasks} />;
    case "calendar":
      return <ViewLoading style="calendar" message="Calendar view coming soon" />;
    case "timeline":
      return <ViewLoading style="table" message="Timeline view coming soon" />;
    default:
      return <ViewLoading style="skeleton" message={`${tab.type} view coming soon`} />;
  }
}
