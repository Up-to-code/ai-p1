"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccountContext } from "@/domains/auth";
import { useProjectQuery } from "../api/projects";
import {
  useTasksQuery,
  useTasksGroupedQuery,
  readPersistedGroupBy,
  writePersistedGroupBy,
} from "@/domains/tasks/api/tasks";
import { useLocalConfig } from "@/domains/storage";
import { useTaskMutations } from "@/domains/tasks/hooks/use-task-mutations";
import {
  useFieldDefinitionsQuery,
  useFieldValuesQuery,
  setCustomFieldValueRequest,
  type CustomFieldDefinition,
} from "@/domains/tasks/api/fields";
import { listOrganizationMembers } from "@/domains/organization/api/members";
import {
  Box, Calendar, Clock,
  ChevronDown, Check,
  Globe2, ChevronRight,
  ChevronRight as ChevronRightIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProjectDashboard } from "./project-dashboard";
import {
  ViewSwitcherTabs,
  type ViewItem,
  type ViewType,
} from "@/components/shared/view-system";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  QentrahTable,
  StatusPill,
  AssigneeAvatar,
  PriorityFlag,
  NameCell,
  StatusEditor,
  AssigneeEditor,
  DateEditor,
  PriorityEditor,
  TextEditor,
  NumberEditor,
  DropdownEditor,
  LabelsEditor,
  UrlEditor,
  type QentrahColumnDef,
  type QentrahTableRef,
  type AssigneeOption,
} from "@qentrah/ui/qentrah-table";
import {
  TaskTableToolbar,
  type GroupByValue,
} from "@/domains/tasks/components/task-table-toolbar";
import { applyFilterRules, type FilterRule } from "@/domains/tasks/components/task-table-filter-rules";
import { SavedViewsDropdown } from "@/domains/tasks/components/saved-views-dropdown";
import {
  useDefaultSavedViewQuery,
  type SavedViewConfig,
} from "@/domains/tasks/api/saved-views";
import { TaskTableFieldsPanel } from "@/domains/tasks/components/task-table-fields-panel";

interface ProjectDetailOverviewProps {
  projectId: string;
}

const DEFAULT_VIEWS: ViewItem[] = [
  { id: "view-1", type: "dashboard" },
  { id: "view-2", type: "table" },
  { id: "view-3", type: "board" },
];

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  todo: { bg: "var(--q-status-todo-bg)", text: "var(--q-status-todo-text)", border: "var(--q-status-todo-border)" },
  inProgress: { bg: "var(--q-status-inProgress-bg)", text: "var(--q-status-inProgress-text)", border: "var(--q-status-inProgress-border)" },
  waiting: { bg: "var(--q-status-waiting-bg)", text: "var(--q-status-waiting-text)", border: "var(--q-status-waiting-border)" },
  done: { bg: "var(--q-status-done-bg)", text: "var(--q-status-done-text)", border: "var(--q-status-done-border)" },
  canceled: { bg: "var(--q-status-canceled-bg)", text: "var(--q-status-canceled-text)", border: "var(--q-status-canceled-border)" },
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  urgent: { bg: "var(--q-priority-urgent-bg)", text: "var(--q-priority-urgent-text)", border: "var(--q-priority-urgent-text)" },
  high: { bg: "var(--q-priority-high-bg)", text: "var(--q-priority-high-text)", border: "var(--q-priority-high-text)" },
  normal: { bg: "var(--q-priority-normal-bg)", text: "var(--q-priority-normal-text)", border: "var(--q-priority-normal-text)" },
  low: { bg: "var(--q-priority-low-bg)", text: "var(--q-priority-low-text)", border: "var(--q-priority-low-text)" },
};

function statusStyleFor(status: string) {
  return STATUS_COLORS[status] ?? STATUS_COLORS.todo;
}

function priorityStyleFor(priority: string) {
  return PRIORITY_COLORS[priority] ?? PRIORITY_COLORS.normal;
}

const COUNTRY_FLAGS: Record<string, string> = {
  Egypt: "🇪🇬",
  "Saudi Arabia": "🇸🇦",
  "United States": "🇺🇸",
  USA: "🇺🇸",
  Jordan: "🇯🇴",
  Germany: "🇩🇪",
  UK: "🇬🇧",
  France: "🇫🇷",
  UAE: "🇦🇪",
  Canada: "🇨🇦",
  Japan: "🇯🇵",
};

