"use client";

import { useMemo, useState, useEffect, memo } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Flag, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskRecord, TaskStatus } from "../tasks.types";
import {
  STATUS_DOT,
  STATUS_COLUMN_BG,
  PRIORITY_COLOR,
  STATUSES,
  getDueDateColor,
  getInitials,
  normalizeTaskStatus,
} from "../tasks.constants";
import { sortPipelineTasks } from "../task-pipeline-order";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

const TaskCard = memo(function TaskCard({
  task,
  status,
  selectedId,
  onTaskClick,
}: {
  task: TaskRecord;
  status: TaskStatus;
  selectedId?: string;
  onTaskClick?: (id: string) => void;
}) {
  const t = useTranslations("Tasks");
  return (
    <div
      className={cn(
        "group rounded-xl border border-border bg-card p-3 transition-colors cursor-pointer",
        selectedId === task.id &&
          "ring-2 ring-primary/40 border-primary/30",
      )}
    >
      {/* Title row */}
      <div className="flex items-start gap-2">
        <button className="mt-0.5 shrink-0 text-muted-foreground/50 transition-colors hover:text-emerald-500">
          {status === "done" ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Circle className="h-4 w-4" />
          )}
        </button>
        <p
          className={cn(
            "min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground",
            status === "done" &&
              "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
      </div>

      {/* Meta row */}
      <div className="mt-2.5 flex flex-wrap items-center gap-2 ps-6">
        {task.dueDate && (
          <span
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold",
              getDueDateColor(task.dueDate),
            )}
          >
            <Calendar className="h-3 w-3" />
            {new Date(task.dueDate).toLocaleDateString(
              undefined,
              { month: "short", day: "numeric" },
            )}
          </span>
        )}
        {task.priority !== "normal" && (
          <span
            className={cn(
              "flex items-center gap-1 text-[11px] font-semibold",
              PRIORITY_COLOR[task.priority],
            )}
          >
            <Flag className="h-3 w-3" />
            {t(`priorities.${task.priority}`)}
          </span>
        )}
      </div>

      {/* Assignee row */}
      <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            {t("from")}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-black text-muted-foreground">
              {t("me")}
            </div>
          </div>
        </div>

        {task.assigneeUserId && (
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              {t("to")}
            </span>
            <div className="flex items-center gap-1.5">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[8px] font-black text-white">
                {getInitials(task.assigneeUserId)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export function TaskGroupedList({
  tasks,
  statusFilter = "all",
  onTaskDrop,
  onTaskClick,
  selectedId,
}: {
  tasks: TaskRecord[];
  statusFilter?: TaskStatus | "all";
  onTaskDrop?: (
    taskId: string,
    newStatus: TaskStatus,
    targetIndex: number,
  ) => void;
  onTaskClick?: (id: string) => void;
  selectedId?: string;
}) {
  const t = useTranslations("Tasks");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, TaskRecord[]> = {
      todo: [],
      inProgress: [],
      waiting: [],
      done: [],
      canceled: [],
    };
    for (const task of tasks) {
      const status = normalizeTaskStatus(task.status);
      if (groups[status]) {
        groups[status].push(task);
      }
    }

    const result: Record<string, TaskRecord[]> = {};
    for (const status of STATUSES) {
      result[status] = sortPipelineTasks(groups[status]);
    }

    return result as Record<TaskStatus, TaskRecord[]>;
  }, [tasks]);


  const visibleStatuses =
    statusFilter === "all"
      ? STATUSES
      : STATUSES.filter((s) => s === normalizeTaskStatus(statusFilter));

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    const newStatus = destination.droppableId as TaskStatus;

    onTaskDrop?.(draggableId, newStatus, destination.index);
  };

  if (!mounted) return null; // Avoid hydration mismatch with DND

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex min-h-[480px] gap-4 items-start">
        {visibleStatuses.map((status) => {
          const columnTasks = groupedTasks[status];
          return (
            <div
              key={status}
              className={cn(
                "flex w-[300px] shrink-0 flex-col rounded-2xl border border-border",
                STATUS_COLUMN_BG[status],
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shrink-0",
                      STATUS_DOT[status],
                    )}
                  />
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">
                    {t(`statuses.${status}`)}
                  </span>
                </div>
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-black text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>

              {/* Cards Droppable Area */}
              <Droppable droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "flex flex-1 flex-col gap-2 p-2 min-h-[150px] transition-colors rounded-b-2xl",
                      snapshot.isDraggingOver && "bg-muted/50",
                    )}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable
                        key={task.id}
                        draggableId={task.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onTaskClick?.(task.id)}
                            className={cn(
                              "transition-opacity",
                              snapshot.isDragging &&
                                "opacity-90",
                            )}
                          >
                            <TaskCard
                              task={task}
                              status={status}
                              selectedId={selectedId}
                              onTaskClick={onTaskClick}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex h-20 items-center justify-center text-[11px] font-medium text-muted-foreground/50">
                        {t("empty.title")}
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
