"use client";

import { useMemo, useState } from "react";
import { Calendar, Check, CheckCircle2, Circle, Flag, List, Plus, Save, Search, Tag, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TaskRecord, TaskStatus } from "../../tasks.types";
import { sortPipelineTasks } from "../../task-pipeline-order";
import { normalizeTaskStatus } from "../../tasks.constants";

interface TaskBoardViewProps {
  tasks: TaskRecord[];
  stages: Array<{ key: string; name: string; color?: string; order?: number }>;
  onCardMove: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
  onTaskCreate?: (title: string, defaults?: BoardCreateDefaults) => void | Promise<void>;
  className?: string;
}

type DragState = { id: string; fromStatus: TaskStatus } | null;
type BoardCreateDefaults = Pick<Partial<TaskRecord>, "status" | "priority" | "assigneeUserId" | "dueDate" | "tags">;

const COLUMN_TINT: Record<TaskStatus, string> = {
  todo: "bg-[#171717]",
  inProgress: "bg-[#141020]",
  waiting: "bg-[#161021]",
  done: "bg-[#0f1b16]",
  canceled: "bg-[#18181b]",
};

const COLUMN_BADGE: Record<TaskStatus, string> = {
  todo: "bg-zinc-700 text-zinc-100",
  inProgress: "bg-blue-600 text-white",
  waiting: "bg-violet-600 text-white",
  done: "bg-emerald-600 text-white",
  canceled: "bg-zinc-600 text-white",
};

const PRIORITY_FLAG: Record<TaskRecord["priority"], string> = {
  urgent: "text-red-400",
  high: "text-amber-300",
  normal: "text-blue-400",
  low: "text-zinc-400",
};

