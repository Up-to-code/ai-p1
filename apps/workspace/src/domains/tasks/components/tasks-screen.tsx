"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Circle,
  ExternalLink,
  Flag,
  ListTodo,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  UserRound,
  Video,
  Clock3,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import {
  WorkOsDocEditor,
  type DocEditorMentionOption,
  type DocEditorMetaField,
} from "@/components/shared/work-os-doc-editor";
import {
  DetailNotFoundState,
  EmptyWorkspace,
  WorkspaceQueryState,
  DeleteRecordDialog,
} from "@/components/shared/crud-ui";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { TaskGroupedList } from "./task-grouped-list";
import {
  nextTaskPipelineOrder,
  taskBoardStatuses,
  taskFormValuesForPipeline,
} from "../task-pipeline-order";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { listOrganizationMembers } from "@/domains/organization/api/clerk-organization-api";
import {
  createTaskRequest,
  deleteTaskRequest,
  updateTaskRequest,
  useTaskQuery,
  useTasksQuery,
} from "../api/tasks";
import type {
  TaskFormValues,
  TaskPriority,
  TaskRecord,
  TaskStatus,
} from "../tasks.types";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
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
import { Skeleton } from "@/components/ui/skeleton";

// ─── Constants ───────────────────────────────────────────────────────────────

const ownershipFilters = ["all", "assignedToMe", "sentByMe"] as const;
type OwnershipFilter = (typeof ownershipFilters)[number];

const STATUSES: TaskStatus[] = [
  "todo",
  "inProgress",
  "waiting",
  "done",
  "canceled",
];
const PRIORITIES: TaskPriority[] = ["low", "normal", "high", "urgent"];

