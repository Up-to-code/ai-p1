"use client";

import React, { useState } from "react";
import { type Client } from "../../../store/clients.types";
import { useClientTasksQuery, createClientTaskRequest, updateClientTaskRequest, deleteClientTaskRequest, type ClientTaskPayload } from "@/domains/clients/api/client-tasks";
import { useCalendarEventsQuery } from "@/domains/calendar/api/calendar";
import { EditableText } from "@/components/ui/editable-text";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calendar, CheckSquare, Square, AlertCircle, Clock, CheckCircle2, Loader2, Edit3, AlignLeft } from "lucide-react";
import { useOperationState } from "@/lib/utils/operation-state";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { YooptaRichTextEditor } from "@/components/shared/yoopta-rich-text-editor";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";

interface TasksCalendarTabProps {
  client: Client;
  organizationId: string;
}

const PRIORITY_OPTIONS = [
  { label: "Low", value: "low" as const },
  { label: "Normal", value: "normal" as const },
  { label: "High", value: "high" as const },
  { label: "Urgent", value: "urgent" as const },
];

const VISIBILITY_OPTIONS = [
  { label: "Private", value: "private" as const },
  { label: "Only Me (Owner)", value: "owner" as const },
  { label: "Shareable (Team)", value: "team" as const },
  { label: "Share with Member", value: "member" as const },
  { label: "Public Link", value: "public" as const },
];

function eventDateTime(event: { date: string; time: string; startAt?: number }) {
  if (!event.startAt || !event.date.startsWith("1970-")) {
    return { date: event.date, time: event.time };
  }
  const timestamp = event.startAt < 100_000_000_000 ? event.startAt * 1_000 : event.startAt;
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
    time: date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
  };
}

