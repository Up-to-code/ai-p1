"use client";

import type { ViewItem } from "@/components/shared/view-system/types";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import type { TaskRecord } from "../../tasks.types";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { TaskTableView } from "./task-table-view";
import { TaskBoardView } from "./task-board-view";
import { TaskListView } from "./task-list-view";
import type { TaskQuickCreateCommand } from "../../workspace/task-quick-create";
import type { TaskBulkCommand } from "../../workspace/task-bulk";
import { TaskCalendarWorkspaceView } from "./task-calendar-workspace-view";
import { TaskTimelineWorkspaceView } from "./task-timeline-workspace-view";

interface TaskViewFrameProps {
  tab: ViewItem;
  tasks: TaskRecord[];
  stages: Array<{ key: string; name: string; color?: string; order?: number }>;
  organizationId?: string;
  projectId?: string | null;
  spaceId?: string | null;
  onCardMove: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
  onTaskUpdate?: (task: TaskRecord, changes: Partial<TaskRecord>) => void | Promise<void>;
  onTaskDelete?: (task: TaskRecord) => void | Promise<void>;
  currentUserId?: string;
  memberOptions?: WorkOsPickerOption[];
  onTaskOpen?: (taskId: string) => void;
  onTaskCreate?: TaskQuickCreateCommand;
  onTasksBulk?: TaskBulkCommand;
}

export function TaskViewFrame({ tab, tasks, stages, organizationId, projectId, spaceId, onCardMove, onTaskUpdate, onTaskDelete, currentUserId, memberOptions, onTaskOpen, onTaskCreate, onTasksBulk }: TaskViewFrameProps) {
  switch (tab.type) {
    case "table":
      return <TaskTableView tasks={tasks} organizationId={organizationId} projectId={projectId} spaceId={spaceId} memberOptions={memberOptions} onTaskOpen={onTaskOpen} onTaskUpdate={onTaskUpdate} onTaskDelete={onTaskDelete} onTaskCreate={onTaskCreate} onTaskMove={onCardMove} onTasksBulk={onTasksBulk} />;
    case "board":
      return <TaskBoardView tasks={tasks} stages={stages} organizationId={organizationId} onCardMove={onCardMove} onTaskCreate={onTaskCreate} onTaskUpdate={onTaskUpdate} onTaskDelete={onTaskDelete} onTaskOpen={onTaskOpen} currentUserId={currentUserId} />;
    case "list":
      return <TaskListView tasks={tasks} memberOptions={memberOptions} onTaskOpen={onTaskOpen} onTaskUpdate={onTaskUpdate} onTaskCreate={onTaskCreate} onTaskMove={onCardMove} />;
    case "calendar":
      return <TaskCalendarWorkspaceView tasks={tasks} onTaskOpen={onTaskOpen} />;
    case "timeline":
      return <TaskTimelineWorkspaceView tasks={tasks} onTaskOpen={onTaskOpen} />;
    default:
      return <ViewLoading style="skeleton" message={`${tab.type} view coming soon`} />;
  }
}
