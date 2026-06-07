"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CalendarDays, CheckCircle2, List, ListTodo, Plus, Search, Trash2, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { AppDataTable, AppPageHeader, AppPageShell, AppPrimaryButton, AppSection, AppStatsGrid, type AppDataTableColumn } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useAccountContext } from "@/domains/auth";
import { DetailNotFoundState, EmptyWorkspace, FormActions, SelectField, StatusPill, TextInput, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { Link, useRouter } from "@/i18n/routing";
import { WorkOsRecordDrawer } from "@/domains/work-os/components/work-os-record-drawer";
import { WorkOsRecordPicker, type WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useProjectOptionsQueryResult } from "@/domains/projects/api/projects";
import { listOrganizationMembers } from "@/domains/organization/api/clerk-organization-api";
import { createTaskRequest, deleteTaskRequest, updateTaskRequest, useTaskQuery, useTaskStatsQuery, useTasksQuery } from "../api/tasks";
import type { TaskFormValues, TaskPriority, TaskRecord, TaskStatus, TaskVisibility } from "../tasks.types";
import { nextTaskPipelineOrder, sortPipelineTasks, taskBoardStatuses, taskFormValuesForPipeline } from "../task-pipeline-order";
import { cn } from "@/lib/utils";

const statuses: TaskStatus[] = ["todo", "inProgress", "waiting", "done", "canceled"];
const priorities: TaskPriority[] = ["low", "normal", "high", "urgent"];
const visibilities: TaskVisibility[] = ["private", "team", "workspace"];
const ownershipFilters = ["all", "assignedToMe", "sentByMe"] as const;

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

function statusTone(status: TaskStatus) {
  if (status === "done") return "success" as const;
  if (status === "waiting") return "warning" as const;
  if (status === "canceled") return "neutral" as const;
  return "info" as const;
}

function priorityTone(priority: TaskPriority) {
  if (priority === "urgent") return "danger" as const;
  if (priority === "high") return "warning" as const;
  return "neutral" as const;
}

function isDueToday(task: TaskRecord) {
  if (!task.dueDate) return false;
  return task.dueDate === new Date().toISOString().slice(0, 10);
}

function isOverdue(task: TaskRecord) {
  if (!task.dueDate || task.status === "done" || task.status === "canceled") return false;
  return Date.parse(task.dueDate) < Date.parse(new Date().toISOString().slice(0, 10));
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
        <TextInput label={t("form.dueDate")} type="date" value={values.dueDate} onChange={(value) => patch("dueDate", value)} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <WorkOsRecordPicker label={t("form.client")} value={values.clientId} options={clientOptions} placeholder={t("form.clientPlaceholder")} searchPlaceholder={t("form.searchClients")} emptyLabel={t("form.noClients")} clearLabel={t("form.noClient")} closeLabel={common("finish")} onChange={(value) => patch("clientId", value)} />
        <WorkOsRecordPicker label={t("form.project")} value={values.projectId} options={projectOptions} placeholder={t("form.projectPlaceholder")} searchPlaceholder={t("form.searchProjects")} emptyLabel={t("form.noProjects")} clearLabel={t("form.noProject")} closeLabel={common("finish")} onChange={(value) => patch("projectId", value)} />
      </div>
      <TextInput label={t("form.description")} value={values.description} onChange={(value) => patch("description", value)} />
      <TextInput label={t("form.tags")} value={values.tags} onChange={(value) => patch("tags", value)} />
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

function TaskBoard({
  tasks,
  busyId,
  labels,
  priorityLabels,
  assigneeOptionMap,
  clientOptionMap,
  projectOptionMap,
  draggedTaskId,
  dragOverStatus,
  dragOverIndex,
  onDragStart,
  onDragOverTask,
  onDragOverColumn,
  onDrop,
  onDragEnd,
  onEdit,
  onDelete,
  onToggleDone,
}: {
  tasks: TaskRecord[];
  busyId: string | null;
  labels: Record<TaskStatus, string>;
  priorityLabels: Record<TaskPriority, string>;
  assigneeOptionMap: Map<string, WorkOsPickerOption>;
  clientOptionMap: Map<string, { name?: string; label?: string }>;
  projectOptionMap: Map<string, { name?: string; label?: string }>;
  draggedTaskId: string | null;
  dragOverStatus: TaskStatus | null;
  dragOverIndex: number;
  onDragStart: (task: TaskRecord) => void;
  onDragOverTask: (status: TaskStatus, index: number) => void;
  onDragOverColumn: (status: TaskStatus, index: number) => void;
  onDrop: (status: TaskStatus, statusTasks: TaskRecord[]) => void;
  onDragEnd: () => void;
  onEdit: (task: TaskRecord) => void;
  onDelete: (task: TaskRecord) => void;
  onToggleDone: (task: TaskRecord) => void;
}) {
  const t = useTranslations("Tasks");
  const common = useTranslations("Common");

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {taskBoardStatuses.map((status) => {
        const rows = sortPipelineTasks(tasks.filter((task) => task.status === status));
        return (
          <section
            key={status}
            className={cn(
              "min-h-52 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3 transition-colors dark:border-white/5 dark:bg-white/[0.02]",
              dragOverStatus === status ? "border-zinc-400 bg-zinc-100/80 dark:border-white/20 dark:bg-white/[0.05]" : null,
            )}
            onDragOver={(event) => {
              event.preventDefault();
              onDragOverColumn(status, rows.length);
            }}
            onDrop={(event) => {
              event.preventDefault();
              onDrop(status, rows);
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{labels[status]}</h3>
              <span className="text-[10px] font-black tabular-nums text-zinc-400">{rows.length}</span>
            </div>
            <div className="space-y-3">
              {rows.map((task, index) => {
                const assignee = assigneeOptionMap.get(task.assigneeUserId ?? "");
                const sender = assigneeOptionMap.get(task.createdByUserId);
                const projectContext = projectOptionMap.get(task.projectId ?? "");
                const clientContext = clientOptionMap.get(task.clientId ?? "");
                const context = projectContext?.label ?? projectContext?.name ?? clientContext?.label ?? clientContext?.name ?? t("table.noContext");
                return (
                <article
                  key={task.id}
                  draggable
                  className={cn(
                    "rounded-xl border border-zinc-200 bg-white p-3 transition dark:border-white/10 dark:bg-[#0A0A0A]",
                    draggedTaskId === task.id ? "opacity-50" : "opacity-100",
                    dragOverStatus === status && dragOverIndex === index ? "ring-2 ring-zinc-900/20 dark:ring-white/20" : null,
                  )}
                  onDragStart={() => onDragStart(task)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    onDragOverTask(status, index);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    onDragOverTask(status, index);
                    onDrop(status, rows);
                  }}
                  onDragEnd={onDragEnd}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-black text-zinc-950 dark:text-white">{task.title}</h4>
                      <p className={cn("mt-1 text-xs font-bold", isOverdue(task) ? "text-red-500" : "text-zinc-400")}>{task.dueDate || t("table.noDate")}</p>
                    </div>
                    <StatusPill label={priorityLabels[task.priority]} tone={priorityTone(task.priority)} />
                  </div>
                  {task.description ? <p className="mt-3 line-clamp-2 text-xs font-medium leading-5 text-zinc-500">{task.description}</p> : null}
                  <div className="mt-4 grid gap-2 text-[10px] font-bold text-zinc-500 dark:text-zinc-400">
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <span>{t("table.assignee")}</span>
                      <span className="truncate text-zinc-900 dark:text-white">{assignee?.label ?? t("table.unassigned")}</span>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <span>{t("table.sender")}</span>
                      <span className="truncate text-zinc-900 dark:text-white">{sender?.label ?? task.createdByUserId}</span>
                    </div>
                    <div className="flex min-w-0 items-center justify-between gap-3">
                      <span>{t("table.context")}</span>
                      <span className="truncate text-zinc-900 dark:text-white">{context}</span>
                    </div>
                  </div>
                  {task.tags?.length ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {task.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-full bg-zinc-100 px-2 py-1 text-[9px] font-black text-zinc-500 dark:bg-white/10 dark:text-zinc-300">{tag}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Link href={`/tasks/${task.id}`} className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5">{t("actions.open")}</Link>
                    <Button type="button" variant="outline" disabled={busyId === task.id} className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => onToggleDone(task)}>
                      {task.status === "done" ? t("actions.reopen") : t("actions.done")}
                    </Button>
                    <Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => onEdit(task)}>{common("edit")}</Button>
                    <Button type="button" variant="outline" disabled={busyId === task.id} className="h-8 rounded-lg px-2 text-red-600" onClick={() => onDelete(task)} aria-label={t("actions.deleteTask")}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </article>
              );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function TasksScreen() {
  const t = useTranslations("Tasks");
  const common = useTranslations("Common");
  const account = useAccountContext();
  const queryClient = useQueryClient();
  const workspaceStatus = account.workspace.status;
  const organizationId = workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const [memberOptions, setMemberOptions] = useState<WorkOsPickerOption[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [ownership, setOwnership] = useState<(typeof ownershipFilters)[number]>("all");
  const [view, setView] = useState<"board" | "list">("board");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<TaskRecord | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState(0);
  const isFormDrawerOpen = isCreateOpen || Boolean(editing);
  const queriedTasks = useTasksQuery(organizationId, { status, search });
  const tasks = useMemo(() => queriedTasks ?? [], [queriedTasks]);
  const queriedStats = useTaskStatsQuery(organizationId);
  const rawClientOptions = useClientOptionsQuery(organizationId, { enabled: Boolean(organizationId) });
  const clientOptions = useMemo(() => rawClientOptions ?? [], [rawClientOptions]);
  const projectOptionsResult = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projectOptions = useMemo(() => projectOptionsResult.data ?? [], [projectOptionsResult.data]);
  const taskStatusLabels = useMemo(
    () => Object.fromEntries(statuses.map((value) => [value, t(`statuses.${value}`)])) as Record<TaskStatus, string>,
    [t],
  );
  const taskPriorityLabels = useMemo(
    () => Object.fromEntries(priorities.map((value) => [value, t(`priorities.${value}`)])) as Record<TaskPriority, string>,
    [t],
  );
  const assigneeOptionMap = useMemo(() => new Map(memberOptions.map((option) => [option.id, option])), [memberOptions]);
  const clientOptionMap = useMemo(() => new Map(clientOptions.map((option) => [option.id, option])), [clientOptions]);
  const projectOptionMap = useMemo(() => new Map(projectOptions.map((option) => [option.id, option])), [projectOptions]);
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
      .catch(() => {
        if (active) setMemberOptions([]);
      });
    return () => {
      active = false;
    };
  }, [organizationId]);

  const moveTaskMutation = useMutation({
    mutationFn: async (variables: {
      organizationId: string;
      task: TaskRecord;
      status: TaskStatus;
      statusTasks: TaskRecord[];
      targetIndex: number;
    }) => {
      const pipelineOrder = nextTaskPipelineOrder(variables.statusTasks, variables.task.id, variables.targetIndex);
      return updateTaskRequest(
        variables.organizationId,
        variables.task.id,
        taskFormValuesForPipeline(variables.task, variables.status, pipelineOrder),
      );
    },
    onMutate: async (variables) => {
      const pipelineOrder = nextTaskPipelineOrder(variables.statusTasks, variables.task.id, variables.targetIndex);
      await queryClient.cancelQueries({ queryKey: ["tasks", variables.organizationId] });
      const previousEntries = queryClient.getQueriesData<TaskRecord[]>({ queryKey: ["tasks", variables.organizationId] });

      queryClient.setQueriesData<TaskRecord[]>({ queryKey: ["tasks", variables.organizationId] }, (data) => {
        if (!data) return data;
        return data.map((task) => (
          task.id === variables.task.id
            ? { ...task, status: variables.status, pipelineOrder, updatedAt: Date.now() }
            : task
        ));
      });

      return { previousEntries };
    },
    onError: (_error, _variables, context) => {
      context?.previousEntries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
    onSettled: async (_data, _error, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["tasks", variables?.organizationId] });
      await queryClient.invalidateQueries({ queryKey: ["tasks-stats", variables?.organizationId] });
    },
  });

  const filteredTasks = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return tasks
      .filter((task) => status === "all" || task.status === status)
      .filter((task) => ownership === "all" || (ownership === "assignedToMe" ? task.assigneeUserId === account.user.id : task.createdByUserId === account.user.id))
      .filter((task) => !needle || [task.title, task.description, task.assigneeUserId, ...(task.tags ?? [])].some((value) => value?.toLowerCase().includes(needle)));
  }, [account.user.id, ownership, search, status, tasks]);

  const stats = queriedStats ?? {
    open: tasks.filter((task) => task.status !== "done" && task.status !== "canceled").length,
    dueToday: tasks.filter(isDueToday).length,
    urgent: tasks.filter((task) => task.priority === "urgent").length,
    done: tasks.filter((task) => task.status === "done").length,
    total: tasks.length,
  };

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    await queryClient.invalidateQueries({ queryKey: ["tasks-stats"] });
  }

  function openCreateDrawer() {
    setEditing(null);
    setIsCreateOpen(true);
  }

  function openEditDrawer(task: TaskRecord) {
    setIsCreateOpen(false);
    setEditing(task);
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

  async function toggleDone(task: TaskRecord) {
    if (!organizationId) return;
    setBusyId(task.id);
    try {
      await updateTaskRequest(organizationId, task.id, {
        ...formFromTask(task),
        status: task.status === "done" ? "todo" : "done",
      });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  function handleDragStart(task: TaskRecord) {
    setDraggedTaskId(task.id);
    setDragOverStatus(task.status);
    const ordered = sortPipelineTasks(tasks.filter((item) => item.status === task.status));
    setDragOverIndex(Math.max(0, ordered.findIndex((item) => item.id === task.id)));
  }

  function handleDragEnd() {
    setDraggedTaskId(null);
    setDragOverStatus(null);
    setDragOverIndex(0);
  }

  function handleDragOver(statusValue: TaskStatus, index: number) {
    setDragOverStatus(statusValue);
    setDragOverIndex(index);
  }

  function handleDrop(statusValue: TaskStatus, statusTasks: TaskRecord[]) {
    if (!organizationId || !draggedTaskId) return;
    const task = tasks.find((item) => item.id === draggedTaskId);
    if (!task) return;
    moveTaskMutation.mutate({
      organizationId,
      task,
      status: statusValue,
      statusTasks,
      targetIndex: dragOverStatus === statusValue ? dragOverIndex : statusTasks.length,
    });
    handleDragEnd();
  }

  async function remove(task: TaskRecord) {
    if (!organizationId || !window.confirm(`Delete ${task.title}?`)) return;
    setBusyId(task.id);
    try {
      await deleteTaskRequest(organizationId, task.id);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  const columns: AppDataTableColumn<TaskRecord>[] = [
    { key: "title", header: t("table.task"), render: (row) => <div className="min-w-0"><p className="truncate text-sm font-black text-zinc-950 dark:text-white">{row.title}</p><p className="mt-1 truncate text-xs font-bold text-zinc-400">{row.description || assigneeOptionMap.get(row.assigneeUserId ?? "")?.label || t("table.noDescription")}</p></div> },
    { key: "status", header: t("table.status"), render: (row) => <StatusPill label={taskStatusLabels[row.status]} tone={statusTone(row.status)} /> },
    { key: "priority", header: t("table.priority"), render: (row) => <StatusPill label={taskPriorityLabels[row.priority]} tone={priorityTone(row.priority)} /> },
    { key: "assignee", header: t("table.assignee"), render: (row) => assigneeOptionMap.get(row.assigneeUserId ?? "")?.label ?? t("table.unassigned") },
    { key: "sender", header: t("table.sender"), render: (row) => assigneeOptionMap.get(row.createdByUserId)?.label ?? row.createdByUserId },
    { key: "context", header: t("table.context"), render: (row) => projectOptionMap.get(row.projectId ?? "")?.name ?? clientOptionMap.get(row.clientId ?? "")?.name ?? t("table.noContext") },
    { key: "dueDate", header: t("table.due"), render: (row) => <span className={isOverdue(row) ? "font-black text-red-600" : ""}>{row.dueDate || t("table.noDate")}</span> },
    { key: "actions", header: "", align: "end", render: (row) => <div className="flex justify-end gap-2"><Link href={`/tasks/${row.id}`} className="inline-flex h-8 items-center rounded-lg border border-zinc-200 px-3 text-[10px] font-bold text-zinc-700 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-200 dark:hover:bg-white/5">{t("actions.open")}</Link><Button type="button" variant="outline" disabled={busyId === row.id} className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => toggleDone(row)}>{row.status === "done" ? t("actions.reopen") : t("actions.done")}</Button><Button type="button" variant="outline" className="h-8 rounded-lg px-3 text-[10px] font-bold" onClick={() => openEditDrawer(row)}>{common("edit")}</Button><Button type="button" variant="outline" disabled={busyId === row.id} className="h-8 rounded-lg px-2 text-red-600" onClick={() => remove(row)} aria-label={t("actions.deleteTask")}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
  ];

  return (
    <AppPageShell maxWidth="full" contentClassName="space-y-8">
      <AppPageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        actions={<AppPrimaryButton onClick={openCreateDrawer}><Plus className="me-2 h-3.5 w-3.5" />{t("actions.new")}</AppPrimaryButton>}
      />
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="table" />
      ) : (
        <>
          <AppStatsGrid stats={[
            { label: t("stats.open"), value: stats.open, icon: ListTodo },
            { label: t("stats.dueToday"), value: stats.dueToday, icon: CalendarDays },
            { label: t("stats.urgent"), value: stats.urgent, icon: UserRound },
            { label: t("stats.done"), value: stats.done, icon: CheckCircle2 },
          ]} />
          <AppSection
            title={t("workspaceView")}
            actions={(
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex h-10 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 dark:border-white/10 dark:bg-white/[0.03]">
                  <Search className="h-3.5 w-3.5 text-zinc-400" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={common("search")} className="h-8 w-36 bg-transparent text-xs font-bold outline-none" />
                </div>
                <select value={status} onChange={(event) => setStatus(event.target.value as TaskStatus | "all")} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-white/[0.03]">
                  <option value="all">{t("filters.allStatuses")}</option>
                  {statuses.map((item) => <option key={item} value={item}>{taskStatusLabels[item]}</option>)}
                </select>
                <select value={ownership} onChange={(event) => setOwnership(event.target.value as (typeof ownershipFilters)[number])} className="h-10 rounded-xl border border-zinc-200 bg-white px-3 text-xs font-bold dark:border-white/10 dark:bg-white/[0.03]">
                  {ownershipFilters.map((item) => <option key={item} value={item}>{t(`filters.${item}`)}</option>)}
                </select>
                <Button type="button" variant={view === "board" ? "default" : "outline"} className="h-10 rounded-xl px-3" onClick={() => setView("board")} aria-label="Board view"><ListTodo className="h-4 w-4" /></Button>
                <Button type="button" variant={view === "list" ? "default" : "outline"} className="h-10 rounded-xl px-3" onClick={() => setView("list")} aria-label="List view"><List className="h-4 w-4" /></Button>
              </div>
            )}
          >
            {filteredTasks.length === 0 ? (
              <EmptyWorkspace icon={ListTodo} title={t("empty.title")} description={t("empty.description")} />
            ) : view === "board" ? (
              <TaskBoard
                tasks={filteredTasks}
                busyId={busyId}
                labels={taskStatusLabels}
                priorityLabels={taskPriorityLabels}
                assigneeOptionMap={assigneeOptionMap}
                clientOptionMap={clientOptionMap}
                projectOptionMap={projectOptionMap}
                draggedTaskId={draggedTaskId}
                dragOverStatus={dragOverStatus}
                dragOverIndex={dragOverIndex}
                onDragStart={handleDragStart}
                onDragOverTask={handleDragOver}
                onDragOverColumn={handleDragOver}
                onDrop={handleDrop}
                onDragEnd={handleDragEnd}
                onEdit={openEditDrawer}
                onDelete={remove}
                onToggleDone={toggleDone}
              />
            ) : (
              <AppDataTable columns={columns} data={filteredTasks} getRowKey={(row) => row.id} />
            )}
          </AppSection>
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
              <TaskForm key="create" initialValues={emptyTask} isSubmitting={busyId === "create"} submitLabel={t("actions.create")} assigneeOptions={taskAssigneeOptions} clientOptions={taskClientOptions} projectOptions={taskProjectOptions} onCancel={closeFormDrawer} onSubmit={create} />
            )}
          </WorkOsRecordDrawer>
        </>
      )}
    </AppPageShell>
  );
}

export function TaskDetailScreen({ id }: { id: string }) {
  const t = useTranslations("Tasks");
  const common = useTranslations("Common");
  const account = useAccountContext();
  const router = useRouter();
  const queryClient = useQueryClient();
  const workspaceStatus = account.workspace.status;
  const organizationId = workspaceStatus === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const task = useTaskQuery(organizationId, id);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [memberOptions, setMemberOptions] = useState<WorkOsPickerOption[]>([]);
  const rawClientOptions = useClientOptionsQuery(organizationId, { enabled: Boolean(organizationId && task) });
  const clientOptions = useMemo(() => rawClientOptions ?? [], [rawClientOptions]);
  const projectOptionsResult = useProjectOptionsQueryResult(organizationId, { limit: 200 });
  const projectOptions = useMemo(() => projectOptionsResult.data ?? [], [projectOptionsResult.data]);
  const taskStatusLabels = useMemo(
    () => Object.fromEntries(statuses.map((value) => [value, t(`statuses.${value}`)])) as Record<TaskStatus, string>,
    [t],
  );
  const taskPriorityLabels = useMemo(
    () => Object.fromEntries(priorities.map((value) => [value, t(`priorities.${value}`)])) as Record<TaskPriority, string>,
    [t],
  );
  const assigneeOptionMap = useMemo(() => new Map(memberOptions.map((option) => [option.id, option])), [memberOptions]);
  const clientOptionMap = useMemo(() => new Map(clientOptions.map((option) => [option.id, option])), [clientOptions]);
  const projectOptionMap = useMemo(() => new Map(projectOptions.map((project) => [project.id, project])), [projectOptions]);
  const taskAssigneeOptions = useMemo(() => memberOptions, [memberOptions]);
  const taskClientOptions = useMemo(() => clientOptions.map((client) => ({ id: client.id, label: client.name })), [clientOptions]);
  const taskProjectOptions = useMemo(() => projectOptions.map((project) => ({ id: project.id, label: project.name })), [projectOptions]);

  useEffect(() => {
    if (!organizationId || !task) return;
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
      .catch(() => {
        if (active) setMemberOptions([]);
      });
    return () => {
      active = false;
    };
  }, [organizationId, task]);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["task", organizationId, id] });
    await queryClient.invalidateQueries({ queryKey: ["tasks"] });
    await queryClient.invalidateQueries({ queryKey: ["tasks-stats"] });
  }

  async function update(values: TaskFormValues) {
    if (!organizationId || !task) return;
    setBusyId(task.id);
    try {
      await updateTaskRequest(organizationId, task.id, values);
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function toggleDone() {
    if (!organizationId || !task) return;
    setBusyId(task.id);
    try {
      await updateTaskRequest(organizationId, task.id, {
        ...formFromTask(task),
        status: task.status === "done" ? "todo" : "done",
      });
      await refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function remove() {
    if (!organizationId || !task || !window.confirm(`Delete ${task.title}?`)) return;
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
    <AppPageShell maxWidth="wide" contentClassName="space-y-8">
      <AppPageHeader
        eyebrow={t("detail.eyebrow")}
        title={task?.title ?? t("title")}
        context={<Link href="/tasks" className="inline-flex h-10 items-center rounded-xl border border-zinc-100 bg-white px-4 text-xs font-bold text-zinc-900 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white"><ArrowLeft className="me-2 h-4 w-4" />{common("back")}</Link>}
        actions={task ? (
          <>
            <Button type="button" variant="outline" disabled={busyId === task.id} className="h-10 rounded-xl text-xs font-bold" onClick={toggleDone}>
              <CheckCircle2 className="me-2 h-4 w-4" />
              {task.status === "done" ? t("actions.reopen") : t("actions.done")}
            </Button>
            <Button type="button" variant="outline" disabled={busyId === task.id} className="h-10 rounded-xl text-xs font-bold text-red-600" onClick={remove}>
              <Trash2 className="me-2 h-4 w-4" />
              {common("delete")}
            </Button>
          </>
        ) : null}
      />
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="detail" />
      ) : task === undefined ? (
        <AppSection><div className="min-h-52" /></AppSection>
      ) : task === null ? (
        <DetailNotFoundState title={t("detail.notFoundTitle")} description={t("detail.notFoundDescription")} backHref="/tasks" backLabel={t("detail.backToTasks")} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <AppSection title={t("detail.record")}>
            <TaskForm initialValues={formFromTask(task)} isSubmitting={busyId === task.id} submitLabel={t("actions.save")} assigneeOptions={taskAssigneeOptions} clientOptions={taskClientOptions} projectOptions={taskProjectOptions} onSubmit={update} />
          </AppSection>
          <AppSection title={t("detail.summary")} tone="muted">
            <dl className="grid gap-4 text-sm">
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("table.status")}</dt><dd className="mt-2"><StatusPill label={taskStatusLabels[task.status]} tone={statusTone(task.status)} /></dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("table.priority")}</dt><dd className="mt-2"><StatusPill label={taskPriorityLabels[task.priority]} tone={priorityTone(task.priority)} /></dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("table.assignee")}</dt><dd className="mt-1 font-black text-zinc-950 dark:text-white">{assigneeOptionMap.get(task.assigneeUserId ?? "")?.label ?? t("table.unassigned")}</dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("table.sender")}</dt><dd className="mt-1 font-black text-zinc-950 dark:text-white">{assigneeOptionMap.get(task.createdByUserId)?.label ?? task.createdByUserId}</dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("table.context")}</dt><dd className="mt-1 font-black text-zinc-950 dark:text-white">{projectOptionMap.get(task.projectId ?? "")?.name ?? clientOptionMap.get(task.clientId ?? "")?.name ?? t("table.noContext")}</dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("table.due")}</dt><dd className={isOverdue(task) ? "mt-1 font-black text-red-600" : "mt-1 font-black text-zinc-950 dark:text-white"}>{task.dueDate || t("table.noDate")}</dd></div>
              <div><dt className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{t("form.description")}</dt><dd className="mt-1 font-medium text-zinc-500">{task.description || t("table.noDescription")}</dd></div>
            </dl>
          </AppSection>
        </div>
      )}
    </AppPageShell>
  );
}