export function TasksCalendarTab({ client, organizationId }: TasksCalendarTabProps) {
  const t = useTranslations("Clients");
  const tasksQuery = useClientTasksQuery(organizationId);
  const eventsQuery = useCalendarEventsQuery(organizationId, client.id);
  const tasks = tasksQuery ?? [];
  const events = eventsQuery ?? [];

  // Filter tasks to only include those for this client
  const clientTasks = React.useMemo(() => {
    return tasks.filter((task) => task.clientId === client.id);
  }, [tasks, client.id]);

  // Calendar Pagination State
  const [visibleEventsCount, setVisibleEventsCount] = useState(5);
  const visibleEvents = React.useMemo(() => events.slice(0, visibleEventsCount), [events, visibleEventsCount]);

  // Task Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [newDueDate, setNewDueDate] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newVisibility, setNewVisibility] = useState<any>("private");

  const operation = useOperationState({ errorMessage: "Failed to update task." });
  const createOperation = useOperationState({ errorMessage: "Failed to create task." });

  if (tasksQuery === undefined || eventsQuery === undefined) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="overflow-hidden border-y border-border divide-y divide-border">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3.5">
                <Skeleton className="h-6 w-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const openTaskModal = (task?: any) => {
    if (task) {
      setEditingTaskId(task.id);
      setNewTitle(task.title);
      setNewPriority(task.priority || "normal");
      setNewDueDate(task.dueDate || "");
      setNewDescription(task.description || "");
      setNewVisibility(task.visibility || "private");
    } else {
      setEditingTaskId(null);
      setNewTitle("");
      setNewPriority("normal");
      setNewDueDate("");
      setNewDescription("");
      setNewVisibility("private");
    }
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!newTitle.trim()) return;

    const payload: ClientTaskPayload = {
      title: newTitle.trim(),
      priority: newPriority,
      dueDate: newDueDate || undefined,
      description: newDescription || undefined,
      clientId: client.id,
      visibility: newVisibility,
    };

    if (editingTaskId) {
      await operation.run(async () => {
        await updateClientTaskRequest(organizationId, editingTaskId, payload);
        setIsTaskModalOpen(false);
      });
    } else {
      payload.status = "todo";
      await createOperation.run(async () => {
        await createClientTaskRequest(organizationId, payload);
        setIsTaskModalOpen(false);
      });
    }
  };

  const handleUpdateTaskField = async (task: any, patch: Partial<ClientTaskPayload>) => {
    const payload: ClientTaskPayload = {
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      description: task.description,
      visibility: task.visibility || "private",
      clientId: client.id,
      ...patch,
    };

    await operation.run(async () => {
      await updateClientTaskRequest(organizationId, task.id, payload);
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    await operation.run(async () => {
      await deleteClientTaskRequest(organizationId, taskId);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-start">
      {/* Tasks Column */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-muted-foreground">Tasks checklist</h2>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">
            {clientTasks.filter((t) => t.status === "done").length} / {clientTasks.length} done
          </span>
        </div>

        {/* Task List container */}
        <div className="overflow-hidden border-y border-border divide-y divide-border">
          {clientTasks.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No tasks created for this client yet.
            </div>
          )}

          {clientTasks.map((task) => {
            const isDone = task.status === "done";
            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3.5 hover:bg-muted/10 transition-colors group"
              >
                {/* Checkbox Icon button */}
                <button
                  type="button"
                  onClick={() =>
                    handleUpdateTaskField(task, { status: isDone ? "todo" : "done" })
                  }
                  className="mt-0.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  {isDone ? (
                    <CheckSquare className="h-4 w-4 text-primary" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => openTaskModal(task)}
                      className={cn(
                        "font-medium text-sm text-foreground hover:underline text-start",
                        isDone && "line-through text-muted-foreground opacity-70"
                      )}
                    >
                      {task.title}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    {/* Due date */}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <EditableText
                        value={task.dueDate || ""}
                        onChange={(dueDate) => handleUpdateTaskField(task, { dueDate })}
                        placeholder="Set date..."
                        className="text-xs"
                      />
                    </div>

                    {task.description && (
                      <>
                        <span className="h-3 w-px bg-border" />
                        <div className="flex items-center gap-1">
                          <AlignLeft className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span className="text-xs">Notes</span>
                        </div>
                      </>
                    )}

                    {/* Divider */}
                    <span className="h-3 w-px bg-border" />

                    {/* Priority select */}
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 text-muted-foreground/60" />
                      <Select
                        value={task.priority || "normal"}
                        onValueChange={(priority: string | null) => priority && handleUpdateTaskField(task, { priority: priority as ClientTaskPayload["priority"] })}
                      >
                        <SelectTrigger size="sm" className="h-7 w-24 rounded-md border-0 bg-transparent px-2 text-xs shadow-none hover:bg-muted">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openTaskModal(task)}
                    className="p-1 hover:text-foreground text-muted-foreground transition-colors mr-1"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1 hover:text-red-500 text-muted-foreground transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Task Trigger */}
        <button
          onClick={() => openTaskModal()}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-semibold px-2 py-1 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </button>

        {operation.error && <p className="text-xs text-red-500 font-bold">{operation.error}</p>}
        {createOperation.error && <p className="text-xs text-red-500 font-bold">{createOperation.error}</p>}
      </div>

      {/* Calendar Column */}
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground">Calendar events</h2>
        <div className="space-y-3">
          {events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              No calendar events linked to this client.
            </div>
          ) : (
            visibleEvents.map((event) => {
              const displayDateTime = eventDateTime(event);
              return <div key={event.id} className="border-b border-border/70 px-1 py-4 transition-colors hover:bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary capitalize">
                    {event.type}
                  </span>
                  <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {displayDateTime.date} · {displayDateTime.time}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-foreground mb-1">{event.title}</h4>
                {event.location && (
                  <p className="text-xs text-muted-foreground">Location: {event.location}</p>
                )}
              </div>;
            })
          )}

          {events.length > visibleEventsCount && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setVisibleEventsCount((prev) => prev + 10)}
              className="w-full h-9 rounded-xl border-dashed border-border text-xs font-semibold hover:bg-muted/50 transition-colors"
            >
              Show more events
            </Button>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <DialogContent className="gap-4 p-6 shadow-none sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-black tracking-tight">
              {editingTaskId ? "Edit Task" : "Quick Task"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create or edit a task module with rich details, priority, and sharing settings.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Task Title</label>
              <Input
                placeholder="E.g., Follow up on latest proposal..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-9 rounded-md shadow-none"
                autoFocus
              />
            </div>

            {/* Custom Input Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Priority</label>
                <Select value={newPriority} onValueChange={(value: string | null) => value && setNewPriority(value as typeof newPriority)}>
                  <SelectTrigger size="sm" className="h-9 rounded-md bg-background px-3 shadow-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Visibility</label>
                <Select value={newVisibility} onValueChange={(value: string | null) => value && setNewVisibility(value)}>
                  <SelectTrigger size="sm" className="h-9 rounded-md bg-background px-3 shadow-none"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VISIBILITY_OPTIONS.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Due Date</label>
                <DatePicker
                  date={newDueDate ? new Date(`${newDueDate}T12:00:00`) : undefined}
                  setDate={(date) => setNewDueDate(date ? date.toISOString().slice(0, 10) : "")}
                  className="h-9 w-full rounded-md shadow-none"
                  contentClassName="rounded-md shadow-none"
                />
              </div>
            </div>

            {/* Rich Text Editor */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description & Notes</label>
              <div className="rounded-xl border border-border bg-card overflow-hidden min-h-[220px]">
                <YooptaRichTextEditor
                  value={newDescription}
                  onChange={setNewDescription}
                  placeholder="Add interesting progress, links, or context (Markdown supported)..."
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTaskModalOpen(false)}
              className="h-9 px-4 text-xs font-semibold cursor-pointer"
              disabled={createOperation.isRunning || operation.isRunning}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveTask}
              disabled={!newTitle.trim() || createOperation.isRunning || operation.isRunning}
              className="h-9 px-4 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
            >
              {(createOperation.isRunning || operation.isRunning) ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingTaskId ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
