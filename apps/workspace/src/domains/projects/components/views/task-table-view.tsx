"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  useTasksQuery,
  useTasksGroupedQuery,
  readPersistedGroupBy,
  writePersistedGroupBy,
} from "@/domains/tasks/api/tasks";
import { useTaskMutations } from "@/domains/tasks/hooks/use-task-mutations";
import {
  useFieldDefinitionsQuery,
  useFieldValuesQuery,
  setCustomFieldValueRequest,
  type CustomFieldDefinition,
} from "@/domains/tasks/api/fields";
import { listOrganizationMembers } from "@/domains/organization/api/members";
import {
  ChevronDown,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  QentrahTable,
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
import { TaskTableSkeleton } from "@/domains/tasks/components/task-table-skeleton";

export function TaskTableView({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const tasksResult = useTasksQuery(organizationId, { projectId });
  const tasks = tasksResult.data ?? [];
  const { createTask, updateTask, deleteTask } = useTaskMutations(organizationId);
  const isLoading = tasksResult.data === undefined;

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

  if (isLoading) return <TaskTableSkeleton />;

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