export function ProjectDetailOverview({ projectId }: ProjectDetailOverviewProps) {
  const account = useAccountContext();
  const workspaceOrganizationId = account.workspace.status === "ready" ? account.workspace.organizationId : undefined;
  const project = useProjectQuery(workspaceOrganizationId ?? undefined, projectId);

  const storageKey = `project-views-${projectId}`;
  const [views, setViews] = useLocalConfig<ViewItem[]>(storageKey, DEFAULT_VIEWS);
  const [activeViewId, setActiveViewId] = useState<string>(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed[0].id;
      } catch { /* ignore */ }
    }
    return DEFAULT_VIEWS[0].id;
  });

  const handleAddView = (type: ViewType) => {
    const newView: ViewItem = { id: `view-${Date.now()}`, type };
    setViews([...views, newView]);
    setActiveViewId(newView.id);
  };

  const handleReorder = (next: ViewItem[]) => {
    setViews(next);
  };

  const handleRemoveView = (viewId: string) => {
    const next = views.filter((v) => v.id !== viewId);
    if (next.length === 0) return;
    setViews(next);
    if (activeViewId === viewId) setActiveViewId(next[0].id);
  };

  if (project === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Project not found.</p>
      </div>
    );
  }

  const activeView = views.find(v => v.id === activeViewId) || views[0];
  const activeType = activeView?.type || "dashboard";

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-6 space-y-6 h-full flex flex-col">
      <ViewSwitcherTabs
        views={views}
        activeViewId={activeViewId}
        onViewChange={setActiveViewId}
        onReorder={handleReorder}
        onAddView={handleAddView}
        onRemoveView={handleRemoveView}
        leftSlot={
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Box className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black tracking-tight text-foreground truncate">
                {project.name || "Project Details"}
              </h1>
            </div>
          </div>
        }
      />

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 px-4">
        {activeType === "dashboard" && <ProjectDashboard projectId={projectId} />}
        {activeType === "table" && <TaskTableView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "list" && <TaskListView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "board" && <TaskBoardView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "calendar" && <TaskCalendarView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "timeline" && <TaskTimelineView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
        {activeType === "map" && <TaskMapView projectId={projectId} organizationId={workspaceOrganizationId ?? ""} />}
      </div>
    </div>
  );
}

/* ==========================================================================
   TASK TABLE VIEW
   ========================================================================== */
