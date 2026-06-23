"use client";

import React, { useState, useMemo, useCallback } from "react";
import { type Project } from "../../../store/projects.types";
import { useTasksQuery, createTaskRequest, updateTaskRequest } from "@/domains/tasks/api/tasks";
import { useAccountContext } from "@/domains/auth";
import { EditableText } from "@/components/ui/editable-text";
import { EditableSelect } from "@/components/ui/editable-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Loader2,
  Calendar,
  ArrowUpDown,
  LayoutGrid,
  GanttChart,
} from "lucide-react";
import type { TaskStatus, TaskPriority, TaskRecord } from "@/domains/tasks/tasks.types";

interface TasksTimelineTabProps {
  project: Project;
  organizationId: string;
  spaceId?: string;
}

const statusColumns: { value: TaskStatus; label: string; icon: any; color: string }[] = [
  { value: "todo", label: "To Do", icon: Circle, color: "text-muted-foreground" },
  { value: "inProgress", label: "In Progress", icon: Loader2, color: "text-blue-500" },
  { value: "waiting", label: "Waiting", icon: Clock, color: "text-amber-500" },
  { value: "done", label: "Done", icon: CheckCircle2, color: "text-emerald-500" },
];

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Normal", value: "normal" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

const priorityColors: Record<string, "gray" | "green" | "yellow" | "blue" | "red" | "brown" | "orange" | "purple" | "pink"> = {
  low: "gray",
  normal: "blue",
  high: "yellow",
  urgent: "red",
};

const statusOptions = statusColumns.map((s) => ({ label: s.label, value: s.value }));

