"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Circle,
  ExternalLink,
  Flag,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Trash2,
  UserRound,
  Video,
  Clock3,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  WorkOsDocEditor,
  type DocEditorMentionOption,
  type DocEditorMetaField,
} from "@/components/shared/work-os-doc-editor";
import { DeleteRecordDialog } from "@/components/shared/crud-ui";
import { Link, useRouter } from "@/i18n/routing";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import {
  deleteTaskRequest,
  removeTaskFromTaskCaches,
  upsertTaskInTaskCaches,
  updateTaskRequest,
} from "../api/tasks";
import type { TaskFormValues, TaskRecord } from "../tasks.types";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import { createCalendarEventRequest } from "@/domains/calendar/api/calendar";
import {
  taskDocumentContext,
} from "../tasks.constants";
import { StatusPicker, PriorityPicker, DueDatePicker, AssigneePicker } from "./task-pickers";
import { taskHref, meetingDateTimeFromTask } from "./task-hooks";
import { taskLog } from "../task-log";

// ─── Form helpers ──────────────────────────────────────────────────────────────

function formFromTask(task: TaskRecord): TaskFormValues {
  return {
    title: task.title,
    status: task.status,
    pipelineOrder: task.pipelineOrder,
    priority: task.priority,
    visibility: task.visibility ?? "team",
    assigneeUserId: task.assigneeUserId ?? "",
    clientId: task.clientId ?? "",
    projectId: task.projectId ?? "",
    dueDate: task.dueDate ?? "",
    description: task.description ?? "",
    tags: (task.tags ?? []).join(", "),
  };
}

// ─── Task Editor panel ────────────────────────────────────────────────────────

/**
 * Renders the doc-editor for a single task.
 * Used both inside the split-pane TasksScreen and standalone TaskDetailScreen.
 */