export function TaskTableView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];
  const { createTask, updateTask, deleteTask } = useTaskMutations(organizationId);

  const { data: members = [] } = useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: () => listOrganizationMembers(organizationId),
    enabled: !!organizationId,
  });

  const [newTitle, setNewTitle] = useState("");
  const [search, setSearch] = useState("");
  const [groupBy, setGroupByState] = useState<GroupByValue>("none");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"updated" | "created" | "due" | "title" | "priority" | "status">("updated");
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [density, setDensity] = useState<"compact" | "normal">("compact");
  const [fieldsOpen, setFieldsOpen] = useState(false);

  const tableRef = useRef<QentrahTableRef<any>>(null);

  const currentViewConfig = useMemo(
    () => ({
      groupBy,
      sortBy,
      search,
      filters: filters as unknown as SavedViewConfig["filters"],
      density,
    }),
    [groupBy, sortBy, search, filters, density],
  )

  const applyViewConfig = useCallback((config: SavedViewConfig) => {
    if (config.groupBy) setGroupByState(config.groupBy as GroupByValue)
    if (config.sortBy) setSortBy(config.sortBy as typeof sortBy)
    if (typeof config.search === "string") setSearch(config.search)
    if (Array.isArray(config.filters)) setFilters(config.filters as unknown as FilterRule[])
    if (config.density === "compact" || config.density === "normal") setDensity(config.density)
  }, [])

  useEffect(() => {
    setGroupByState(readPersistedGroupBy(projectId, "none"))
  }, [projectId])

  // Load the user's default saved view for this table once on mount, and
  // when the project changes. This is a personal preference that travels
  // with the user account (not the organization).
  const defaultSavedView = useDefaultSavedViewQuery({
    resourceType: "task",
    viewType: "table",
    organizationId: organizationId || undefined,
    projectId: projectId || undefined,
  })
  const appliedDefaultViewIdRef = useRef<string | null>(null)
  useEffect(() => {
    const view = defaultSavedView.data
    if (!view) return
    if (appliedDefaultViewIdRef.current === view._id) return
    appliedDefaultViewIdRef.current = view._id
    applyViewConfig(view.config)
  }, [defaultSavedView.data, applyViewConfig])

  const setGroupBy = useCallback(
    (next: GroupByValue) => {
      setGroupByState(next)
      writePersistedGroupBy(projectId, next)
    },
    [projectId]
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await createTask({ title: newTitle.trim(), projectId });
      setNewTitle("");
    } catch {
      /* error already handled by useTaskMutations */
    }
  };

  // Cell-level optimistic update.
  // Applies the change to the AG-Grid row in place (no row animation, no
  // re-fetch of the whole list, no scroll jump), then sends the request to
  // the server. On error, reverts the cell to its previous value.
  const handleUpdate = useCallback(
    async (task: any, updates: any) => {
      const previousTask = { ...task }
      const optimisticTask = { ...task, ...updates }
      tableRef.current?.applyUpdate([optimisticTask])
      try {
        await updateTask(task.id, updates)
      } catch {
        tableRef.current?.applyUpdate([previousTask])
      }
    },
    [updateTask]
  );

  const handleDelete = useCallback(
    async (taskId: string) => {
      try {
        tableRef.current?.applyRemove([taskId])
        await deleteTask(taskId)
      } catch {
        /* error already handled by useTaskMutations */
      }
    },
    [deleteTask]
  )

  const memberNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of members) {
      if (m.userId) map.set(m.userId, m.user?.name ?? "");
    }
    return map;
  }, [members]);

  const assigneeOptions: AssigneeOption[] = useMemo(() => {
    return members
      .filter((m: any) => m.userId)
      .map((m: any) => ({
        id: m.userId,
        name: m.user?.name ?? "",
        imageUrl: m.user?.imageUrl ?? null,
      }));
  }, [members]);

  const memberIdSet = useMemo(() => new Set(assigneeOptions.map((m) => m.id)), [assigneeOptions]);

  const grouped = useTasksGroupedQuery(organizationId, {
    projectId: projectId || null,
    groupBy,
  });

  const fieldDefinitions = useFieldDefinitionsQuery(organizationId)
  const fieldValues = useFieldValuesQuery(organizationId, "task")

  const fieldValueByRecord = useMemo(() => {
    const map = new Map<string, Map<string, any>>()
    for (const v of fieldValues ?? []) {
      const key = v.fieldKey
      const recordId = v.recordId
      if (!recordId) continue
      const inner = map.get(recordId) ?? new Map<string, any>()
      inner.set(key, v)
      map.set(recordId, inner)
    }
    return map
  }, [fieldValues])

  const writeFieldValue = useCallback(
    async (taskId: string, def: CustomFieldDefinition, raw: any) => {
      const value: any = {}
      if (def.type === "text" || def.type === "longText" || def.type === "url") {
        value.textValue = typeof raw === "string" ? raw : null
      } else if (def.type === "number" || def.type === "currency") {
        value.numberValue = typeof raw === "number" ? raw : undefined
      } else if (def.type === "date" || def.type === "dateTime") {
        value.dateValue = typeof raw === "string" ? raw : undefined
      } else if (def.type === "select") {
        value.selectValue = typeof raw === "string" ? raw : undefined
      } else if (def.type === "multiSelect") {
        value.multiSelectValue = Array.isArray(raw) ? raw : undefined
      } else if (def.type === "boolean") {
        value.booleanValue = typeof raw === "boolean" ? raw : undefined
      } else if (def.type === "user") {
        value.userValue = typeof raw === "string" ? raw : undefined
      }
      try {
        await setCustomFieldValueRequest(organizationId, def.id, def.key, def.type, taskId, value)
      } catch (e) {
        console.error("Failed to save custom field value", e)
      }
    },
    [organizationId]
  )

  const visibleFields = useMemo(
    () => (fieldDefinitions.data ?? []).filter((d) => d.tableVisible).sort((a, b) => a.order - b.order),
    [fieldDefinitions.data]
  )

  const sourceRows: any[] = groupBy === "none" ? tasks : grouped.flat;

  const filteredTasks = useMemo(() => {
    let result = sourceRows
    if (search.trim()) {
      const needle = search.trim().toLowerCase()
      result = result.filter((t: any) =>
        [t.title, t.description, t.assigneeUserId, ...(t.tags ?? [])].some((v?: string) =>
          v?.toLowerCase().includes(needle),
        ),
      )
    }
    if (filters.length > 0) {
      result = applyFilterRules(result, filters)
    }
    return result
  }, [sourceRows, search, filters])

  // Sorting: produce a stable, sort-aware array. We use the task fields
  // and the assignee name map. AG-Grid also has its own client-side sort
  // via the column header, but we apply a default sort here so the
  // "Sort" dropdown has an effect even when no header is clicked.
  const sortedTasks = useMemo(() => {
    const arr = [...filteredTasks]
    const priorityRank: Record<string, number> = { urgent: 0, high: 1, normal: 2, low: 3 }
    const statusRank: Record<string, number> = { todo: 0, waiting: 1, inProgress: 2, done: 3, canceled: 4 }
    arr.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.title ?? "").localeCompare(b.title ?? "")
        case "created":
          return (b._creationTime ?? 0) - (a._creationTime ?? 0)
        case "updated":
          return (b.updatedAt ?? 0) - (a.updatedAt ?? 0)
        case "due":
          return (a.dueDate || "9999-12-31").localeCompare(b.dueDate || "9999-12-31")
        case "priority":
          return (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9)
        case "status":
          return (statusRank[a.status] ?? 9) - (statusRank[b.status] ?? 9)
        default:
          return 0
      }
    })
    return arr
  }, [filteredTasks, sortBy])

  const groupedRows: any[] = useMemo(() => {
    if (groupBy === "none" || !grouped.groups || grouped.groups.length === 0) {
      return sortedTasks;
    }
    const out: any[] = [];
    for (const group of grouped.groups) {
      if (collapsedGroups.has(group.key)) continue;
      const groupLabel = groupBy === "assignee"
        ? memberIdSet.has(group.key) ? memberNameById.get(group.key) || group.key : group.label
        : group.label;
      out.push({
        id: `__group_${group.key}`,
        __groupKey: group.key,
        __groupLabel: groupLabel,
        __groupCount: group.count,
      });
      const inGroup = sortedTasks.filter((t: any) => {
        if (groupBy === "status") return t.status === group.key;
        if (groupBy === "priority") return t.priority === group.key;
        if (groupBy === "assignee") return (t.assigneeUserId ?? "unassigned") === group.key;
        if (groupBy === "dueDate") {
          // Mirror the server's dueDate bucketing
          if (!t.dueDate) return group.key === "no-date";
          const startToday = new Date();
          startToday.setHours(0, 0, 0, 0);
          const target = new Date(t.dueDate);
          target.setHours(0, 0, 0, 0);
          const diffDays = Math.round((target.getTime() - startToday.getTime()) / 86400000);
          if (diffDays < 0) return group.key === "overdue";
          if (diffDays === 0) return group.key === "today";
          if (diffDays === 1) return group.key === "tomorrow";
          if (diffDays <= 7) return group.key === "this-week";
          if (diffDays <= 30) return group.key === "this-month";
          return group.key === "later";
        }
        return false;
      });
      for (const task of inGroup) out.push(task);
    }
    return out;
  }, [groupBy, grouped, sortedTasks, collapsedGroups, memberIdSet, memberNameById]);

  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const columnDefs: QentrahColumnDef<any>[] = useMemo(
    () => [
      {
        headerName: "",
        field: "_select",
        width: 44,
        minWidth: 44,
        maxWidth: 44,
        checkboxSelection: true,
        headerCheckboxSelection: false,
        pinned: "left",
        sortable: false,
        filter: false,
        resizable: false,
        suppressHeaderMenuButton: true,
        lockPosition: "left",
      },
      {
        headerName: "#",
        valueGetter: (p: any) => {
          if (p.data?.__groupKey) return ""
          return (p.node?.rowIndex ?? 0) + 1
        },
        width: 48,
        minWidth: 48,
        maxWidth: 48,
        pinned: "left",
        sortable: false,
        filter: false,
        resizable: false,
        cellClass: "text-muted-foreground text-[11px] justify-center",
      },
      {
        headerName: "Name",
        field: "title",
        flex: 1.4,
        minWidth: 240,
        cellRenderer: (p: any) => {
          if (p.data?.__groupKey) {
            const collapsed = collapsedGroups.has(p.data.__groupKey)
            return (
              <div
                onClick={() => toggleGroup(p.data.__groupKey)}
                className="flex items-center gap-2 w-full h-full cursor-pointer select-none"
              >
                {collapsed
                  ? <ChevronRightIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="text-[12px] font-semibold text-foreground">{p.data.__groupLabel}</span>
                <span className="text-[10px] font-bold text-muted-foreground bg-white/5 rounded-full px-1.5 py-0.5">
                  {p.data.__groupCount}
                </span>
              </div>
            )
          }
          return (
            <NameCell
              value={p.value ?? ""}
              status={p.data?.status ?? "todo"}
              onCommit={(next) => handleUpdate(p.data, { title: next })}
            />
          )
        },
        editable: false,
        cellClass: (p: any) =>
          p.data?.__groupKey ? "bg-white/[0.04] border-b border-white/10" : "",
      },
      {
        headerName: "Assignee",
        field: "assigneeUserId",
        minWidth: 180,
        flex: 0.8,
        cellRenderer: (p: any) => {
          if (p.data?.__groupKey) return null
          return (
            <AssigneeEditor
              value={p.value ?? null}
              options={assigneeOptions}
              onChange={(next) => handleUpdate(p.data, { assigneeUserId: next ?? "" })}
            />
          )
        },
        cellClass: (p: any) =>
          p.data?.__groupKey ? "bg-white/[0.04] border-b border-white/10" : "",
      },
      {
        headerName: "Status",
        field: "status",
        minWidth: 150,
        cellRenderer: (p: any) => {
          if (p.data?.__groupKey) return null
          return (
            <StatusEditor
              value={p.value ?? "todo"}
              onChange={(next) => handleUpdate(p.data, { status: next })}
            />
          )
        },
        cellClass: (p: any) =>
          p.data?.__groupKey ? "bg-white/[0.04] border-b border-white/10" : "",
      },
      {
        headerName: "Due date",
        field: "dueDate",
        minWidth: 160,
        cellRenderer: (p: any) => {
          if (p.data?.__groupKey) return null
          return (
            <DateEditor
              value={p.value ?? null}
              onChange={(next) => handleUpdate(p.data, { dueDate: next ?? "" })}
            />
          )
        },
        cellClass: (p: any) =>
          p.data?.__groupKey ? "bg-white/[0.04] border-b border-white/10" : "",
      },
      {
        headerName: "Priority",
        field: "priority",
        minWidth: 150,
        cellRenderer: (p: any) => {
          if (p.data?.__groupKey) return null
          return (
            <PriorityEditor
              value={p.value ?? "normal"}
              onChange={(next) => handleUpdate(p.data, { priority: next })}
            />
          )
        },
        cellClass: (p: any) =>
          p.data?.__groupKey ? "bg-white/[0.04] border-b border-white/10" : "",
      },
      ...visibleFields.map<QentrahColumnDef<any>>((def) => ({
        headerName: def.label,
        field: `cf_${def.key}`,
        minWidth: 150,
        sortable: false,
        cellRenderer: (p: any) => {
          if (p.data?.__groupKey) return null
          const recordId = p.data?.id as string | undefined
          const v = recordId ? fieldValueByRecord.get(recordId)?.get(def.key) : undefined
          const current = v
            ? def.type === "select"
              ? v.selectValue ?? null
              : def.type === "multiSelect"
                ? v.multiSelectValue ?? []
                : def.type === "number" || def.type === "currency"
                  ? v.numberValue ?? null
                  : def.type === "date" || def.type === "dateTime"
                    ? v.dateValue ?? null
                    : def.type === "boolean"
                      ? v.booleanValue ?? null
                      : v.textValue ?? null
            : null
          if (def.type === "text" || def.type === "longText") {
            return (
              <TextEditor
                value={current}
                onChange={(next) => writeFieldValue(recordId!, def, next)}
                multiline={def.type === "longText"}
              />
            )
          }
          if (def.type === "number" || def.type === "currency") {
            return (
              <NumberEditor
                value={current}
                onChange={(next) => writeFieldValue(recordId!, def, next)}
                prefix={def.type === "currency" ? "$" : undefined}
              />
            )
          }
          if (def.type === "date" || def.type === "dateTime") {
            return (
              <DateEditor
                value={current}
                onChange={(next) => writeFieldValue(recordId!, def, next)}
              />
            )
          }
          if (def.type === "select") {
            return (
              <DropdownEditor
                value={current}
                options={(def.options ?? []).map((o) => ({ id: o.id, label: o.label, color: o.color }))}
                onChange={(next) => writeFieldValue(recordId!, def, next)}
              />
            )
          }
          if (def.type === "multiSelect") {
            return (
              <LabelsEditor
                value={current ?? []}
                options={(def.options ?? []).map((o) => ({ id: o.id, label: o.label, color: o.color }))}
                onChange={(next) => writeFieldValue(recordId!, def, next)}
              />
            )
          }
          if (def.type === "url") {
            return (
              <UrlEditor
                value={current}
                onChange={(next) => writeFieldValue(recordId!, def, next)}
              />
            )
          }
          return (
            <span className="text-[12px] text-muted-foreground/60 truncate">
              {current == null ? "Empty" : String(current)}
            </span>
          )
        },
        cellClass: (p: any) =>
          p.data?.__groupKey ? "bg-white/[0.04] border-b border-white/10" : "",
      })),
    ],
    [assigneeOptions, memberNameById, collapsedGroups, toggleGroup, visibleFields, fieldValueByRecord, writeFieldValue]
  );

  return (
    <div className="w-full h-full font-sans overflow-hidden flex flex-col">
      <TaskTableToolbar
        groupBy={groupBy}
        onGroupByChange={setGroupBy}
        sortBy={sortBy}
        onSortByChange={(v) => setSortBy(v as typeof sortBy)}
        search={search}
        onSearchChange={setSearch}
        filters={filters}
        onFiltersChange={setFilters}
        newTitle={newTitle}
        onNewTitleChange={setNewTitle}
        onCreate={handleCreate}
        onOpenFields={() => setFieldsOpen(true)}
        showFieldsButton
      >
        <SavedViewsDropdown
          resourceType="task"
          viewType="table"
          organizationId={organizationId}
          projectId={projectId}
          currentConfig={currentViewConfig}
          onApply={applyViewConfig}
        />
      </TaskTableToolbar>

      <div className="flex-1 min-h-0">
        <QentrahTable
          ref={tableRef}
          rows={groupedRows}
          columns={columnDefs}
          density={density}
          height="100%"
          rowSelection="multiple"
          onRowClicked={(p) => {
            if (p.data?.__groupKey) {
              toggleGroup(p.data.__groupKey)
            }
            // Intentionally do nothing for task rows: clicking the row
            // body should not write a no-op update. Editing happens via
            // the in-cell editors.
          }}
        />
      </div>

      <TaskTableFieldsPanel
        organizationId={organizationId}
        open={fieldsOpen}
        onClose={() => setFieldsOpen(false)}
        onFieldCreated={() => {
          // Field list query will re-run via Convex reactivity.
        }}
        onFieldRemoved={() => {
          // Field list query will re-run via Convex reactivity.
        }}
      />
    </div>
  );
}