function BoardAddTask({
  status,
  assigneeOptions,
  onTaskCreate,
}: {
  status: TaskStatus;
  assigneeOptions: string[];
  onTaskCreate?: (title: string, defaults?: BoardCreateDefaults) => void | Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskRecord["priority"]>("normal");
  const [tags, setTags] = useState("");
  const [activeField, setActiveField] = useState<"assignee" | "date" | "priority" | "tags" | null>(null);
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const canSave = title.trim().length > 0 && !isSaving;
  const filteredAssignees = assigneeQuery
    ? assigneeOptions.filter((option) => option.toLowerCase().includes(assigneeQuery.toLowerCase()))
    : assigneeOptions;

  async function save() {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onTaskCreate?.(title.trim(), {
        status,
        priority,
        assigneeUserId: assigneeUserId.trim() || undefined,
        dueDate: dueDate || undefined,
        tags: tags.split(",").map((tag) => tag.trim()).filter(Boolean),
      });
      setTitle("");
      setAssigneeUserId("");
      setDueDate("");
      setPriority("normal");
      setTags("");
      setActiveField(null);
      setIsOpen(false);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Task
      </button>
    );
  }

  return (
    <div className="rounded-md border border-foreground/80 bg-[#151617] p-2 shadow-sm">
      <input
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") void save();
          if (event.key === "Escape") {
            setTitle("");
            setActiveField(null);
            setIsOpen(false);
          }
        }}
        placeholder="Task Name..."
        className="h-7 w-full bg-transparent text-[12px] font-semibold text-foreground outline-none placeholder:text-muted-foreground"
      />
      <div className="relative mt-2 space-y-1 text-[11px] font-medium text-muted-foreground">
        <button
          type="button"
          onClick={() => setActiveField(activeField === "assignee" ? null : "assignee")}
          className={cn("flex h-6 w-full items-center gap-2 rounded px-1.5 text-left hover:bg-white/[0.05] hover:text-foreground", assigneeUserId && "text-foreground")}
        >
          <UserRound className="h-3 w-3" />
          {assigneeUserId || "Add assignee"}
        </button>
        <button
          type="button"
          onClick={() => setActiveField(activeField === "date" ? null : "date")}
          className={cn("flex h-6 w-full items-center gap-2 rounded px-1.5 text-left hover:bg-white/[0.05] hover:text-foreground", dueDate && "text-foreground")}
        >
          <Calendar className="h-3 w-3" />
          {dueDate || "Add dates"}
        </button>
        <button
          type="button"
          onClick={() => setActiveField(activeField === "priority" ? null : "priority")}
          className="flex h-6 w-full items-center gap-2 rounded px-1.5 text-left capitalize text-foreground hover:bg-white/[0.05]"
        >
          <Flag className={cn("h-3 w-3", PRIORITY_FLAG[priority])} />
          {priority}
        </button>
        <button
          type="button"
          onClick={() => setActiveField(activeField === "tags" ? null : "tags")}
          className={cn("flex h-6 w-full items-center gap-2 rounded px-1.5 text-left hover:bg-white/[0.05] hover:text-foreground", tags && "text-foreground")}
        >
          <Tag className="h-3 w-3" />
          {tags || "Add tag"}
        </button>

        {activeField === "assignee" ? (
          <div className="absolute left-0 top-7 z-40 w-56 overflow-hidden rounded-lg border border-border bg-popover p-1.5 shadow-xl">
            <div className="mb-1 flex h-8 items-center gap-2 rounded bg-muted/50 px-2">
              <Search className="h-3 w-3" />
              <input
                value={assigneeQuery}
                onChange={(event) => setAssigneeQuery(event.target.value)}
                placeholder="Search or enter assignee..."
                className="min-w-0 flex-1 bg-transparent text-[12px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setAssigneeUserId(assigneeQuery.trim());
                setActiveField(null);
              }}
              disabled={!assigneeQuery.trim()}
              className="flex h-8 w-full items-center rounded px-2 text-left text-[12px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              Use typed assignee
            </button>
            {filteredAssignees.map((assignee) => (
              <button
                key={assignee}
                type="button"
                onClick={() => {
                  setAssigneeUserId(assignee);
                  setAssigneeQuery("");
                  setActiveField(null);
                }}
                className="flex h-8 w-full items-center justify-between rounded px-2 text-left text-[12px] font-semibold text-foreground hover:bg-muted"
              >
                <span className="truncate">{assignee}</span>
                {assigneeUserId === assignee ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setAssigneeUserId("");
                setActiveField(null);
              }}
              className="mt-1 flex h-8 w-full items-center rounded border-t border-border/70 px-2 text-left text-[12px] text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Clear assignee
            </button>
          </div>
        ) : null}

        {activeField === "date" ? (
          <div className="absolute left-0 top-14 z-40 w-52 overflow-hidden rounded-lg border border-border bg-popover p-2 shadow-xl">
            <input
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="h-8 w-full rounded border border-border bg-background px-2 text-[12px] font-semibold text-foreground outline-none"
            />
            <div className="mt-2 grid grid-cols-2 gap-1">
              {[
                ["Today", 0],
                ["Tomorrow", 1],
                ["Next week", 7],
                ["Clear", null],
              ].map(([label, offset]) => (
                <button
                  key={String(label)}
                  type="button"
                  onClick={() => {
                    if (typeof offset === "number") {
                      const date = new Date();
                      date.setDate(date.getDate() + offset);
                      setDueDate(date.toISOString().slice(0, 10));
                    } else {
                      setDueDate("");
                    }
                    setActiveField(null);
                  }}
                  className="h-7 rounded text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {activeField === "priority" ? (
          <div className="absolute left-0 top-20 z-40 w-36 overflow-hidden rounded-lg border border-border bg-popover p-1.5 shadow-xl">
            {(["urgent", "high", "normal", "low"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setPriority(value);
                  setActiveField(null);
                }}
                className="flex h-8 w-full items-center justify-between rounded px-2 text-left text-[12px] font-semibold capitalize text-foreground hover:bg-muted"
              >
                <span className="inline-flex items-center gap-2">
                  <Flag className={cn("h-3 w-3", PRIORITY_FLAG[value])} />
                  {value}
                </span>
                {priority === value ? <Check className="h-3.5 w-3.5" /> : null}
              </button>
            ))}
          </div>
        ) : null}

        {activeField === "tags" ? (
          <div className="absolute left-0 top-28 z-40 w-56 rounded-lg border border-border bg-popover p-2 shadow-xl">
            <input
              autoFocus
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") setActiveField(null);
              }}
              placeholder="tag, design, follow-up"
              className="h-8 w-full rounded border border-border bg-background px-2 text-[12px] font-semibold text-foreground outline-none placeholder:text-muted-foreground"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">Separate tags with commas.</p>
          </div>
        ) : null}
      </div>
      <div className="mt-2 flex justify-end gap-1">
        <button
          type="button"
          onClick={() => {
            setTitle("");
            setAssigneeUserId("");
            setDueDate("");
            setPriority("normal");
            setTags("");
            setActiveField(null);
            setIsOpen(false);
          }}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Cancel task"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          disabled={!canSave}
          onClick={() => void save()}
          className="inline-flex h-6 items-center gap-1 rounded bg-foreground px-2 text-[10px] font-bold text-background disabled:opacity-50"
        >
          <Save className="h-3 w-3" />
          Save
        </button>
      </div>
    </div>
  );
}

