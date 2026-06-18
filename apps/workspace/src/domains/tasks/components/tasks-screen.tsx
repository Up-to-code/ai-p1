"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, CalendarDays, CheckCircle2, Circle,
  Flag, ListTodo, Plus, Search, Trash2, UserRound, X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import { WorkOsDocEditor, type DocEditorMetaField } from "@/components/shared/work-os-doc-editor";
import {
  DetailNotFoundState, EmptyWorkspace,
  WorkspaceQueryState, DeleteRecordDialog,
} from "@/components/shared/crud-ui";
import { Link, useRouter } from "@/i18n/routing";
import { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { TaskGroupedList } from "./task-grouped-list";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { listOrganizationMembers } from "@/domains/organization/api/clerk-organization-api";
import {
  createTaskRequest, deleteTaskRequest,
  updateTaskRequest, useTaskQuery, useTasksQuery,
} from "../api/tasks";
import type { TaskFormValues, TaskPriority, TaskRecord, TaskStatus } from "../tasks.types";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUSES: TaskStatus[] = ["todo", "inProgress", "waiting", "done", "canceled"];
const PRIORITIES: TaskPriority[] = ["low", "normal", "high", "urgent"];

const STATUS_DOT: Record<TaskStatus, string> = {
  todo:       "bg-[#A3A3A3]",
  inProgress: "bg-[#3B82F6]",
  waiting:    "bg-[#F59E0B]",
  done:       "bg-[#10B981]",
  canceled:   "bg-[#6B6B6B]",
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low:    "text-text-muted",
  normal: "text-text-muted",
  high:   "text-amber-500",
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
  value, onChange, t,
}: { value: TaskStatus; onChange: (v: TaskStatus) => void; t: ReturnType<typeof useTranslations<"Tasks">> }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
      >
        <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[value])} />
        {t(`statuses.${value}`)}
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-44 p-1 rounded-xl border-border bg-card shadow-lg">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { onChange(s); setOpen(false); }}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors hover:bg-muted",
              s === value ? "text-foreground" : "text-text-muted",
            )}
          >
            <span className={cn("h-2 w-2 rounded-full shrink-0", STATUS_DOT[s])} />
            {t(`statuses.${s}`)}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