/* ==========================================================================
   TASK LIST VIEW
   ========================================================================== */
export function TaskListView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];
  const { updateTask } = useTaskMutations(organizationId);

  const [expandedStatus, setExpandedStatus] = useState<Record<string, boolean>>({
    todo: true,
    inProgress: true,
    waiting: true,
    done: true,
  });

  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter(t => t.status === "todo"),
      inProgress: tasks.filter(t => t.status === "inProgress"),
      waiting: tasks.filter(t => t.status === "waiting"),
      done: tasks.filter(t => t.status === "done" || t.status === "canceled"),
    };
  }, [tasks]);

  const toggleExpand = (status: string) => {
    setExpandedStatus(prev => ({ ...prev, [status]: !prev[status] }));
  };

  const handleUpdate = async (task: any, updates: any) => {
    try {
      await updateTask(task.id, updates);
    } catch {
      /* error already handled by useTaskMutations */
    }
  };

  const renderGroup = (statusKey: string, title: string, list: any[], colorStyle: any) => {
    const isExpanded = expandedStatus[statusKey];
    return (
      <div key={statusKey} className="space-y-1 bg-card rounded-2xl border border-border/80 p-3 shadow-sm">
        <button
          onClick={() => toggleExpand(statusKey)}
          className="flex items-center gap-2 w-full text-left font-black uppercase text-xs tracking-wider pb-2 border-b border-border/40"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          <span style={{ color: colorStyle.text }}>{title}</span>
          <span className="bg-muted text-muted-foreground font-black px-1.5 py-0.5 rounded-full text-[9px] ml-2">
            {list.length}
          </span>
        </button>

        {isExpanded && (
          <div className="pt-2 divide-y divide-border/30">
            {list.length === 0 ? (
              <p className="text-[11px] text-muted-foreground/60 py-3 text-center">No tasks in this status</p>
            ) : (
              list.map((task) => {
                const ps = priorityStyleFor(task.priority);
                return (
                  <div key={task.id} className="flex items-center justify-between py-2.5 group">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdate(task, { status: task.status === "done" ? "todo" : "done" })}
                        className="h-4 w-4 rounded border transition-colors flex items-center justify-center"
                        style={
                          task.status === "done"
                            ? { background: "var(--q-success)", borderColor: "var(--q-success)", color: "var(--q-surface)" }
                            : { borderColor: "var(--q-border-strong)" }
                        }
                      >
                        {task.status === "done" && <Check className="h-3 w-3" />}
                      </button>
                      <span className={cn("text-xs font-bold text-foreground", task.status === "done" && "line-through text-muted-foreground/50")}>
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {task.dueDate && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                          <Calendar className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span
                        className="text-[9px] font-black uppercase tracking-wider border rounded-full px-2 py-0.5"
                        style={{ background: ps.bg, color: ps.text, borderColor: ps.border }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
      {renderGroup("todo", "To Do", tasksByStatus.todo, STATUS_COLORS.todo)}
      {renderGroup("inProgress", "In Progress", tasksByStatus.inProgress, STATUS_COLORS.inProgress)}
      {renderGroup("waiting", "Waiting", tasksByStatus.waiting, STATUS_COLORS.waiting)}
      {renderGroup("done", "Complete / Done", tasksByStatus.done, STATUS_COLORS.done)}
    </div>
  );
}

/* ==========================================================================
   TASK BOARD (KANBAN) VIEW
   ========================================================================== */
export function TaskBoardView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];
  const { updateTask } = useTaskMutations(organizationId);

  const columns = [
    { key: "todo", label: "To Do", color: STATUS_COLORS.todo },
    { key: "inProgress", label: "In Progress", color: STATUS_COLORS.inProgress },
    { key: "waiting", label: "Waiting", color: STATUS_COLORS.waiting },
    { key: "done", label: "Done", color: STATUS_COLORS.done },
  ];

  const handleUpdate = async (task: any, updates: any) => {
    try {
      await updateTask(task.id, updates);
    } catch {
      /* error already handled by useTaskMutations */
    }
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-[550px] overflow-hidden">
      {columns.map((col) => {
        const colTasks = tasks.filter(t => t.status === col.key);
        return (
          <div key={col.key} className="flex flex-col bg-muted/20 border border-border/80 rounded-2xl p-3 h-full overflow-hidden">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-3">
              <span className="text-xs font-black uppercase tracking-wider" style={{ color: col.color.text }}>{col.label}</span>
              <span className="bg-muted text-muted-foreground font-black px-1.5 py-0.5 rounded-full text-[9px]">
                {colTasks.length}
              </span>
            </div>

            {/* Cards container */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-none">
              {colTasks.map((task) => {
                const priorityStyle = priorityStyleFor(task.priority);
                return (
                  <div key={task.id} className="bg-card border border-border/80 hover:border-primary/20 p-3 rounded-xl shadow-sm transition-colors group">
                    <h4 className="text-xs font-bold text-foreground leading-snug">{task.title}</h4>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/30">
                      {task.dueDate ? (
                        <span className="text-[9px] text-muted-foreground font-bold flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      ) : <span />}

                      <span
                        className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border"
                        style={{ background: priorityStyle.bg, color: priorityStyle.text, borderColor: priorityStyle.border }}
                      >
                        {task.priority}
                      </span>
                    </div>

                    {/* Cycle buttons */}
                    <div className="mt-2.5 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {columns.filter(c => c.key !== task.status).slice(0, 2).map((c) => (
                        <button
                          key={c.key}
                          onClick={() => handleUpdate(task, { status: c.key })}
                          className="text-[9px] font-black text-muted-foreground hover:text-foreground bg-muted/60 px-1.5 py-0.5 rounded"
                        >
                          → {c.label.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {colTasks.length === 0 && (
                <div className="text-center py-8 text-[11px] text-muted-foreground/40 font-bold">No Tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   TASK CALENDAR VIEW
   ========================================================================== */
export function TaskCalendarView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill prefix spaces for the starting day of the week
    const startDay = date.getDay();
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Fill actual month dates
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return days;
  }, [currentDate]);

  const tasksByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const t of tasks) {
      if (t.dueDate) {
        const d = new Date(t.dueDate);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)?.push(t);
      }
    }
    return map;
  }, [tasks]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-md flex flex-col h-[550px]">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
        <h3 className="text-sm font-black text-foreground">
          {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} className="px-2.5 py-1 text-xs font-bold bg-muted hover:bg-muted/80 border rounded-lg">Prev</button>
          <button onClick={nextMonth} className="px-2.5 py-1 text-xs font-bold bg-muted hover:bg-muted/80 border rounded-lg">Next</button>
        </div>
      </div>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 gap-1.5 text-center mb-1 bg-muted/20 py-1.5 rounded-lg border border-border/40">
        {weekdayLabels.map((w) => (
          <span key={w} className="text-[10px] font-black uppercase text-muted-foreground">{w}</span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5 flex-1 overflow-y-auto pr-1">
        {daysInMonth.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="bg-muted/5 border border-transparent rounded-lg min-h-[60px]" />;
          
          const key = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const dayTasks = tasksByDay.get(key) || [];
          const isToday = new Date().toDateString() === day.toDateString();

          return (
            <div
              key={key}
              className={cn(
                "bg-muted/10 border border-border/40 rounded-xl p-1.5 min-h-[65px] flex flex-col justify-between transition-colors hover:bg-muted/20",
                isToday && "ring-2 ring-primary/40 bg-muted/20 border-primary/20"
              )}
            >
              <div className="flex justify-between items-center">
                <span className={cn("text-[10px] font-bold text-muted-foreground", isToday && "text-primary font-black")}>
                  {day.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <span className="bg-primary/20 text-primary rounded-full text-[8px] font-black h-3.5 w-3.5 flex items-center justify-center">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks bullet list */}
              <div className="mt-1 space-y-0.5 overflow-hidden flex-1 max-h-[40px]">
                {dayTasks.slice(0, 2).map((t: any) => (
                  <div key={t.id} className="text-[8px] font-bold truncate text-foreground/80 bg-card border border-border/40 px-1 py-0.5 rounded">
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[7px] text-muted-foreground/60 font-black text-center mt-0.5">
                    +{dayTasks.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ==========================================================================
   TASK TIMELINE (GANTT) VIEW
   ========================================================================== */
export function TaskTimelineView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  const timelineData = useMemo(() => {
    const withDue = tasks.filter(t => t.dueDate).map(t => ({
      ...t,
      dueTime: new Date(t.dueDate!).getTime(),
    })).sort((a, b) => a.dueTime - b.dueTime);

    if (withDue.length === 0) return [];

    const minTime = withDue[0].dueTime - 5 * 86400000; // start 5 days before first due date
    const maxTime = withDue[withDue.length - 1].dueTime + 5 * 86400000;
    const span = maxTime - minTime || 86400000;

    return withDue.map((t) => {
      // Simulate progress bar starting 3 days before due date
      const start = t.dueTime - 3 * 86400000;
      const left = Math.max(0, ((start - minTime) / span) * 100);
      const width = Math.min(100 - left, (3 * 86400000 / span) * 100);
      return {
        ...t,
        left,
        width: Math.max(width, 2),
      };
    });
  }, [tasks]);

  return (
    <div className="bg-card border border-border rounded-2xl p-4 shadow-md flex flex-col h-[550px]">
      <div className="pb-3 border-b border-border/40 mb-3 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">Project Timeline & Duration Map</span>
        <span className="text-[10px] font-bold text-muted-foreground/60">{timelineData.length} tasks scheduled</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-none">
        {timelineData.map((task) => {
          const statusStyle = statusStyleFor(task.status);
          return (
            <div key={task.id} className="flex items-center gap-3 p-2 bg-muted/10 border border-border/40 hover:border-primary/20 rounded-xl transition-colors">
              <div className="w-48 shrink-0 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{task.title}</p>
                <p className="text-[9px] text-muted-foreground/60 font-semibold mt-0.5">Due: {new Date(task.dueDate!).toLocaleDateString()}</p>
              </div>

              {/* Gantt Bar */}
              <div className="flex-1 relative h-6 bg-muted/30 border border-border/30 rounded-lg overflow-hidden">
                <div
                  className="absolute h-4 top-1 rounded-md transition-all border shadow-sm"
                  style={{
                    left: `${task.left}%`,
                    width: `${task.width}%`,
                    background: statusStyle.bg,
                    borderColor: statusStyle.border,
                  }}
                />
              </div>
            </div>
          );
        })}
        {timelineData.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <Clock className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs font-bold text-muted-foreground/60">No tasks with due dates to map</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   TASK MAP VIEW (LAND OF COUNTRIES)
   ========================================================================== */
export function TaskMapView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];

  // Categorize tasks by country matching in their tags or title
  const countriesData = useMemo(() => {
    const list = [
      { name: "Egypt", coords: "30.0444° N, 31.2357° E", color: "bg-emerald-500", text: "text-emerald-500" },
      { name: "Saudi Arabia", coords: "24.7136° N, 46.6753° E", color: "bg-blue-500", text: "text-blue-500" },
      { name: "Jordan", coords: "31.9522° N, 35.9106° E", color: "bg-purple-500", text: "text-purple-500" },
      { name: "Germany", coords: "51.1657° N, 10.4515° E", color: "bg-amber-500", text: "text-amber-500" },
      { name: "United States", coords: "37.0902° N, 95.7129° W", color: "bg-rose-500", text: "text-rose-500" },
    ];

    return list.map((c) => {
      const countryTasks = tasks.filter((t) => {
        const titleMatch = t.title.toLowerCase().includes(c.name.toLowerCase());
        const descMatch = t.description?.toLowerCase().includes(c.name.toLowerCase());
        const tagMatch = (t.tags || []).some(tag => tag.toLowerCase() === c.name.toLowerCase());
        return titleMatch || descMatch || tagMatch;
      });

      const total = countryTasks.length;
      const completed = countryTasks.filter(t => t.status === "done").length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        ...c,
        flag: COUNTRY_FLAGS[c.name] || "🏳️",
        tasks: countryTasks,
        total,
        completed,
        pct,
      };
    }).sort((a, b) => b.total - a.total);
  }, [tasks]);

  const unassignedTasks = useMemo(() => {
    return tasks.filter((t) => {
      return !countriesData.some(c => {
        const titleMatch = t.title.toLowerCase().includes(c.name.toLowerCase());
        const descMatch = t.description?.toLowerCase().includes(c.name.toLowerCase());
        const tagMatch = (t.tags || []).some(tag => tag.toLowerCase() === c.name.toLowerCase());
        return titleMatch || descMatch || tagMatch;
      });
    });
  }, [tasks, countriesData]);

  return (
    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
      {/* Geographic Header Info */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <Globe2 className="h-6 w-6 text-primary shrink-0 animate-spin-slow" />
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-foreground">Global Operations Map</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tasks mapped to operations in target sovereign countries. Tag tasks with country names to pin them.</p>
        </div>
      </div>

      {/* Grid of Sovereign Country Cards */}
      <div className="grid grid-cols-3 gap-4">
        {countriesData.map((country) => (
          <div key={country.name} className="bg-card border border-border/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between min-h-[170px] hover:border-primary/20 transition-colors">
            <div>
              {/* Flag + Name */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl leading-none shrink-0">{country.flag}</span>
                  <h4 className="text-sm font-black text-foreground">{country.name}</h4>
                </div>
                <span className={cn("text-[9px] font-bold text-muted-foreground/60 font-mono")}>{country.coords}</span>
              </div>

              {/* Progress metric */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1">
                  <span>Tasks Completed</span>
                  <span className="text-foreground">{country.pct}% ({country.completed}/{country.total})</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", country.color)}
                    style={{ width: `${country.pct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Country Task List items */}
            <div className="mt-4 pt-2 border-t border-border/40 flex-1">
              <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-1.5">MAPPED TASKS</p>
              {country.tasks.length === 0 ? (
                <p className="text-[10px] text-muted-foreground/40 font-bold italic py-1">No operations pinned</p>
              ) : (
                <div className="space-y-1 max-h-[60px] overflow-y-auto scrollbar-none">
                  {country.tasks.map(t => (
                    <div key={t.id} className="text-[10px] font-bold text-foreground/80 flex items-center gap-1.5 truncate">
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", country.color)} />
                      <span className="truncate">{t.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Unassigned to Map section */}
      {unassignedTasks.length > 0 && (
        <div className="bg-muted/10 border border-border/60 rounded-2xl p-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground/80 mb-2">Unassigned Locations ({unassignedTasks.length})</h4>
          <div className="flex flex-wrap gap-2">
            {unassignedTasks.map(t => (
              <span key={t.id} className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2.5 py-1 border border-border/40 rounded-lg">
                {t.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
