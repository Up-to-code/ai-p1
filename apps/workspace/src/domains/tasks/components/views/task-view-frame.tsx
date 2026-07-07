"use client";

import type { ViewItem } from "@/components/shared/view-system/types";
import type { StageDefinition } from "@qentrah/our-platform-components/pipeline";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";
import type { TaskRecord } from "../../tasks.types";
import { TaskTableView } from "./task-table-view";
import { TaskBoardView } from "./task-board-view";

interface TaskViewFrameProps {
  tab: ViewItem;
  tasks: TaskRecord[];
  stages: StageDefinition[];
  onCardMove: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
}

export function TaskViewFrame({ tab, tasks, stages, onCardMove }: TaskViewFrameProps) {
  switch (tab.type) {
    case "table":
      return <TaskTableView tasks={tasks} />;
    case "board":
      return <TaskBoardView tasks={tasks} stages={stages} onCardMove={onCardMove} />;
    case "calendar":
      return <ViewLoading style="calendar" message="Calendar view coming soon" />;
    case "timeline":
      return <ViewLoading style="table" message="Timeline view coming soon" />;
    default:
      return <ViewLoading style="skeleton" message={`${tab.type} view coming soon`} />;
  }
}