export function TaskEditor({
  task,
  organizationId,
  memberOptions,
  mentionOptions,
  onSaved,
  onDeleted,
  onClose,
  showBackLink = false,
  routeProjectId = null,
}: {
  task: TaskRecord;
  organizationId: string;
  memberOptions: WorkOsPickerOption[];
  mentionOptions: DocEditorMentionOption[];
  onSaved?: () => void;
  onDeleted?: () => void;
  onClose?: () => void;
  showBackLink?: boolean;
  routeProjectId?: string | null;
}) {
  const t = useTranslations("Tasks");
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();
  const context = useMemo(
    () => taskDocumentContext(organizationId, routeProjectId, task.projectId),
    [organizationId, routeProjectId, task.projectId],
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const defaultMeetingTime = meetingDateTimeFromTask(task);
  const [meetingDate, setMeetingDate] = useState(defaultMeetingTime.date);
  const [meetingStartTime, setMeetingStartTime] = useState(
    defaultMeetingTime.time,
  );
  const [meetingEndTime, setMeetingEndTime] = useState(
    defaultMeetingTime.endTime,
  );

  const storageKey = `qentrah:task-draft:${organizationId}:${task.id}`;
  const initialDraft = useMemo(() => {
    const serverDraft = formFromTask(task);
    if (typeof window === "undefined") return serverDraft;
    try {
      const cached = window.localStorage.getItem(storageKey);
      return cached ? { ...serverDraft, ...JSON.parse(cached) } : serverDraft;
    } catch {
      return serverDraft;
    }
  }, [storageKey, task]);

  // Local draft is browser-saved first; backend writes only happen on explicit Save.
  const [draft, setDraft] = useState<TaskFormValues>(initialDraft);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const savedSnapshot = formFromTask(task);
  const hasUnsavedChanges =
    JSON.stringify(draft) !== JSON.stringify(savedSnapshot);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [draft, storageKey]);

  const updateDraft = useCallback((partial: Partial<TaskFormValues>) => {
    setDraft((current) => ({ ...current, ...partial }));
  }, []);

  const saveDraft = useCallback(async () => {
    taskLog.info("save:start", { taskId: task.id });
    setBusyId("patch");
    try {
      const updatedTask = await updateTaskRequest(organizationId, task.id, draft);
      upsertTaskInTaskCaches(queryClient, organizationId, updatedTask.task);
      if (typeof window !== "undefined")
        window.localStorage.removeItem(storageKey);
      taskLog.info("save:success", { taskId: task.id });
      toast.toast({ title: "Task document saved.", type: "success" });
      onSaved?.();
    } catch (error) {
      taskLog.error("save:failed", { taskId: task.id, error: String(error) });
      throw error;
    } finally {
      setBusyId(null);
    }
  }, [draft, organizationId, task.id, queryClient, storageKey, toast, onSaved]);

  const fields: DocEditorMetaField[] = [
    {
      key: "status",
      icon: <Circle className="h-3.5 w-3.5" />,
      label: t("form.status"),
      value: (
        <StatusPicker
          value={draft.status}
          onChange={(v) => updateDraft({ status: v })}
          t={t}
        />
      ),
    },
    {
      key: "priority",
      icon: <Flag className="h-3.5 w-3.5" />,
      label: t("form.priority"),
      value: (
        <PriorityPicker
          value={draft.priority}
          onChange={(v) => updateDraft({ priority: v })}
          t={t}
        />
      ),
    },
    {
      key: "assignee",
      icon: <UserRound className="h-3.5 w-3.5" />,
      label: t("form.assignee"),
      value: (
        <AssigneePicker
          value={draft.assigneeUserId}
          onChange={(v) => updateDraft({ assigneeUserId: v })}
          options={memberOptions}
          t={t}
        />
      ),
    },
    {
      key: "dueDate",
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      label: t("form.dueDate"),
      value: (
        <DueDatePicker
          value={draft.dueDate}
          onChange={(v) => updateDraft({ dueDate: v })}
        />
      ),
    },
  ];

  async function scheduleMeetingFromTask() {
    setBusyId("schedule");
    try {
      await createCalendarEventRequest(organizationId, {
        title: draft.title || task.title || "Task meeting",
        owner: draft.assigneeUserId || "Team",
        date: meetingDate,
        time: meetingStartTime,
        endDate: meetingDate,
        endTime: meetingEndTime,
        type: "meeting",
        status: "draft",
        clientId: draft.clientId || undefined,
        projectId:
          context.scope === "project"
            ? context.projectId
            : draft.projectId || undefined,
        taskId: task.id,
        notes: `Created from task: ${draft.title}\n${taskHref(task.id, context)}`,
      });
      await queryClient.invalidateQueries({ queryKey: ["calendar"] });
      setScheduleOpen(false);
      toast.toast({ title: "Meeting scheduled from task.", type: "success" });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    taskLog.info("delete:start", { taskId: task.id });
    setBusyId("delete");
    try {
      await deleteTaskRequest(organizationId, task.id);
      removeTaskFromTaskCaches(queryClient, organizationId, task.id);
      taskLog.info("delete:success", { taskId: task.id });
      onDeleted?.();
      if (showBackLink) router.push("/tasks");
    } catch (error) {
      taskLog.error("delete:failed", { taskId: task.id, error: String(error) });
      throw error;
    } finally {
      setBusyId(null);
      setDeleting(false);
    }
  }

  return (
    <div
      className={cn(
        "flex h-full flex-col",
        isFullscreen && "fixed inset-0 z-[60] bg-background",
      )}
    >
      {/* ── Context-aware task action bar ── */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/90 backdrop-blur-xl px-4 sm:px-6 h-12">
        <div className="min-w-0 flex items-center gap-2">
          {showBackLink ? (
            <Link
              href="/tasks"
              className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("title")}
            </Link>
          ) : (
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
              {context.scope === "project" ? "Project task" : "Workspace task"}
            </span>
          )}
          <span className="truncate text-xs font-semibold text-foreground">
            {draft.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasUnsavedChanges && !busyId && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400">
              Saved in browser
            </span>
          )}
          {busyId === "patch" && (
            <span className="text-[10px] text-text-muted animate-pulse">
              Saving…
            </span>
          )}
          <Button
            type="button"
            size="sm"
            onClick={saveDraft}
            disabled={Boolean(busyId) || !hasUnsavedChanges}
            className="h-8 rounded-xl text-xs"
          >
            Save
          </Button>
          <Popover open={scheduleOpen} onOpenChange={setScheduleOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={Boolean(busyId)}
                  className="h-8 rounded-xl text-xs"
                >
                  <Video className="h-3.5 w-3.5" />
                  Schedule meeting
                </Button>
              }
            />
            <PopoverContent
              align="end"
              className="w-72 rounded-2xl border-border bg-popover p-4 shadow-2xl"
            >
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-text-muted">
                <Clock3 className="h-3.5 w-3.5" /> Meeting time
              </div>
              <label className="mb-2 block text-xs font-semibold text-text-muted">
                Date
              </label>
              <input
                type="date"
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="mb-3 h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
              />
              <div className="grid grid-cols-2 gap-2">
                <label className="block text-xs font-semibold text-text-muted">
                  From
                  <input
                    type="time"
                    value={meetingStartTime}
                    onChange={(e) => setMeetingStartTime(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </label>
                <label className="block text-xs font-semibold text-text-muted">
                  To
                  <input
                    type="time"
                    value={meetingEndTime}
                    onChange={(e) => setMeetingEndTime(e.target.value)}
                    className="mt-1 h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </label>
              </div>
              <Button
                type="button"
                onClick={scheduleMeetingFromTask}
                disabled={Boolean(busyId)}
                className="mt-4 h-9 w-full rounded-xl text-xs"
              >
                Create calendar meeting
              </Button>
            </PopoverContent>
          </Popover>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsFullscreen((v) => !v)}
            title={isFullscreen ? "Exit full screen" : "Full screen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button type="button" variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="min-w-48">
              {onClose && (
                <DropdownMenuItem onClick={onClose}>
                  <X className="h-4 w-4" />
                  Close drawer
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => router.push(taskHref(task.id, context) as never)}
              >
                <ExternalLink className="h-4 w-4" />
                Open task link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleting(true)}
                disabled={busyId === "delete"}
              >
                <Trash2 className="h-4 w-4" />
                {t("actions.deleteTask")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Doc editor ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <WorkOsDocEditor
          title={draft.title}
          body={draft.description}
          fields={fields}
          titlePlaceholder={t("form.titlePlaceholder") || "Task title"}
          bodyPlaceholder={
            t("form.descriptionPlaceholder") ||
            "Add description… Type / for commands"
          }
          isSaving={busyId === "patch"}
          onTitleBlur={(v) => {
            if (v !== draft.title) updateDraft({ title: v });
          }}
          onBodyChange={(html) => {
            if (html !== draft.description) updateDraft({ description: html });
          }}
          onBodyBlur={() => {}}
          mentionOptions={mentionOptions}
          documentContext={context}
        />
      </div>

      <DeleteRecordDialog
        open={deleting}
        onOpenChange={setDeleting}
        title={t("actions.deleteTask")}
        description={t("actions.deleteDesc", { title: draft.title })}
        isDeleting={busyId === "delete"}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
