"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, ChevronDown, ChevronRight, Circle, Expand, GripVertical, ListFilter, MoreHorizontal, Plus, Search, Save, Trash2, UserRound, X } from "lucide-react";
import {
  DateEditor,
  NameCell,
  PriorityEditor,
  QentrahTable,
  StatusEditor,
  type QentrahColumnDef,
  type QentrahTableRef,
} from "@qentrah/ui/qentrah-table";
import type { TaskRecord } from "../../tasks.types";
import { sortPipelineTasks } from "../../task-pipeline-order";
import { TASK_STAGES, normalizeTaskStatus } from "../../tasks.constants";
import { useCreateSavedViewMutation, useDefaultSavedViewQuery } from "../../api/saved-views";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { TaskTableFieldsPanel } from "../task-table-fields-panel";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const TASK_TABLE_COLUMN_DEFAULTS = {
  filter: false,
  sortable: false,
  suppressHeaderMenuButton: true,
  suppressHeaderFilterButton: true,
} as const;

const TASK_TABLE_ROW_HEIGHT = 36;
const TASK_TABLE_COLUMNS = "48px minmax(240px,1.4fr) 180px 150px 160px 150px minmax(160px,0.9fr) 48px";

function plainText(value: string | undefined) {
  return value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

type TaskCreateDefaults = Pick<Partial<TaskRecord>, "status" | "priority">;
type TaskGroupBy = "none" | "status" | "priority";
type SortDirection = "ascending" | "descending";
type DragState = { id: string; group: string } | null;

interface TaskTableViewProps {
  tasks: TaskRecord[];
  organizationId?: string;
  projectId?: string | null;
  spaceId?: string | null;
  memberOptions?: WorkOsPickerOption[];
  onTaskOpen?: (taskId: string) => void;
  onTaskUpdate?: (task: TaskRecord, changes: Partial<TaskRecord>) => void | Promise<void>;
  onTaskDelete?: (task: TaskRecord) => void | Promise<void>;
  onTaskCreate?: (title: string, defaults?: TaskCreateDefaults) => void | Promise<void>;
  onTaskMove?: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
}

function DescriptionCell({ task, onCommit }: { task: TaskRecord; onCommit: (value: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(() => plainText(task.description) ?? "");

  function commit() {
    setEditing(false);
    if (draft !== (plainText(task.description) ?? "")) onCommit(draft);
  }

  if (editing) {
    return (
      <textarea
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") commit();
          if (event.key === "Escape") {
            setDraft(plainText(task.description) ?? "");
            setEditing(false);
          }
        }}
        aria-label={`Notes for ${task.title}`}
        className="h-8 w-full resize-none rounded border border-ring/40 bg-background px-2 py-1 text-xs text-foreground outline-none"
      />
    );
  }

  return (
    <button
      type="button"
      onDoubleClick={() => setEditing(true)}
      title="Double-click to add notes"
      className="block w-full truncate text-left text-[12px] text-muted-foreground/70"
    >
      {plainText(task.description) || "Add notes…"}
    </button>
  );
}

function MultiAssigneeCell({
  task,
  options,
  onChange,
}: {
  task: TaskRecord;
  options: WorkOsPickerOption[];
  onChange: (ids: string[]) => void;
}) {
  const [query, setQuery] = useState("");
  const ids = task.assigneeUserIds ?? (task.assigneeUserId ? [task.assigneeUserId] : []);
  const selected = options.filter((option) => ids.includes(option.id));
  const visible = options.filter((option) => option.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <Popover onOpenChange={(open) => { if (!open) setQuery(""); }}>
      <PopoverTrigger
        render={
          <button type="button" className="flex h-7 min-w-0 items-center rounded px-1 hover:bg-muted">
            {selected.length ? (
              <span className="flex min-w-0 items-center gap-2">
                <span className="flex -space-x-1.5">
                  {selected.slice(0, 3).map((person) => (
                    <span key={person.id} title={person.label} className="flex size-5 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-primary/10 text-[8px] font-black text-primary">
                      {person.imageUrl ? <img src={person.imageUrl} alt="" className="size-full object-cover" /> : person.label.slice(0, 2).toUpperCase()}
                    </span>
                  ))}
                </span>
                <span className="truncate text-xs text-foreground">{selected.length === 1 ? selected[0]?.label : `${selected.length} people`}</span>
              </span>
            ) : <span className="text-xs text-muted-foreground">—</span>}
          </button>
        }
      />
      <PopoverContent align="start" className="w-64 rounded-xl p-1.5">
        <div className="mb-1 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2 py-1.5">
          <Search className="size-3.5 text-muted-foreground" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members…" className="min-w-0 flex-1 bg-transparent text-xs outline-none" />
        </div>
        {visible.map((person) => {
          const active = ids.includes(person.id);
          return (
            <button key={person.id} type="button" onClick={() => onChange(active ? ids.filter((id) => id !== person.id) : [...ids, person.id])} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs hover:bg-muted">
              <span className="flex size-6 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-[9px] font-black text-primary">{person.imageUrl ? <img src={person.imageUrl} alt="" className="size-full object-cover" /> : person.label.slice(0, 2).toUpperCase()}</span>
              <span className="min-w-0 flex-1 truncate">{person.label}</span>
              {active ? <Check className="size-3.5 text-primary" /> : null}
            </button>
          );
        })}
        {!visible.length ? <p className="px-2 py-3 text-xs text-muted-foreground">No members found</p> : null}
      </PopoverContent>
    </Popover>
  );
}

const STATUS_GROUPS: Array<{ key: TaskRecord["status"]; label: string; color: string }> = TASK_STAGES.map((stage) => ({
  key: stage.key,
  label: stage.name,
  color:
    stage.key === "todo"
      ? "bg-zinc-600"
      : stage.key === "inProgress"
        ? "bg-blue-600"
        : stage.key === "waiting"
          ? "bg-violet-600"
          : stage.key === "done"
            ? "bg-emerald-600"
            : "bg-zinc-600",
}));

const PRIORITY_GROUPS: Array<{ key: TaskRecord["priority"]; label: string; color: string }> = [
  { key: "urgent", label: "Urgent", color: "bg-red-600" },
  { key: "high", label: "High", color: "bg-amber-500" },
  { key: "normal", label: "Normal", color: "bg-blue-600" },
  { key: "low", label: "Low", color: "bg-zinc-500" },
];

function AddTaskRow({
  onTaskCreate,
  defaults,
}: {
  onTaskCreate?: (title: string, defaults?: TaskCreateDefaults) => void | Promise<void>;
  defaults?: TaskCreateDefaults;
}) {
  const [title, setTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const canSave = title.trim().length > 0 && !isSaving;

  async function save() {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onTaskCreate?.(title.trim(), defaults);
      setTitle("");
      setIsEditing(false);
    } catch {
      // The mutation displays the error toast. Preserve the title for retry.
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      onDoubleClick={() => setIsEditing(true)}
      className="grid h-9 shrink-0 cursor-text border-b border-[color-mix(in_srgb,var(--q-border)_72%,transparent)] bg-[var(--q-bg)] text-[12px] text-muted-foreground hover:bg-[var(--q-bg-secondary)]"
      style={{ gridTemplateColumns: TASK_TABLE_COLUMNS }}
    >
      <div className="flex items-center justify-center border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)] text-muted-foreground">
        <Plus className="h-3.5 w-3.5" />
      </div>
      <div className="flex items-center gap-2 border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)] px-3">
        {isEditing ? (
          <>
            <Circle className="h-3 w-3 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={title}
              onClick={(event) => event.stopPropagation()}
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void save();
                if (event.key === "Escape") {
                  setTitle("");
                  setIsEditing(false);
                }
              }}
              onBlur={() => {
                if (!title.trim()) setIsEditing(false);
              }}
              placeholder="Task Name or type '/' for commands"
              className="h-full min-w-0 flex-1 bg-transparent text-[12px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          </>
        ) : (
          <span className="text-muted-foreground">Task Name or type '/' for commands</span>
        )}
      </div>
      <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)]" />
      <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)]" />
      <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)]" />
      <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)]" />
      <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)]" />
      <div className="flex items-center justify-end gap-1 px-1">
        {isEditing && title.trim() ? (
          <>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setTitle("");
              }}
              onMouseDown={(event) => event.preventDefault()}
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-[var(--q-bg-secondary)] hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={(event) => {
                event.stopPropagation();
                void save();
              }}
              onMouseDown={(event) => event.preventDefault()}
              className="flex h-5 items-center gap-1 rounded bg-foreground px-1.5 text-[10px] font-semibold text-background disabled:opacity-50"
            >
              <Save className="h-3 w-3" />
              Save
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function TaskTableControls({
  groupBy,
  sortDirection,
  isSaving,
  onGroupChange,
  onSortChange,
  onSaveView,
  selectedCount,
  onCompleteSelected,
  onDeleteSelected,
}: {
  groupBy: TaskGroupBy;
  sortDirection: SortDirection;
  isSaving: boolean;
  onGroupChange: (value: TaskGroupBy) => void;
  onSortChange: (value: SortDirection) => void;
  onSaveView: () => void;
  selectedCount: number;
  onCompleteSelected: () => void;
  onDeleteSelected: () => void;
}) {
  const groupLabel = groupBy === "none" ? "None" : groupBy === "status" ? "Status" : "Priority";

  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-3 border-b border-[color-mix(in_srgb,var(--q-border)_78%,transparent)] bg-[var(--q-bg)] px-3">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="inline-flex h-7 items-center gap-2 rounded-md border border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-transparent px-2.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-[var(--q-bg-secondary)] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          }
        >
          <ListFilter className="h-3.5 w-3.5" />
          <span>Group:</span>
          <span className="text-foreground">{groupLabel}</span>
          <ChevronDown className="h-3 w-3" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" collisionPadding={12} sideOffset={6} className="w-56 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
          <div className="px-2 py-1.5 text-[10px] font-semibold uppercase text-muted-foreground">Group by</div>
          {[
            ["none", "None", "Flat editable table"],
            ["status", "Status", "Create draggable status sections"],
            ["priority", "Priority", "Create priority sections"],
          ].map(([value, label, description]) => (
            <DropdownMenuItem
              key={value}
              onClick={() => onGroupChange(value as TaskGroupBy)}
              className="flex items-center justify-between gap-3 rounded px-2 py-2"
            >
              <span className="min-w-0">
                <span className="block text-[12px] font-semibold text-foreground">{label}</span>
                <span className="block truncate text-[10px] text-muted-foreground">{description}</span>
              </span>
              {groupBy === value ? <Check className="h-3.5 w-3.5 shrink-0 text-violet-300" /> : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="flex items-center gap-2">
        {selectedCount > 0 ? (
          <>
            <span className="text-[11px] font-medium text-muted-foreground">{selectedCount} selected</span>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<button type="button" aria-label="Actions for selected tasks" className="inline-flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-[var(--q-bg-secondary)] hover:text-foreground" />}
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-lg p-1.5">
                <DropdownMenuItem onClick={onCompleteSelected} className="gap-2 rounded px-2 py-2 text-xs">
                  <CheckCircle2 className="size-3.5" /> Mark complete
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDeleteSelected} className="gap-2 rounded px-2 py-2 text-xs text-destructive focus:text-destructive">
                  <Trash2 className="size-3.5" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
        {groupBy !== "none" ? (
          <>
            <button
              type="button"
              onClick={onSaveView}
              disabled={isSaving}
              className="inline-flex h-7 items-center rounded-md bg-amber-500 px-2.5 text-[11px] font-bold text-black transition-colors hover:bg-amber-400 disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save view"}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button
                    type="button"
                    className="inline-flex h-7 items-center gap-2 rounded-md border border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-transparent px-2.5 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-[var(--q-bg-secondary)] hover:text-foreground"
                  />
                }
              >
                {sortDirection === "ascending" ? "Ascending" : "Descending"}
                <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" collisionPadding={12} sideOffset={6} className="w-40 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
                {[
                  ["ascending", "Ascending"],
                  ["descending", "Descending"],
                ].map(([value, label]) => (
                  <DropdownMenuItem
                    key={value}
                    onClick={() => onSortChange(value as SortDirection)}
                    className="flex h-8 items-center justify-between rounded px-2 text-[12px] font-medium"
                  >
                    {label}
                    {sortDirection === value ? <Check className="h-3.5 w-3.5 text-violet-300" /> : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : null}
      </div>
    </div>
  );
}

export function TaskTableView({
  tasks,
  organizationId,
  projectId,
  spaceId,
  memberOptions = [],
  onTaskOpen,
  onTaskUpdate,
  onTaskDelete,
  onTaskCreate,
  onTaskMove,
}: TaskTableViewProps) {
  const tableRef = useRef<QentrahTableRef<TaskRecord>>(null);
  const [groupBy, setGroupBy] = useState<TaskGroupBy>("none");
  const [sortDirection, setSortDirection] = useState<SortDirection>("descending");
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());
  const [dragging, setDragging] = useState<DragState>(null);
  const [selectedTasks, setSelectedTasks] = useState<TaskRecord[]>([]);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const createSavedView = useCreateSavedViewMutation();
  const defaultView = useDefaultSavedViewQuery({
    resourceType: "task",
    viewType: "table",
    organizationId,
    projectId: projectId ?? undefined,
    spaceId: spaceId ?? undefined,
  });
  const savedViewGroupBy = defaultView.data?.config.groupBy ?? null;
  const savedViewVersion = defaultView.data?.config.taskTableVersion ?? null;

  useEffect(() => {
    if (savedViewVersion !== 2) return;
    if (savedViewGroupBy === "status" || savedViewGroupBy === "priority" || savedViewGroupBy === "none") {
      setGroupBy(savedViewGroupBy);
    }
  }, [savedViewGroupBy, savedViewVersion]);

  const rows = useMemo(
    () => tasks.filter((task) => !task._deleted),
    [tasks],
  );

  async function updateTask(task: TaskRecord, changes: Partial<TaskRecord>) {
    const optimistic = { ...task, ...changes };
    tableRef.current?.applyUpdate([optimistic]);
    try {
      await onTaskUpdate?.(task, changes);
    } catch {
      tableRef.current?.applyUpdate([task]);
    }
  }

  function saveView() {
    if (!organizationId) return;
    createSavedView.mutate({
      name: groupBy === "status" ? "Tasks grouped by status" : "Tasks grouped by priority",
      resourceType: "task",
      viewType: "table",
      scope: projectId ? "project" : spaceId ? "space" : "workspace",
      scopeKey: projectId ?? spaceId ?? organizationId,
      organizationId,
      projectId: projectId ?? undefined,
      spaceId: spaceId ?? undefined,
      config: { groupBy, sortBy: sortDirection, taskTableVersion: 2 },
      isDefault: true,
    });
  }

  const columns = useMemo<QentrahColumnDef<TaskRecord>[]>(
    () => [
      {
        ...TASK_TABLE_COLUMN_DEFAULTS,
        headerName: "",
        field: "id",
        width: 48,
        minWidth: 48,
        maxWidth: 48,
        pinned: "left",
        resizable: false,
        valueGetter: (params) => {
          const rowIndex = params.node?.rowIndex;
          return typeof rowIndex === "number" ? rowIndex + 1 : "";
        },
        cellClass: "text-muted-foreground text-[11px] justify-center",
      },
      {
        ...TASK_TABLE_COLUMN_DEFAULTS,
        headerName: "Name",
        field: "title",
        flex: 1.4,
        minWidth: 240,
        cellRenderer: (params: { data?: TaskRecord; value?: string }) => {
          if (!params.data) return null;
          const task = params.data as TaskRecord;
          return (
            <div className="group/name flex min-w-0 items-center gap-1">
              <div className="min-w-0 flex-1">
                <NameCell value={params.value ?? ""} status={normalizeTaskStatus(task.status)} onCommit={(next) => void updateTask(task, { title: next })} />
              </div>
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); onTaskOpen?.(task.id); }}
                aria-label={`Open ${task.title}`}
                title="Open task"
                className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover/name:opacity-100 focus:opacity-100"
              >
                <Expand className="size-3.5" />
              </button>
            </div>
          );
        },
      },
      {
        ...TASK_TABLE_COLUMN_DEFAULTS,
        headerName: "Assignee",
        field: "assigneeUserId",
        minWidth: 180,
        flex: 0.8,
        cellRenderer: (params: { data?: TaskRecord; value?: string }) => {
          if (!params.data) return null;
          return (
            <MultiAssigneeCell
              task={params.data as TaskRecord}
              options={memberOptions}
              onChange={(ids) => void updateTask(params.data as TaskRecord, { assigneeUserIds: ids, assigneeUserId: ids[0] ?? "" })}
            />
          );
        },
      },
      {
        ...TASK_TABLE_COLUMN_DEFAULTS,
        headerName: "Status",
        field: "status",
        minWidth: 150,
        cellRenderer: (params: { data?: TaskRecord; value?: TaskRecord["status"] }) => {
          if (!params.data) return null;
          return (
            <StatusEditor
              value={normalizeTaskStatus(params.value)}
              onChange={(next) => void updateTask(params.data as TaskRecord, { status: next as TaskRecord["status"] })}
            />
          );
        },
      },
      {
        ...TASK_TABLE_COLUMN_DEFAULTS,
        headerName: "Due date",
        field: "dueDate",
        minWidth: 160,
        cellRenderer: (params: { data?: TaskRecord; value?: string }) => {
          if (!params.data) return null;
          return (
            <DateEditor
              value={params.value ?? null}
              onChange={(next) => void updateTask(params.data as TaskRecord, { dueDate: next ?? "" })}
            />
          );
        },
      },
      {
        ...TASK_TABLE_COLUMN_DEFAULTS,
        headerName: "Priority",
        field: "priority",
        minWidth: 150,
        cellRenderer: (params: { data?: TaskRecord; value?: TaskRecord["priority"] }) => {
          if (!params.data) return null;
          return (
            <PriorityEditor
              value={params.value ?? "normal"}
              clearable
              onClear={() => void updateTask(params.data as TaskRecord, { priority: "normal" })}
              onChange={(next) => void updateTask(params.data as TaskRecord, { priority: next as TaskRecord["priority"] })}
            />
          );
        },
      },
      {
        ...TASK_TABLE_COLUMN_DEFAULTS,
        headerName: "Description",
        field: "description",
        minWidth: 160,
        flex: 0.9,
        cellRenderer: (params: { data?: TaskRecord }) => params.data ? (
          <DescriptionCell task={params.data} onCommit={(description) => void updateTask(params.data as TaskRecord, { description })} />
        ) : null,
      },
      {
        ...TASK_TABLE_COLUMN_DEFAULTS,
        headerName: "",
        field: "updatedAt",
        width: 48,
        minWidth: 48,
        maxWidth: 48,
        resizable: false,
        headerComponent: () => (
          <button type="button" onClick={() => setFieldsOpen(true)} aria-label="Add task field" title="Add task field" className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground">
            <Plus className="size-3.5" />
          </button>
        ),
        cellRenderer: () => null,
        cellClass: "justify-center",
      },
    ],
    [memberOptions, onTaskOpen],
  );

  const groupedSections = useMemo(() => {
    const activeGroupBy: "status" | "priority" = groupBy === "priority" ? "priority" : "status";
    const groupDefs = activeGroupBy === "priority" ? PRIORITY_GROUPS : STATUS_GROUPS;
    const sections = groupDefs.map((group) => {
      const groupRows = rows.filter((task) => {
        if (activeGroupBy === "status") return normalizeTaskStatus(task.status) === group.key;
        return task.priority === group.key;
      });
      return { ...group, rows: sortPipelineTasks(groupRows) };
    });
    return sortDirection === "ascending" ? sections.slice().reverse() : sections;
  }, [groupBy, rows, sortDirection]);

  function toggleGroup(groupKey: string) {
    setCollapsedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      return next;
    });
  }

  function dropTask(targetGroup: string, targetIndex: number) {
    if (!dragging) return;
    if (groupBy === "status") {
      onTaskMove?.(dragging.id, dragging.group, targetGroup, targetIndex);
    }
    if (groupBy === "priority") {
      const task = rows.find((row) => row.id === dragging.id);
      if (task) void updateTask(task, { priority: targetGroup as TaskRecord["priority"] });
    }
    setDragging(null);
  }

  async function completeSelected() {
    await Promise.all(selectedTasks.map((task) => updateTask(task, { status: "done" })));
    tableRef.current?.api?.deselectAll();
    setSelectedTasks([]);
  }

  async function deleteSelected() {
    await Promise.all(selectedTasks.map((task) => onTaskDelete?.(task)));
    tableRef.current?.api?.deselectAll();
    setSelectedTasks([]);
  }

  const flatTable = (
    <div className="min-w-[980px] overflow-hidden rounded-lg">
      <QentrahTable
        ref={tableRef}
        rows={rows}
        columns={columns}
        density="normal"
        theme="auto"
        height="auto"
        domLayout="autoHeight"
        rowSelection={{
          mode: "multiRow",
          headerCheckbox: true,
          checkboxes: true,
          hideDisabledCheckboxes: false,
          enableClickSelection: false,
        }}
        suppressRowClickSelection
        onSelectionChanged={(event) => setSelectedTasks(event.api.getSelectedRows())}
        animateRows={false}
        emptyMessage="No tasks"
        className="qentrah-task-table"
        getRowHeight={() => TASK_TABLE_ROW_HEIGHT}
      />
      <AddTaskRow onTaskCreate={onTaskCreate} />
    </div>
  );

  const groupedTable = (
    <div className="min-w-[980px] overflow-hidden rounded-lg">
      <div
        className="grid h-8 items-center border-b border-[color-mix(in_srgb,var(--q-border)_78%,transparent)] bg-[var(--q-bg-secondary)] text-[11px] font-semibold text-muted-foreground"
        style={{ gridTemplateColumns: TASK_TABLE_COLUMNS }}
      >
        <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)]" />
        <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)] px-3">Name</div>
        <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)] px-3">Assignee</div>
        <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)] px-3">Status</div>
        <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)] px-3">Due date</div>
        <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)] px-3">Priority</div>
        <div className="border-r border-[color-mix(in_srgb,var(--q-border)_72%,transparent)] px-3">Description</div>
        <div className="px-3">+</div>
      </div>

      <div className="space-y-2 p-2">
        {groupedSections.map((group) => {
          const isCollapsed = collapsedGroups.has(group.key);
          return (
            <section
              key={group.key}
              className="overflow-hidden rounded-md border border-[color-mix(in_srgb,var(--q-border)_78%,transparent)] bg-[var(--q-bg)]"
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => dropTask(group.key, group.rows.length)}
            >
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className="flex h-8 w-full items-center gap-2 border-b border-[color-mix(in_srgb,var(--q-border)_65%,transparent)] bg-[var(--q-bg-secondary)] px-3 text-left transition-colors hover:bg-[var(--q-bg-tertiary)]"
              >
                {isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-black uppercase text-white ${group.color}`}>
                  {group.label}
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground">{group.rows.length}</span>
              </button>
              {!isCollapsed ? (
                <>
                  {group.rows.map((task, index) => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDragging({ id: task.id, group: groupBy === "priority" ? String(task.priority) : normalizeTaskStatus(task.status) })}
                      onDragEnd={() => setDragging(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.stopPropagation();
                        dropTask(group.key, index);
                      }}
                      className="group grid min-h-9 items-center border-b border-[color-mix(in_srgb,var(--q-border)_60%,transparent)] text-[12px] last:border-b-0 hover:bg-muted/20"
                      style={{ gridTemplateColumns: TASK_TABLE_COLUMNS }}
                    >
                      <div className="flex items-center justify-center gap-1 border-r border-[color-mix(in_srgb,var(--q-border)_60%,transparent)] text-muted-foreground">
                        <GripVertical className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                        <span>{index + 1}</span>
                      </div>
                      <div className="min-w-0 border-r border-[color-mix(in_srgb,var(--q-border)_60%,transparent)] px-2">
                        <NameCell value={task.title} status={normalizeTaskStatus(task.status)} onCommit={(next) => void updateTask(task, { title: next })} />
                      </div>
                      <div className="border-r border-[color-mix(in_srgb,var(--q-border)_60%,transparent)] px-2">
                        <MultiAssigneeCell task={task} options={memberOptions} onChange={(ids) => void updateTask(task, { assigneeUserIds: ids, assigneeUserId: ids[0] ?? "" })} />
                      </div>
                      <div className="border-r border-[color-mix(in_srgb,var(--q-border)_60%,transparent)] px-2">
                        <StatusEditor value={normalizeTaskStatus(task.status)} onChange={(next) => void updateTask(task, { status: next as TaskRecord["status"] })} />
                      </div>
                      <div className="border-r border-[color-mix(in_srgb,var(--q-border)_60%,transparent)] px-2">
                        <DateEditor value={task.dueDate ?? null} onChange={(next) => void updateTask(task, { dueDate: next ?? "" })} />
                      </div>
                      <div className="border-r border-[color-mix(in_srgb,var(--q-border)_60%,transparent)] px-2">
                        <PriorityEditor value={task.priority ?? "normal"} clearable onClear={() => void updateTask(task, { priority: "normal" })} onChange={(next) => void updateTask(task, { priority: next as TaskRecord["priority"] })} />
                      </div>
                      <div className="truncate border-r border-[color-mix(in_srgb,var(--q-border)_60%,transparent)] px-3 text-muted-foreground/70">
                        {task.description?.trim() || "-"}
                      </div>
                      <div className="h-full" />
                    </div>
                  ))}
                  <AddTaskRow onTaskCreate={onTaskCreate} defaults={groupBy === "status" ? { status: group.key as TaskRecord["status"] } : { priority: group.key as TaskRecord["priority"] }} />
                </>
              ) : null}
            </section>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="h-full min-h-0 overflow-auto bg-[var(--q-bg)] p-2">
      <TaskTableControls
        groupBy={groupBy}
        sortDirection={sortDirection}
        isSaving={createSavedView.isPending}
        onGroupChange={setGroupBy}
        onSortChange={setSortDirection}
        onSaveView={saveView}
        selectedCount={selectedTasks.length}
        onCompleteSelected={() => void completeSelected()}
        onDeleteSelected={() => void deleteSelected()}
      />
      <div className="pt-2">{groupBy === "none" ? flatTable : groupedTable}</div>
      {organizationId ? (
        <TaskTableFieldsPanel organizationId={organizationId} open={fieldsOpen} onClose={() => setFieldsOpen(false)} />
      ) : null}
    </div>
  );
}
