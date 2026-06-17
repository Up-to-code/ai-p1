"use client";

import { useMemo, useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Flag, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskRecord, TaskStatus } from "../tasks.types";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

function getDueDateColor(dueDate?: string | null) {
  if (!dueDate) return "text-muted-foreground";
  const date = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (date < today) return "text-red-500";
  if (date.getTime() === today.getTime()) return "text-amber-500";
  return "text-muted-foreground";
}

function getColumnBg(status: TaskStatus) {
  if (status === "todo") return "bg-muted/30";
  if (status === "inProgress") return "bg-blue-500/5 dark:bg-blue-500/10";
  if (status === "waiting") return "bg-amber-500/5 dark:bg-amber-500/10";
  if (status === "done") return "bg-emerald-500/5 dark:bg-emerald-500/10";
  return "bg-muted/30";
}

function getPriorityColor(priority: string) {
  if (priority === "urgent") return "text-red-500";
  if (priority === "high") return "text-amber-500";
  return "text-muted-foreground/50";
}

function getStatusDot(status: TaskStatus) {
  if (status === "done") return "bg-emerald-500";
  if (status === "inProgress") return "bg-blue-500";
  if (status === "waiting") return "bg-amber-500";
  if (status === "canceled") return "bg-muted-foreground";
  return "bg-muted-foreground/50";
}

function getStatusLabel(status: TaskStatus) {
  if (status === "done") return "Done";
  if (status === "inProgress") return "In progress";
  if (status === "waiting") return "Waiting";
  if (status === "canceled") return "Canceled";
  return "To do";
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name.slice(0, 2).toUpperCase();
}

const BOARD_STATUSES: TaskStatus[] = ["todo", "inProgress", "waiting", "done"];

export function TaskGroupedList({
  tasks,
  statusFilter = "all",
  onTaskDrop,
}: {
  tasks: TaskRecord[];
  statusFilter?: TaskStatus | "all";
  onTaskDrop?: (taskId: string, newStatus: TaskStatus) => void;
}) {
  const t = useTranslations("Tasks");
  const [mounted, setMounted] = useState(false);
  const [optimisticTasks, setOptimisticTasks] = useState(tasks);

  // Sync optimistic tasks with real tasks prop when it changes
  useEffect(() => {
    setOptimisticTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const groupedTasks = useMemo(() => {
    const groups: Record<TaskStatus, TaskRecord[]> = {
      todo: [],
      inProgress: [],
      waiting: [],
      done: [],
      canceled: [],
    };
    for (const task of optimisticTasks) {
      if (groups[task.status]) {
        groups[task.status].push(task);
      }
    }
    return groups;
  }, [optimisticTasks]);

  const visibleStatuses = statusFilter === "all"
    ? BOARD_STATUSES
    : BOARD_STATUSES.filter((s) => s === statusFilter);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    
    // Optimistically update
    setOptimisticTasks((prev) => 
      prev.map(task => task.id === draggableId ? { ...task, status: newStatus } : task)
    );

    // Call the API
    if (onTaskDrop && source.droppableId !== destination.droppableId) {
      onTaskDrop(draggableId, newStatus);
    }
  };

  if (!mounted) return null; // Avoid hydration mismatch with DND

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex min-h-[480px] gap-4 overflow-x-auto pb-8 items-start">
        {visibleStatuses.map((status) => {
          const columnTasks = groupedTasks[status];
          return (
            <div
              key={status}
              className={cn(
                "flex w-[300px] shrink-0 flex-col rounded-2xl border border-border",
                getColumnBg(status)
              )}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", getStatusDot(status))} />
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
                      snapshot.isDraggingOver && "bg-muted/50"
                    )}
                  >
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={cn(
                              "group rounded-xl border border-border bg-card p-3 shadow-none transition-shadow",
                              snapshot.isDragging && "shadow-xl ring-2 ring-primary/20 opacity-90",
                              !snapshot.isDragging && "hover:shadow-sm hover:bg-muted/30"
                            )}
                          >
                            {/* Title row */}
                            <div className="flex items-start gap-2">
                              <button className="mt-0.5 shrink-0 text-muted-foreground/50 transition-colors hover:text-emerald-500">
                                {status === "done"
                                  ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                  : <Circle className="h-4 w-4" />
                                }
                              </button>
                              <p className={cn(
                                "min-w-0 flex-1 text-sm font-semibold leading-snug text-foreground",
                                status === "done" && "text-muted-foreground line-through"
                              )}>
                                {task.title}
                              </p>
                            </div>

                            {/* Meta row - using ps-6 for RTL support */}
                            <div className="mt-2.5 flex flex-wrap items-center gap-2 ps-6">
                              {task.dueDate && (
                                <span className={cn("flex items-center gap-1 text-[11px] font-semibold", getDueDateColor(task.dueDate))}>
                                  <Calendar className="h-3 w-3" />
                                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </span>
                              )}
                              {task.priority !== "normal" && (
                                <span className={cn("flex items-center gap-1 text-[11px] font-semibold", getPriorityColor(task.priority))}>
                                  <Flag className="h-3 w-3" />
                                  {t(`priorities.${task.priority}`)}
                                </span>
                              )}
                            </div>

                            {/* Assignee row - using justify-between (RTL friendly) and ps-6 */}
                            <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{t("from")}</span>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[8px] font-black text-muted-foreground">
                                    {t("me")}
                                  </div>
                                </div>
                              </div>
                              
                              {task.assigneeUserId && (
                                <div className="flex flex-col items-end gap-0.5">
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{t("to")}</span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[8px] font-black text-white">
                                      {getInitials(task.assigneeUserId)}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
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
