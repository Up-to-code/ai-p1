"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CheckCircle2, Flag, ListTodo, Plus, Search, Trash2, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppPageShell, AppPrimaryButton } from "@/components/shared";
import { useAccountContext } from "@/domains/auth";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DetailNotFoundState,
  EmptyWorkspace,
  FormActions,
  SelectField,
  TextInput,
  WorkspaceQueryState,
} from "@/components/shared/crud-ui";
import { Link, useRouter } from "@/i18n/routing";
import { WorkOsRecordDrawer } from "@/domains/work-os/components/work-os-record-drawer";
import { WorkOsRecordPicker, type WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { InlineTaskCreator } from "./inline-task-creator";
import { TaskGroupedList } from "./task-grouped-list";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { useWorkspaceStore } from "@/domains/dashboard/store/dashboard.store";
import { listOrganizationMembers } from "@/domains/organization/api/clerk-organization-api";
import {
  createTaskRequest,
  deleteTaskRequest,
  updateTaskRequest,
  useTaskQuery,
  useTaskStatsQuery,
  useTasksQuery,
} from "../api/tasks";
import type {
  TaskFormValues,
  TaskPriority,
  TaskRecord,
  TaskStatus,
  TaskVisibility,
} from "../tasks.types";
import { cn } from "@/lib/utils";

const statuses: TaskStatus[] = ["todo", "inProgress", "waiting", "done", "canceled"];
const priorities: TaskPriority[] = ["low", "normal", "high", "urgent"];
const visibilities: TaskVisibility[] = ["private", "team", "workspace"];

const emptyTask: TaskFormValues = {
  title: "",
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

function TaskForm({
  initialValues,
  isSubmitting,
  submitLabel,
  assigneeOptions,
  clientOptions,
  projectOptions,
  onCancel,
  onSubmit,
}: {
  initialValues: TaskFormValues;
  isSubmitting: boolean;
  submitLabel: string;
  assigneeOptions: WorkOsPickerOption[];
  clientOptions: WorkOsPickerOption[];
  projectOptions: WorkOsPickerOption[];
  onCancel?: () => void;
  onSubmit: (values: TaskFormValues) => void;
}) {
  const t = useTranslations("Tasks");
  const common = useTranslations("Common");
  const [values, setValues] = useState(initialValues);
  const statusOptions = statuses.map((value) => ({ value, label: t(`statuses.${value}`) }));
  const priorityOptions = priorities.map((value) => ({ value, label: t(`priorities.${value}`) }));
  const visibilityOptions = visibilities.map((value) => ({ value, label: t(`visibilities.${value}`) }));

  function patch<TName extends keyof TaskFormValues>(name: TName, value: TaskFormValues[TName]) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <TextInput label={t("form.title")} value={values.title} onChange={(value) => patch("title", value)} />
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField label={t("form.status")} value={values.status} options={statusOptions} onChange={(value) => patch("status", value)} />
        <SelectField label={t("form.priority")} value={values.priority} options={priorityOptions} onChange={(value) => patch("priority", value)} />
        <SelectField label={t("form.visibility")} value={values.visibility} options={visibilityOptions} onChange={(value) => patch("visibility", value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <WorkOsRecordPicker label={t("form.assignee")} value={values.assigneeUserId} options={assigneeOptions} placeholder={t("form.assigneePlaceholder")} searchPlaceholder={t("form.searchPeople")} emptyLabel={t("form.noPeople")} clearLabel={t("form.unassigned")} closeLabel={common("finish")} onChange={(value) => patch("assigneeUserId", value)} />
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-zinc-900 dark:text-white">{t("form.dueDate")}</label>
          <DatePicker 
            date={values.dueDate ? new Date(values.dueDate) : undefined} 
            setDate={(date) => patch("dueDate", date ? date.toISOString().slice(0, 10) : "")} 
            className="w-full h-11 rounded-xl bg-zinc-50 border-zinc-200/70 hover:bg-zinc-100 dark:bg-white/[0.02] dark:border-white/[0.06] dark:hover:bg-white/[0.04]"
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <WorkOsRecordPicker label={t("form.client")} value={values.clientId} options={clientOptions} placeholder={t("form.clientPlaceholder")} searchPlaceholder={t("form.searchClients")} emptyLabel={t("form.noClients")} clearLabel={t("form.noClient")} closeLabel={common("finish")} onChange={(value) => patch("clientId", value)} />
        <WorkOsRecordPicker label={t("form.project")} value={values.projectId} options={projectOptions} placeholder={t("form.projectPlaceholder")} searchPlaceholder={t("form.searchProjects")} emptyLabel={t("form.noProjects")} clearLabel={t("form.noProject")} closeLabel={common("finish")} onChange={(value) => patch("projectId", value)} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-zinc-900 dark:text-white">{t("form.description")}</label>
        <TiptapEditor value={values.description} onChange={(value) => patch("description", value)} />
      </div>
      {onCancel ? (
        <FormActions onCancel={onCancel} submitLabel={submitLabel} isSubmitting={isSubmitting} />
      ) : (
        <AppPrimaryButton type="submit" disabled={isSubmitting} className="h-11 px-6">
          {submitLabel}
        </AppPrimaryButton>
      )}
    </form>
  );
}



export function TasksScreen({ hideShell }: { hideShell?: boolean } = {}) {
  const t = useTranslations("Tasks");
  const common = useTranslations("Common");
  const account = useAccountContext();
  const queryClient = useQueryClient();
  const workspaceStatus = account.workspace.status;
  const organizationId = workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;

  const statusTabs = useMemo<Array<{ value: TaskStatus | "all"; label: string }>>(() => [
    { value: "all", label: t("filters.allStatuses") },
    { value: "todo", label: t("statuses.todo") },
    { value: "inProgress", label: t("statuses.inProgress") },
    { value: "waiting", label: t("statuses.waiting") },
    { value: "done", label: t("statuses.done") },
  ], [t]);
  const [memberOptions, setMemberOptions] = useState<WorkOsPickerOption[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { activeProjectId } = useWorkspaceStore();
  const isFormDrawerOpen = Boolean(editing);
  const queriedTasks = useTasksQuery(organizationId, { status: "all", search, projectId: activeProjectId });
  const tasks = useMemo(() => queriedTasks ?? [], [queriedTasks]);
  const rawClientOptions = useClientOptionsQuery(organizationId, { enabled: Boolean(organizationId) });
  const clientOptions = useMemo(() => rawClientOptions ?? [], [rawClientOptions]);
  const projectOptionsResult = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projectOptions = useMemo(() => projectOptionsResult.data ?? [], [projectOptionsResult.data]);
  const taskAssigneeOptions = useMemo(() => memberOptions, [memberOptions]);
  const taskClientOptions = useMemo(() => clientOptions.map((client) => ({ id: client.id, label: client.name })), [clientOptions]);
  const taskProjectOptions = useMemo(() => projectOptions.map((project) => ({ id: project.id, label: project.name })), [projectOptions]);

  useEffect(() => {
    if (!organizationId) return;
    let active = true;
    listOrganizationMembers(organizationId)
      .then((members) => {
        if (!active) return;
        setMemberOptions(members.map((member) => ({
          id: member.userId,
          label: member.user?.name || member.user?.email || member.userId,
          helper: member.user?.email || member.role,
        })));
      })
      .catch(() => { if (active) setMemberOptions([]); });
    return () => { active = false; };
  }, [organizationId]);

  const filteredTasks = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tasks.filter((task) =>
      !needle || [task.title, task.description, task.assigneeUserId, ...(task.tags ?? [])].some((v) => v?.toLowerCase().includes(needle))
    );
  }, [search, tasks]);

  async function handleTaskDrop(taskId: string, newStatus: TaskStatus) {
    if (!organizationId) return;
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
    try {
      await updateTaskRequest(organizationId, taskId, {
        ...formFromTask(taskToUpdate),
        status: newStatus
      });
      await refresh();
    } catch (err) {
      // On error, refresh to revert optimistic UI update
      await refresh();
    }
  }

  function closeFormDrawer() {
    setIsCreateOpen(false);
    setEditing(null);
  }

  async function create(values: TaskFormValues) {
    if (!organizationId) return;
    setBusyId("create");
    try {
      await createTaskRequest(organizationId, values);
      setIsCreateOpen(false);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function update(values: TaskFormValues) {
    if (!organizationId || !editing) return;
    setBusyId(editing.id);
    try {
      await updateTaskRequest(organizationId, editing.id, values);
      setEditing(null);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    await queryClient.invalidateQueries({ queryKey: ["tasks-stats"] });
  }

  function openCreateDrawer() {
    setEditing(null);
    setIsCreateOpen(true);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-auto p-6 md:p-8 lg:px-12">
        {workspaceStatus !== "ready" ? (
          <WorkspaceQueryState status={workspaceStatus} variant="table" />
        ) : (
          <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-8">
            {/* Toolbar: status tabs + search + new task */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Status Tab Filters */}
              <div className="flex items-center gap-1 rounded-xl border border-zinc-200/70 bg-zinc-50 p-1 dark:border-white/[0.06] dark:bg-white/[0.03]">
                {statusTabs.map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setStatusFilter(tab.value)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors",
                      statusFilter === tab.value
                        ? "bg-white text-zinc-900 shadow-sm dark:bg-white/[0.08] dark:text-white"
                        : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Right: search + new task */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 items-center gap-2 rounded-xl border border-zinc-200/70 bg-white px-3 dark:border-white/[0.06] dark:bg-white/[0.03]">
                  <Search className="h-3.5 w-3.5 text-zinc-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={common("search")}
                    className="h-full w-36 bg-transparent text-xs font-medium text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
                  />
                </div>
                <AppPrimaryButton onClick={openCreateDrawer} className="h-8 rounded-xl px-3 text-xs">
                  <Plus className="me-1.5 h-3.5 w-3.5" />
                  {t("actions.new")}
                </AppPrimaryButton>
              </div>
            </div>

            {/* Board */}
            {isCreateOpen && (
              <InlineTaskCreator
                onSubmit={create}
                onCancel={closeFormDrawer}
                isSubmitting={busyId === "create"}
                assigneeOptions={taskAssigneeOptions}
                defaultProjectId={activeProjectId ?? undefined}
              />
            )}
            {filteredTasks.length === 0 ? (
              <EmptyWorkspace icon={ListTodo} title={t("empty.title")} description={t("empty.description")} />
            ) : (
              <TaskGroupedList tasks={filteredTasks} statusFilter={statusFilter} onTaskDrop={handleTaskDrop} />
            )}
          </div>
        )}
      </div>

      <WorkOsRecordDrawer
        open={isFormDrawerOpen}
        eyebrow={t("eyebrow")}
        title={editing ? t("drawer.edit") : t("drawer.create")}
        description={t("drawer.description")}
        onOpenChange={(open) => {
          if (!open) closeFormDrawer();
          if (open && !editing) setIsCreateOpen(true);
        }}
      >
        {editing ? (
          <TaskForm key={editing.id} initialValues={formFromTask(editing)} isSubmitting={busyId === editing.id} submitLabel={t("actions.save")} assigneeOptions={taskAssigneeOptions} clientOptions={taskClientOptions} projectOptions={taskProjectOptions} onCancel={closeFormDrawer} onSubmit={update} />
        ) : (
          <TaskForm key="create" initialValues={{ ...emptyTask, projectId: activeProjectId ?? "" }} isSubmitting={busyId === "create"} submitLabel={t("actions.create")} assigneeOptions={taskAssigneeOptions} clientOptions={taskClientOptions} projectOptions={taskProjectOptions} onCancel={closeFormDrawer} onSubmit={create} />
        )}
      </WorkOsRecordDrawer>
    </div>
  );
}

// ─── Task Detail Screen ──────────────────────────────────────────────────────

export function TaskDetailScreen({ id }: { id: string }) {
  const t = useTranslations("Tasks");
  const account = useAccountContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const workspaceStatus = account.workspace.status;
  const organizationId = workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const task = useTaskQuery(organizationId, id);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["task", organizationId, id] });
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
  }

  async function toggleDone() {
    if (!organizationId || !task) return;
    setBusyId(task.id);
    try {
      await updateTaskRequest(organizationId, task.id, {
        title: task.title,
        status: task.status === "done" ? "todo" : "done",
        priority: task.priority,
        visibility: task.visibility ?? "team",
        assigneeUserId: task.assigneeUserId ?? "",
        clientId: task.clientId ?? "",
        projectId: task.projectId ?? "",
        dueDate: task.dueDate ?? "",
        description: task.description ?? "",
        tags: (task.tags ?? []).join(", "),
      });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!organizationId || !task || !window.confirm(`${t("actions.deleteTask")} ${task.title}?`)) return;
    setBusyId(task.id);
    try {
      await deleteTaskRequest(organizationId, task.id);
      await refresh();
      router.push("/tasks");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AppPageShell>
      {/* Breadcrumb bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/tasks" className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" />
          {t("title")}
        </Link>
        {task && (
          <button
            onClick={remove}
            disabled={busyId === task.id}
            className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("actions.deleteTask")}
          </button>
        )}
      </div>

      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="detail" />
      ) : task === undefined ? (
        <div className="min-h-52" />
      ) : task === null ? (
        <DetailNotFoundState title={t("detail.notFoundTitle")} description={t("detail.notFoundDescription")} backHref="/tasks" backLabel={t("detail.backToTasks")} />
      ) : (
        <div className="max-w-2xl space-y-6">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">{task.title}</h1>

          <div className="grid gap-4">
            {/* Status */}
            <div className="flex items-center gap-4">
              <div className="flex w-28 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <CheckCircle2 className="h-4 w-4" /> {t("form.status")}
              </div>
              <button
                onClick={toggleDone}
                disabled={busyId === task.id}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-300"
              >
                {task.status === "done" ? t("statuses.done") : t(`statuses.${task.status}`)}
                {task.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              </button>
            </div>

            {/* Priority */}
            <div className="flex items-center gap-4">
              <div className="flex w-28 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                <Flag className="h-4 w-4" /> {t("form.priority")}
              </div>
              <span className="text-sm font-medium text-zinc-900 dark:text-white">{t(`priorities.${task.priority}`)}</span>
            </div>

            {/* Due date */}
            {task.dueDate && (
              <div className="flex items-center gap-4">
                <div className="flex w-28 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <CalendarDays className="h-4 w-4" /> {t("form.dueDate")}
                </div>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{task.dueDate}</span>
              </div>
            )}

            {/* Description */}
            {task.description && (
              <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-white/[0.06]">
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{task.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AppPageShell>
  );
}