export function TasksTimelineTab({ project, organizationId, spaceId }: TasksTimelineTabProps) {
  const tasksResult = useTasksQuery(organizationId, { projectId: project.id, spaceId });
  const tasks = tasksResult.data ?? [];

  const [view, setView] = useState<"board" | "timeline">("board");
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newPriority, setNewPriority] = useState<string>("normal");
  const [newDueDate, setNewDueDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, TaskRecord[]> = {
      todo: [],
      inProgress: [],
      waiting: [],
      done: [],
      canceled: [],
    };
    for (const task of tasks) {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    }
    return grouped;
  }, [tasks]);

  const totalTasks = tasks.length;
  const doneTasks = tasksByStatus.done.length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handleCreateTask = useCallback(async () => {
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await createTaskRequest(organizationId, {
        title: newTitle.trim(),
        status: "todo",
        priority: newPriority as TaskPriority,
        visibility: "team",
        assigneeUserId: "",
        clientId: "",
        projectId: project.id,
        dueDate: newDueDate || "",
        description: "",
        tags: "",
      });
      setNewTitle("");
      setNewPriority("normal");
      setNewDueDate("");
      setIsAdding(false);
    } catch (err) {
      console.error("Failed to create task:", err);
    }
    setIsSubmitting(false);
  }, [newTitle, newPriority, newDueDate, organizationId, project.id]);

  const handleStatusChange = useCallback(
    async (task: TaskRecord, newStatus: TaskStatus) => {
      try {
        await updateTaskRequest(organizationId, task.id, {
          title: task.title,
          status: newStatus,
          priority: task.priority,
          visibility: task.visibility ?? "team",
          assigneeUserId: task.assigneeUserId ?? "",
          clientId: task.clientId ?? "",
          projectId: task.projectId ?? "",
          dueDate: task.dueDate ?? "",
          description: task.description ?? "",
          tags: Array.isArray(task.tags) ? task.tags.join(",") : (task.tags ?? ""),
        });
      } catch (err) {
        console.error("Failed to update task:", err);
      }
    },
    [organizationId],
  );

  // Gantt data
  const ganttTasks = useMemo(() => {
    const now = Date.now();
    const projectStart = project.startDate ? new Date(project.startDate).getTime() : now - 30 * 86400000;
    const projectEnd = project.endDate ? new Date(project.endDate).getTime() : now + 30 * 86400000;
    const totalDuration = projectEnd - projectStart;

    return tasks
      .filter((t: any) => t.dueDate)
      .map((t: any) => {
        const dueMs = new Date(t.dueDate).getTime();
        const startMs = dueMs - 3 * 86400000; // Assume 3-day tasks
        const leftPct = Math.max(0, ((startMs - projectStart) / totalDuration) * 100);
        const widthPct = Math.min(100 - leftPct, (3 * 86400000 / totalDuration) * 100);
        return { ...t, leftPct, widthPct, dueMs };
      })
      .sort((a: any, b: any) => a.dueMs - b.dueMs);
  }, [tasks, project.startDate, project.endDate]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-semibold text-muted-foreground">Tasks</h2>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{totalTasks} total</span>
            <span>·</span>
            <span>{doneTasks} done</span>
            <span>·</span>
            <span>{progress}% complete</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5">
            <button
              onClick={() => setView("board")}
              className={cn(
                "h-7 rounded-md px-2.5 text-[11px] font-semibold transition-all flex items-center gap-1",
                view === "board" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <LayoutGrid className="h-3 w-3" />
              Board
            </button>
            <button
              onClick={() => setView("timeline")}
              className={cn(
                "h-7 rounded-md px-2.5 text-[11px] font-semibold transition-all flex items-center gap-1",
                view === "timeline" ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <GanttChart className="h-3 w-3" />
              Timeline
            </button>
          </div>

          <Button
            onClick={() => setIsAdding(true)}
            className="h-8 rounded-xl bg-primary px-3 text-xs font-semibold text-white"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Board View */}
      {view === "board" && (
        <div className="grid grid-cols-4 gap-4">
          {statusColumns.map((col) => {
            const Icon = col.icon;
            const columnTasks = tasksByStatus[col.value] ?? [];
            return (
              <div key={col.value} className="space-y-2">
                <div className="flex items-center gap-2 px-1 mb-3">
                  <Icon className={cn("h-3.5 w-3.5", col.color)} />
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {col.label}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground/60 ml-auto">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-1.5 min-h-[200px] rounded-xl border border-dashed border-border/50 p-2">
                  {columnTasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="group rounded-lg border border-border bg-card p-3 hover:border-primary/20 transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium text-foreground line-clamp-2">{task.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {task.dueDate && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <span className={cn(
                          "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold border",
                          task.priority === "urgent"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                            : task.priority === "high"
                              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                              : "bg-muted text-muted-foreground border-border",
                        )}>
                          {task.priority}
                        </span>
                      </div>
                      {/* Status change buttons on hover */}
                      <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {statusColumns
                          .filter((s) => s.value !== task.status)
                          .slice(0, 2)
                          .map((s) => (
                            <button
                              key={s.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(task, s.value);
                              }}
                              className="text-[9px] font-semibold text-muted-foreground hover:text-foreground px-1.5 py-0.5 rounded bg-muted/50 hover:bg-muted transition-colors"
                            >
                              → {s.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Timeline View (Simple CSS Gantt) */}
      {view === "timeline" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {ganttTasks.length > 0 ? (
            <>
              {/* Date header */}
              <div className="flex items-center border-b border-border bg-muted/30 px-4 py-2">
                <div className="w-48 shrink-0 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Task
                </div>
                <div className="flex-1 relative h-4">
                  <span className="absolute left-0 text-[9px] text-muted-foreground">{project.startDate || "Start"}</span>
                  <span className="absolute right-0 text-[9px] text-muted-foreground">{project.endDate || "End"}</span>
                </div>
              </div>

              {/* Task bars */}
              <div className="divide-y divide-border">
                {ganttTasks.map((task: any) => (
                  <div key={task.id} className="flex items-center px-4 py-2.5 hover:bg-muted/10 transition-colors group">
                    <div className="w-48 shrink-0 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 relative h-5">
                      <div
                        className={cn(
                          "absolute h-4 rounded-sm top-0.5 transition-all duration-300",
                          task.status === "done"
                            ? "bg-emerald-500/60"
                            : task.status === "inProgress"
                              ? "bg-blue-500/60"
                              : task.status === "waiting"
                                ? "bg-amber-500/60"
                                : "bg-muted-foreground/30",
                        )}
                        style={{
                          left: `${task.leftPct}%`,
                          width: `${Math.max(task.widthPct, 2)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <GanttChart className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No tasks with due dates to show on timeline.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Create a new task for this project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-sm"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Priority</label>
                <EditableSelect
                  value={newPriority}
                  options={priorityOptions}
                  onChange={(val) => setNewPriority(val as TaskPriority)}
                  colorMapType="task-priority"
                  defaultColors={priorityColors}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Due Date</label>
                <Input
                  type="date"
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="text-sm dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateTask}
              disabled={!newTitle.trim() || isSubmitting}
              className="h-8 text-xs"
            >
              {isSubmitting && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