/** Priority picker */
function PriorityPicker({
  value, onChange, t,
}: { value: TaskPriority; onChange: (v: TaskPriority) => void; t: ReturnType<typeof useTranslations<"Tasks">> }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
      >
        <Flag className={cn("h-3 w-3 shrink-0", PRIORITY_COLOR[value])} />
        {t(`priorities.${value}`)}
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-40 p-1 rounded-xl border-border bg-card shadow-lg">
        {PRIORITIES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { onChange(p); setOpen(false); }}
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
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
      >
        <CalendarDays className="h-3 w-3 shrink-0 text-text-muted" />
        {date ? format(date, "MMM d, yyyy") : <span className="text-text-muted">Set due date</span>}
        {value && (
          <span
            role="button"
            tabIndex={0}
            className="ms-1 text-text-muted hover:text-foreground"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onChange(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") onChange(""); }}
          >
            <X className="h-2.5 w-2.5" />
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-auto p-0 rounded-xl border-border">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => { onChange(d ? d.toISOString().slice(0, 10) : ""); setOpen(false); }}
        />
      </PopoverContent>
    </Popover>
  );
}

/** Assignee picker */
function AssigneePicker({
  value, onChange, options, t,
}: {
  value: string;
  onChange: (v: string) => void;
  options: WorkOsPickerOption[];
  t: ReturnType<typeof useTranslations<"Tasks">>;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const selected = options.find((o) => o.id === value);
  const filtered = q ? options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase())) : options;
  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQ(""); }}>
      <PopoverTrigger
        className="inline-flex h-7 items-center gap-2 rounded-lg border border-border bg-card px-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
      >
        <UserRound className="h-3 w-3 shrink-0 text-text-muted" />
        {selected?.label ?? <span className="text-text-muted">Unassigned</span>}
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={4} className="w-60 p-1.5 rounded-xl border-border bg-card shadow-lg">
        <div className="mb-1.5 flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5">
          <Search className="h-3 w-3 shrink-0 text-text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("form.searchPeople")}
            className="flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-text-muted" />
        </div>
        {value && (
          <button type="button" onClick={() => { onChange(""); setOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-text-muted hover:bg-muted transition-colors">
            <X className="h-3 w-3" /> {t("form.unassigned")}
          </button>
        )}
        {filtered.map((o) => (
          <button key={o.id} type="button" onClick={() => { onChange(o.id); setOpen(false); }}
            className={cn("flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition-colors hover:bg-muted",
              o.id === value ? "text-foreground" : "text-text-muted")}>
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
  onSaved,
  onDeleted,
  showBackLink = false,
}: {
  task: TaskRecord;
  organizationId: string;
  memberOptions: WorkOsPickerOption[];
  onSaved?: () => void;
  onDeleted?: () => void;
  showBackLink?: boolean;
}) {
  const t = useTranslations("Tasks");
  const router = useRouter();
  const queryClient = useQueryClient();

  // Local draft mirrors task — so optimistic changes feel instant
  const [draft, setDraft] = useState<TaskFormValues>(formFromTask(task));
  const [busyId, setBusyId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Keep draft in sync when task record refreshes from server
  useEffect(() => {
    setDraft(formFromTask(task));
  }, [task.id, task.updatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const patch = useCallback(
    async (partial: Partial<TaskFormValues>) => {
      const next = { ...draft, ...partial };
      setDraft(next);
      setBusyId("patch");
      try {
        await updateTaskRequest(organizationId, task.id, next);
        await queryClient.invalidateQueries({ queryKey: ["task", organizationId, task.id] });
        await queryClient.invalidateQueries({ queryKey: ["tasks"] });
        onSaved?.();
      } finally {
        setBusyId(null);
      }
    },
    [draft, organizationId, task.id, queryClient, onSaved],
  );

  const fields: DocEditorMetaField[] = [
    {
      key: "status",
      icon: <Circle className="h-3.5 w-3.5" />,
      label: t("form.status"),
      value: (
        <StatusPicker value={draft.status} onChange={(v) => patch({ status: v })} t={t} />
      ),
    },
    {
      key: "priority",
      icon: <Flag className="h-3.5 w-3.5" />,
      label: t("form.priority"),
      value: (
        <PriorityPicker value={draft.priority} onChange={(v) => patch({ priority: v })} t={t} />
      ),
    },
    {
      key: "assignee",
      icon: <UserRound className="h-3.5 w-3.5" />,
      label: t("form.assignee"),
      value: (
        <AssigneePicker
          value={draft.assigneeUserId}
          onChange={(v) => patch({ assigneeUserId: v })}
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
        <DueDatePicker value={draft.dueDate} onChange={(v) => patch({ dueDate: v })} />
      ),
    },
  ];

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
    <div className="flex h-full flex-col">
      {/* ── Mini header bar ── */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-background/80 backdrop-blur-xl px-6 h-11">
        {showBackLink ? (
          <Link href="/tasks"
            className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("title")}
          </Link>
        ) : (
          <span className="text-[11px] font-semibold text-text-muted truncate max-w-[260px]">
            {draft.title}
          </span>
        )}
        <div className="flex items-center gap-1.5 shrink-0">
          {busyId === "patch" && (
            <span className="text-[10px] text-text-muted animate-pulse">Saving…</span>
          )}
          <button
            type="button"
            onClick={() => setDeleting(true)}
            disabled={busyId === "delete"}
            className="flex h-7 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3 w-3" />
            {t("actions.deleteTask")}
          </button>
        </div>
      </div>

      {/* ── Doc editor ── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <WorkOsDocEditor
          title={draft.title}
          body={draft.description}
          fields={fields}
          titlePlaceholder={t("form.titlePlaceholder") || "Task title"}
          bodyPlaceholder={t("form.descriptionPlaceholder") || "Add description… Type / for commands"}
          isSaving={busyId === "patch"}
          onTitleBlur={(v) => { if (v !== draft.title) patch({ title: v }); }}
          onBodyBlur={(html) => { if (html !== draft.description) patch({ description: html }); }}
          mentionOptions={memberOptions.map((m) => ({ id: m.id, label: m.label, helper: m.helper }))}
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

function useMemberOptions(organizationId?: string) {
  const [members, setMembers] = useState<WorkOsPickerOption[]>([]);
  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    listOrganizationMembers(organizationId).then((list) => {
      if (!active) return;
      setMembers(list.map((m) => ({
        id: m.userId,
        label: m.user?.name || m.user?.email || m.userId,
        helper: m.user?.email || m.role,
      })));
    }).catch(() => { if (active) setMembers([]); });
    return () => { active = false; };
  }, [organizationId]);
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
  const organizationId = workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;

  const statusTabs = useMemo<Array<{ value: TaskStatus | "all"; label: string }>>(() => [
    { value: "all",        label: t("filters.allStatuses") },
    { value: "todo",       label: t("statuses.todo") },
    { value: "inProgress", label: t("statuses.inProgress") },
    { value: "waiting",    label: t("statuses.waiting") },
    { value: "done",       label: t("statuses.done") },
  ], [t]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const projectIdFromUrl = useCurrentProjectId();
  const projectId = projectIdProp !== undefined ? projectIdProp : projectIdFromUrl;

  const queriedTasks = useTasksQuery(organizationId, { status: "all", search, projectId: projectId ?? null });
  const tasks = useMemo(() => queriedTasks ?? [], [queriedTasks]);
  const memberOptions = useMemberOptions(organizationId);

  const filteredTasks = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tasks.filter((task) =>
      !needle || [task.title, task.description, task.assigneeUserId, ...(task.tags ?? [])].some((v) => v?.toLowerCase().includes(needle))
    );
  }, [search, tasks]);

  // The task currently open in the right pane
  const selectedTask = useMemo(
    () => filteredTasks.find((t) => t.id === selectedId) ?? null,
    [filteredTasks, selectedId],
  );

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  async function handleTaskDrop(taskId: string, newStatus: TaskStatus) {
    if (!organizationId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    try {
      await updateTaskRequest(organizationId, taskId, { ...formFromTask(task), status: newStatus });
      await refresh();
    } catch {
      await refresh();
    }
  }

  async function createNewTask() {
    if (!organizationId) return;
    const result = await createTaskRequest(organizationId, {
      ...emptyTask, projectId: projectId ?? "",
    });
    await refresh();
    setSelectedId(result.task.id);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Page header ── */}
      <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-background/80 backdrop-blur-xl px-8 h-14 sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-semibold text-foreground shrink-0 tracking-tight">{t("title")}</h1>
          <div className="h-4 w-px bg-border shrink-0" />
          <div className="inline-flex items-center rounded-xl border border-border bg-card p-0.5 gap-0.5">
            {statusTabs.map((tab) => (
              <button key={tab.value} type="button" onClick={() => setStatusFilter(tab.value)}
                className={cn("h-6 rounded-lg px-2.5 text-[11px] font-semibold transition-all",
                  statusFilter === tab.value ? "bg-foreground text-background shadow-sm" : "text-text-muted hover:text-foreground")}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex h-8 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:ring-2 focus-within:ring-ring/20">
            <Search className="h-3.5 w-3.5 text-text-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={common("search")}
              className="h-full w-32 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-text-muted" />
          </div>
          <button type="button" onClick={createNewTask}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" />
            {t("actions.new")}
          </button>
        </div>
      </div>

      {/* ── Body: board + optional right editor pane ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left: task board (shrinks when editor is open) */}
        <div className={cn(
          "flex flex-col overflow-hidden transition-all duration-300",
          selectedTask ? "w-[420px] shrink-0 border-e border-border" : "flex-1",
        )}>
          <div className="flex-1 overflow-auto p-6">
            {workspaceStatus !== "ready" ? (
              <WorkspaceQueryState status={workspaceStatus} variant="table" />
            ) : filteredTasks.length === 0 ? (
              <EmptyWorkspace icon={ListTodo} title={t("empty.title")} description={t("empty.description")} />
            ) : (
              <TaskGroupedList
                tasks={filteredTasks}
                statusFilter={statusFilter}
                onTaskDrop={handleTaskDrop}
                onTaskClick={(id) => setSelectedId(id === selectedId ? null : id)}
                selectedId={selectedId ?? undefined}
              />
            )}
          </div>
        </div>

        {/* Right: doc editor pane */}
        {selectedTask && organizationId && (
          <div className="min-w-0 flex-1 overflow-hidden">
            <TaskEditor
              key={selectedTask.id}
              task={selectedTask}
              organizationId={organizationId}
              memberOptions={memberOptions}
              onSaved={refresh}
              onDeleted={() => { setSelectedId(null); refresh(); }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TaskDetailScreen (standalone full-page) ──────────────────────────────────

export function TaskDetailScreen({ id }: { id: string }) {
  const t = useTranslations("Tasks");
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const organizationId = workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const task = useTaskQuery(organizationId, id);
  const memberOptions = useMemberOptions(organizationId);

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex h-full flex-col">
        <WorkspaceQueryState status={workspaceStatus} variant="detail" />
      </div>
    );
  }

  if (task === undefined) {
    return <div className="flex h-full items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" /></div>;
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
        showBackLink
      />
    </div>
  );
}
