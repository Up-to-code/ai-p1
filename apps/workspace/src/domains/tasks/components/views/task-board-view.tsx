"use client";

import { useTranslations } from "next-intl";
import { PipelineBoard } from "@qentrah/our-platform-components/pipeline";
import type { StageDefinition } from "@qentrah/our-platform-components/pipeline";
import type { TaskRecord } from "../../tasks.types";

interface TaskBoardViewProps {
  tasks: TaskRecord[];
  stages: StageDefinition[];
  onCardMove: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
}

export function TaskBoardView({ tasks, stages, onCardMove }: TaskBoardViewProps) {
  const t = useTranslations("Tasks");

  const items = tasks.map((task) => ({
    id: task.id,
    stageKey: task.status,
    title: task.title,
    subtitle: task.description,
    badge: task.priority,
    badgeColor:
      task.priority === "urgent"
        ? "#ef4444"
        : task.priority === "high"
          ? "#f59e0b"
          : task.priority === "normal"
            ? "#3b82f6"
            : "#6b7280",
    data: {
      priority: task.priority,
      assigneeUserId: task.assigneeUserId,
      dueDate: task.dueDate,
    },
  }));

  return (
    <div className="h-full p-6">
      <PipelineBoard
        items={items}
        stages={stages}
        onCardMove={onCardMove}
        showBarColor
        renderEmpty={(stage) => (
          <div className="text-center py-8 text-[11px] text-muted-foreground/40 font-bold">
            No tasks
          </div>
        )}
      />
    </div>
  );
}