function TaskBoardSkeleton() {
  return (
    <div className="flex gap-4">
      {taskBoardStatuses.map((status) => (
        <div
          key={status}
          className="flex w-[300px] shrink-0 flex-col rounded-2xl border border-border"
        >
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <Skeleton className="h-2.5 w-2.5 rounded-full" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
          <div className="flex flex-col gap-2 p-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

type TaskDocumentContext =
  | { scope: "global"; organizationId: string }
  | { scope: "project"; organizationId: string; projectId: string };

function taskDocumentContext(
  organizationId: string,
  routeProjectId?: string | null,
  taskProjectId?: string | null,
): TaskDocumentContext {
  const projectId = routeProjectId || taskProjectId || "";
  return projectId
    ? { scope: "project", organizationId, projectId }
    : { scope: "global", organizationId };
}

function taskHref(taskId: string, context?: TaskDocumentContext) {
  if (context?.scope === "project")
    return `/projects/${context.projectId}/tasks?taskId=${encodeURIComponent(taskId)}`;
  return `/tasks/${taskId}`;
}

function meetingDateTimeFromTask(task: TaskRecord) {
  const date = task.dueDate || format(new Date(), "yyyy-MM-dd");
  return { date, time: "10:00", endTime: "10:30" };
}

function withAppPrefix(prefix: string, href: string) {
  return `${prefix}${href.startsWith("/") ? href : `/${href}`}`;
}

function clientHref(clientId: string, appPrefix = "") {
  return withAppPrefix(
    appPrefix,
    `/clients?clientId=${encodeURIComponent(clientId)}`,
  );
}

function projectHref(projectId: string, appPrefix = "") {
  return withAppPrefix(appPrefix, `/projects/${projectId}`);
}

function useTaskMentionOptions({
  organizationId,
  context,
  members,
  tasks,
  appPrefix = "",
}: {
  organizationId?: string;
  context?: TaskDocumentContext;
  members: WorkOsPickerOption[];
  tasks: TaskRecord[];
  appPrefix?: string;
}) {
  const clients =
    useClientOptionsQuery(organizationId, {
      enabled: Boolean(organizationId),
    }) ?? [];
  const projectsResult = useProjectOptionsQueryResult(organizationId, {
    limit: 200,
  });
  const projects = projectsResult.data ?? [];

  return useMemo<DocEditorMentionOption[]>(() => {
    const taskOptions = [...tasks]
      .sort((a, b) => {
        if (context?.scope !== "project") return 0;
        const aScoped = a.projectId === context.projectId ? 0 : 1;
        const bScoped = b.projectId === context.projectId ? 0 : 1;
        return aScoped - bScoped;
      })
      .slice(0, 40)
      .map((task) => ({
        id: task.id,
        label: task.title,
        helper:
          task.projectId &&
          context?.scope === "project" &&
          task.projectId !== context.projectId
            ? "Task · another project"
            : "Task",
        type: "task" as const,
        href: withAppPrefix(
          appPrefix,
          taskHref(
            task.id,
            taskDocumentContext(
              context?.organizationId || organizationId || "",
              context?.scope === "project" ? context.projectId : task.projectId,
              task.projectId,
            ),
          ),
        ),
      }));

    return [
      ...members.map((m) => ({
        id: m.id,
        label: m.label,
        helper: m.helper || "Member",
        type: "member" as const,
        href: withAppPrefix(
          appPrefix,
          `/team?memberId=${encodeURIComponent(m.id)}`,
        ),
      })),
      ...clients.map((client) => ({
        id: client.id,
        label: client.name,
        helper: "Client",
        type: "client" as const,
        href: clientHref(client.id, appPrefix),
      })),
      ...projects.map((project) => ({
        id: project.id,
        label: project.name,
        helper:
          context?.scope === "project" && project.id === context.projectId
            ? "Current project"
            : "Project",
        type: "project" as const,
        href: projectHref(project.id, appPrefix),
      })),
      ...taskOptions,
    ];
  }, [appPrefix, clients, context, members, organizationId, projects, tasks]);
}

const STATUS_DOT: Record<TaskStatus, string> = {
  todo: "bg-[#A3A3A3]",
  inProgress: "bg-[#3B82F6]",
  waiting: "bg-[#F59E0B]",
  done: "bg-[#10B981]",
  canceled: "bg-[#6B6B6B]",
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: "text-text-muted",
  normal: "text-text-muted",
  high: "text-amber-500",
  urgent: "text-red-500",
};

const emptyTask: TaskFormValues = {
  title: "Untitled task",
  status: "todo",
  priority: "normal",
  visibility: "team",
  assigneeUserId: "",
  clientId: "",
  projectId: "",
  dueDate: "",
  description: "",
  tags: "",
};

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

// ─── Inline metadata controls ─────────────────────────────────────────────────

/** Status picker rendered as a small pill button inside the doc-editor row */
function StatusPicker({
  value,
  onChange,
  t,
}: {
  value: TaskStatus;
  onChange: (v: TaskStatus) => void;
  t: ReturnType<typeof useTranslations<"Tasks">>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <span
              className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[value])}
            />
            {t(`statuses.${value}`)}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-44 p-1 rounded-xl border-border bg-card shadow-lg"
      >
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              onChange(s);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors hover:bg-muted",
              s === value ? "text-foreground" : "text-text-muted",
            )}
          >
            <span
              className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[s])}
            />
            {t(`statuses.${s}`)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/** Priority picker */
function PriorityPicker({
  value,
  onChange,
  t,
}: {
  value: TaskPriority;
  onChange: (v: TaskPriority) => void;
  t: ReturnType<typeof useTranslations<"Tasks">>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Flag className={cn("h-3 w-3 shrink-0", PRIORITY_COLOR[value])} />
            {t(`priorities.${value}`)}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-40 p-1 rounded-xl border-border bg-card shadow-lg"
      >
        {PRIORITIES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              onChange(p);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors hover:bg-muted",
              p === value ? "text-foreground" : "text-text-muted",
            )}
          >
            <Flag className={cn("h-3 w-3 shrink-0", PRIORITY_COLOR[p])} />
            {t(`priorities.${p}`)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/** Due-date picker */
function DueDatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <CalendarDays className="h-3 w-3 shrink-0 text-text-muted" />
            {date ? (
              format(date, "MMM d, yyyy")
            ) : (
              <span className="text-text-muted">Set due date</span>
            )}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-auto p-0 rounded-xl border-border"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ? d.toISOString().slice(0, 10) : "");
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Assignee picker */
function AssigneePicker({
  value,
  onChange,
  options,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  options: WorkOsPickerOption[];
  t: ReturnType<typeof useTranslations<"Tasks">>;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = options.find((o) => o.id === value);
  const filtered = q
    ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()))
    : options;
  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQ("");
      }}
    >
      <PopoverTrigger
        render={
          <button
            type="button"
            className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <UserRound className="h-3 w-3 shrink-0 text-text-muted" />
            {selected?.label ?? (
              <span className="text-text-muted">Unassigned</span>
            )}
          </button>
        }
      />
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-60 p-1.5 rounded-xl border-border bg-card shadow-lg"
      >
        <div className="mb-1.5 flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5">
          <Search className="h-3 w-3 shrink-0 text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("form.searchPeople")}
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-text-muted"
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-text-muted hover:bg-muted transition-colors"
          >
            <X className="h-3 w-3" /> {t("form.unassigned")}
          </button>
        )}
        {filtered.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => {
              onChange(o.id);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors hover:bg-muted",
              o.id === value ? "text-foreground" : "text-text-muted",
            )}
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-black text-primary">
              {o.label.charAt(0).toUpperCase()}
            </div>
            <span className="truncate">{o.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

// ─── Task Editor panel ────────────────────────────────────────────────────────

/**
 * Renders the doc-editor for a single task.
 * Used both inside the split-pane TasksScreen and standalone TaskDetailScreen.
 */
function TaskEditor({
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
    setBusyId("patch");
    try {
      await updateTaskRequest(organizationId, task.id, draft);
      await queryClient.invalidateQueries({
        queryKey: ["task", organizationId, task.id],
      });
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (typeof window !== "undefined")
        window.localStorage.removeItem(storageKey);
      toast.toast({ title: "Task document saved.", type: "success" });
      onSaved?.();
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
    setBusyId("delete");
    try {
      await deleteTaskRequest(organizationId, task.id);
      await queryClient.invalidateQueries({ queryKey: ["tasks"] });
      onDeleted?.();
      if (showBackLink) router.push("/tasks");
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

// ─── Shared member-options hook ───────────────────────────────────────────────

function useMemberOptions(
  organizationId?: string,
  currentUser?: { id: string; name: string; email: string },
) {
  const [members, setMembers] = useState<WorkOsPickerOption[]>([]);
  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    listOrganizationMembers(organizationId)
      .then((list) => {
        if (!active) return;
        const mapped = list.map((m) => ({
          id: m.userId,
          label: m.user?.name || m.user?.email || m.userId,
          helper: m.user?.email || m.role,
        }));
        if (currentUser?.id && !mapped.some((m) => m.id === currentUser.id)) {
          mapped.unshift({
            id: currentUser.id,
            label: `${currentUser.name || currentUser.email || "Me"} (me)`,
            helper: currentUser.email || "You",
          });
        }
        setMembers(mapped);
      })
      .catch(() => {
        if (active) setMembers([]);
      });
    return () => {
      active = false;
    };
  }, [currentUser?.email, currentUser?.id, currentUser?.name, organizationId]);
  return members;
}

// ─── TasksScreen (split-pane) ─────────────────────────────────────────────────

export function TasksScreen({
  projectId: projectIdProp,
}: { hideShell?: boolean; projectId?: string | null } = {}) {
  const t = useTranslations("Tasks");
  const common = useTranslations("Common");
  const account = useAccountContext();
  const queryClient = useQueryClient();
  const workspaceStatus = account.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (account.workspace.organizationId ?? undefined)
      : undefined;

  const statusTabs = useMemo<
    Array<{ value: TaskStatus | "all"; label: string }>
  >(
    () => [
      { value: "all", label: t("filters.allStatuses") },
      { value: "todo", label: t("statuses.todo") },
      { value: "inProgress", label: t("statuses.inProgress") },
      { value: "waiting", label: t("statuses.waiting") },
      { value: "done", label: t("statuses.done") },
    ],
    [t],
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [ownership, setOwnership] = useState<OwnershipFilter>("all");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [selectedId, setSelectedIdState] = useState<string | null>(
    searchParams.get("taskId"),
  );
  const appPrefix = useMemo(() => {
    const first = pathname.split("/").filter(Boolean)[0];
    return first && /^[a-z]{2}(?:-[A-Z]{2})?$/.test(first) ? `/${first}` : "";
  }, [pathname]);

  const projectIdFromUrl = useCurrentProjectId();
  const projectId =
    projectIdProp !== undefined ? projectIdProp : projectIdFromUrl;

  const setSelectedId = useCallback(
    (id: string | null) => {
      setSelectedIdState(id);
      const params = new URLSearchParams(searchParams.toString());
      if (id) params.set("taskId", id);
      else params.delete("taskId");
      const next = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.replace(next as never, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    setSelectedIdState(searchParams.get("taskId"));
  }, [searchParams]);

  const queriedTasks = useTasksQuery(organizationId, {
    status: "all",
    search,
    projectId: projectId ?? null,
  });
  const tasks = useMemo(() => queriedTasks ?? [], [queriedTasks]);
  const memberOptions = useMemberOptions(organizationId, account.user);
  const listDocumentContext = organizationId
    ? taskDocumentContext(organizationId, projectId, null)
    : undefined;
  const mentionOptions = useTaskMentionOptions({
    organizationId,
    context: listDocumentContext,
    members: memberOptions,
    tasks,
    appPrefix,
  });

  const filteredTasks = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (
        needle &&
        ![
          task.title,
          task.description,
          task.assigneeUserId,
          ...(task.tags ?? []),
        ].some((v) => v?.toLowerCase().includes(needle))
      )
        return false;
      if (ownership === "assignedToMe")
        return task.assigneeUserId === account.user.id;
      if (ownership === "sentByMe")
        return task.createdByUserId === account.user.id;
      return true;
    });
  }, [search, tasks, ownership, account.user.id]);

  // The task currently open in the right pane
  const selectedTask = useMemo(
    () => filteredTasks.find((t) => t.id === selectedId) ?? null,
    [filteredTasks, selectedId],
  );

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  const moveTaskMutation = useMutation({
    mutationFn: async (variables: {
      organizationId: string;
      task: TaskRecord;
      status: TaskStatus;
      statusTasks: TaskRecord[];
      targetIndex: number;
    }) => {
      // prettier-ignore
      const pipelineOrder = nextTaskPipelineOrder(variables.statusTasks, variables.task.id, variables.targetIndex);
      // prettier-ignore
      return updateTaskRequest(variables.organizationId, variables.task.id, taskFormValuesForPipeline(variables.task, variables.status, pipelineOrder));
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["tasks", variables.organizationId] });
      const previousEntries = queryClient.getQueriesData<TaskRecord[]>({ queryKey: ["tasks", variables.organizationId] });
      const pipelineOrder = nextTaskPipelineOrder(variables.statusTasks, variables.task.id, variables.targetIndex);
      queryClient.setQueriesData<TaskRecord[]>(
        { queryKey: ["tasks", variables.organizationId] },
        (data) => data?.map((t) => t.id === variables.task.id ? { ...t, status: variables.status, pipelineOrder } : t),
      );
      return { previousEntries };
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", variables?.organizationId] });
      queryClient.invalidateQueries({ queryKey: ["tasks-stats", variables?.organizationId] });
    },
  });

  function handleTaskDrop(
    taskId: string,
    newStatus: TaskStatus,
    targetIndex: number,
  ) {
    if (!organizationId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const statusTasks = tasks.filter(
      (candidate) => candidate.status === newStatus,
    );
    moveTaskMutation.mutate({
      organizationId,
      task,
      status: newStatus,
      statusTasks,
      targetIndex,
    });
  }

  async function createNewTask() {
    if (!organizationId) return;
    const result = await createTaskRequest(organizationId, {
      ...emptyTask,
      projectId: projectId ?? "",
    });
    await refresh();
    setSelectedId(result.task.id);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Page header ── */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-8 h-14 sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-semibold text-foreground shrink-0 tracking-tight">
            {t("title")}
          </h1>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="inline-flex items-center rounded-xl border border-border bg-card p-0.5 gap-0.5">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  "h-6 rounded-lg px-2.5 text-[11px] font-semibold transition-all",
                  statusFilter === tab.value
                    ? "bg-foreground text-background shadow-sm"
                    : "text-text-muted hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="h-3.5 w-3.5 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={common("search")}
              className="h-full w-32 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-text-muted"
            />
          </div>
          <select
            value={ownership}
            onChange={(event) =>
              setOwnership(event.target.value as OwnershipFilter)
            }
            className="h-8 rounded-xl border border-border bg-card px-2.5 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring/20"
          >
            {ownershipFilters.map((f) => (
              <option key={f} value={f}>
                {f === "all"
                  ? t("filters.allOwners")
                  : f === "assignedToMe"
                    ? t("filters.assignedToMe")
                    : t("filters.sentByMe")}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={createNewTask}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {t("actions.new")}
          </button>
        </div>
      </div>

      {/* ── Body: board + optional right editor pane ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: task board (shrinks when editor is open) */}
        <div
          className={cn(
            "flex flex-1 flex-col overflow-hidden transition-all duration-300",
            selectedTask && "blur-[1.5px]",
          )}
        >
          <div className="flex-1 overflow-auto p-6">
            {workspaceStatus !== "ready" ? (
              <WorkspaceQueryState status={workspaceStatus} variant="table" />
            ) : queriedTasks === undefined ? (
              <TaskBoardSkeleton />
            ) : filteredTasks.length === 0 ? (
              <EmptyWorkspace
                icon={ListTodo}
                title={t("empty.title")}
                description={t("empty.description")}
              />
            ) : (
              <TaskGroupedList
                tasks={filteredTasks}
                statusFilter={statusFilter}
                onTaskDrop={handleTaskDrop}
                onTaskClick={(id) =>
                  setSelectedId(id === selectedId ? null : id)
                }
                selectedId={selectedId ?? undefined}
              />
            )}
          </div>
        </div>

        {/* Right: overlay document drawer */}
        {selectedTask && organizationId && (
          <div className="fixed inset-0 z-40">
            <button
              type="button"
              aria-label="Close task document"
              className="absolute inset-0 cursor-default bg-black/20 backdrop-blur-[2px] dark:bg-black/45"
              onClick={() => setSelectedId(null)}
            />
            <div className="absolute inset-y-0 end-0 w-full max-w-[min(96vw,980px)] overflow-hidden border-s border-border bg-background shadow-2xl">
              <TaskEditor
                key={selectedTask.id}
                task={selectedTask}
                organizationId={organizationId}
                memberOptions={memberOptions}
                mentionOptions={mentionOptions}
                onClose={() => setSelectedId(null)}
                onSaved={refresh}
                onDeleted={() => {
                  setSelectedId(null);
                  refresh();
                }}
                routeProjectId={projectId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TaskDetailScreen (standalone full-page) ──────────────────────────────────

export function TaskDetailScreen({ id }: { id: string }) {
  const t = useTranslations("Tasks");
  const pathname = usePathname();
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const organizationId =
    workspaceStatus === "ready"
      ? (account.workspace.organizationId ?? undefined)
      : undefined;
  const task = useTaskQuery(organizationId, id);
  const memberOptions = useMemberOptions(organizationId, account.user);
  const detailTasks =
    useTasksQuery(organizationId, {
      status: "all",
      projectId: task?.projectId ?? null,
    }) ?? [];
  const detailContext =
    organizationId && task
      ? taskDocumentContext(organizationId, task.projectId, task.projectId)
      : undefined;
  const detailAppPrefix = useMemo(() => {
    const first = pathname.split("/").filter(Boolean)[0];
    return first && /^[a-z]{2}(?:-[A-Z]{2})?$/.test(first) ? `/${first}` : "";
  }, [pathname]);
  const mentionOptions = useTaskMentionOptions({
    organizationId,
    context: detailContext,
    members: memberOptions,
    tasks: detailTasks,
    appPrefix: detailAppPrefix,
  });

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex h-full flex-col">
        <WorkspaceQueryState status={workspaceStatus} variant="detail" />
      </div>
    );
  }

  if (task === undefined) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
      </div>
    );
  }

  if (task === null) {
    return (
      <div className="p-8">
        <DetailNotFoundState
          title={t("detail.notFoundTitle")}
          description={t("detail.notFoundDescription")}
          backHref="/tasks"
          backLabel={t("detail.backToTasks")}
        />
      </div>
    );
  }

  if (!organizationId) return null;

  return (
    <div className="flex h-full flex-col">
      <TaskEditor
        key={task.id}
        task={task}
        organizationId={organizationId}
        memberOptions={memberOptions}
        mentionOptions={mentionOptions}
        showBackLink
      />
    </div>
  );
}