function BoardTaskCard({
  task,
  index,
  onDragStart,
  onDrop,
}: {
  task: TaskRecord;
  index: number;
  onDragStart: () => void;
  onDrop: (targetIndex: number) => void;
}) {
  const tagCount = task.tags?.length ?? 0;
  const assigneeLabel = task.assigneeUserId?.trim();

  return (
    <article
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.stopPropagation();
        onDrop(index);
      }}
      className="rounded-md border border-[color-mix(in_srgb,var(--q-border)_82%,transparent)] bg-[#101113] p-2.5 text-card-foreground shadow-sm transition-colors hover:border-foreground/30 hover:bg-[#141518]"
    >
      <div className="flex items-start gap-2">
        {task.status === "done" ? (
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
        ) : (
          <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <h4 className="line-clamp-2 min-w-0 flex-1 text-[12px] font-bold leading-5 text-foreground">{task.title}</h4>
      </div>

      {task.description ? (
        <p className="mt-1 line-clamp-2 pl-5 text-[11px] leading-4 text-muted-foreground">
          {task.description}
        </p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-5 text-[10px] font-semibold text-muted-foreground">
        {assigneeLabel ? (
          <span className="inline-flex h-5 max-w-[78px] items-center gap-1 rounded border border-border/70 px-1.5">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-violet-500 text-[8px] font-black text-white">
              {assigneeLabel.charAt(0).toUpperCase()}
            </span>
            <span className="truncate">{assigneeLabel}</span>
          </span>
        ) : null}

        {task.dueDate ? (
          <span className="inline-flex h-5 items-center gap-1 rounded border border-border/70 px-1.5">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="truncate">{new Date(task.dueDate).toLocaleDateString()}</span>
          </span>
        ) : null}

        {tagCount > 0 ? (
          <span className="inline-flex h-5 items-center gap-1 rounded border border-border/70 px-1.5">
            <Tag className="h-3 w-3 shrink-0" />
            {tagCount}
          </span>
        ) : null}

        <span className={cn("ml-auto inline-flex h-5 items-center gap-1 rounded border border-border/70 px-1.5 capitalize", PRIORITY_FLAG[task.priority])}>
          <Flag className="h-3 w-3" />
          {task.priority}
        </span>
      </div>

      {!task.description && !assigneeLabel && !task.dueDate && tagCount === 0 ? (
        <div className="mt-2 flex items-center justify-between pl-5 text-[10px] font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <List className="h-3 w-3" />
            No details
          </span>
        </div>
      ) : null}
    </article>
  );
}

export function TaskBoardView({ tasks, stages, onCardMove, onTaskCreate, className }: TaskBoardViewProps) {
  const [dragging, setDragging] = useState<DragState>(null);

  const columns = useMemo(
    () =>
      [...stages]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((stage) => {
          const status = stage.key as TaskStatus;
          return {
            ...stage,
            status,
            tasks: sortPipelineTasks(tasks.filter((task) => !task._deleted && normalizeTaskStatus(task.status) === status)),
          };
        }),
    [stages, tasks],
  );

  const assigneeOptions = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.assigneeUserId).filter(Boolean) as string[])),
    [tasks],
  );

  function dropOnColumn(status: TaskStatus, targetIndex: number) {
    if (!dragging) return;
    onCardMove(dragging.id, dragging.fromStatus, status, targetIndex);
    setDragging(null);
  }

  return (
    <div className={cn("h-full min-h-[520px] overflow-auto bg-background px-4 py-4", className)}>
      <div className="flex min-w-max items-start gap-3">
        {columns.map((column) => (
          <section
            key={column.key}
            className={cn("w-[228px] shrink-0 rounded-lg border border-transparent p-2.5", COLUMN_TINT[column.status])}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropOnColumn(column.status, column.tasks.length)}
          >
            <header className="mb-2.5 flex h-7 items-center gap-2">
              <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-[10px] font-black uppercase leading-4", COLUMN_BADGE[column.status])}>
                {column.name}
              </span>
              <span className="text-[11px] font-bold text-muted-foreground">{column.tasks.length}</span>
            </header>
            <div className="space-y-2.5">
              {column.tasks.map((task, index) => (
                <BoardTaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onDragStart={() => setDragging({ id: task.id, fromStatus: task.status })}
                  onDrop={(targetIndex) => dropOnColumn(column.status, targetIndex)}
                />
              ))}
              <BoardAddTask status={column.status} assigneeOptions={assigneeOptions} onTaskCreate={onTaskCreate} />
            </div>
          </section>
        ))}
        <button
          type="button"
          className="ml-1 mt-1 inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Add group
        </button>
      </div>
    </div>
  );
}
