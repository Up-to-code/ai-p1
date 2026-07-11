"use client";

import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent, type WheelEvent } from "react";
import { Calendar, Check, CheckCircle2, Circle, Flag, List, MoreHorizontal, Plus, Save, Search, Settings2, Tag, Trash2, UserPlus, UserRound, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskRecord, TaskStatus } from "../../tasks.types";
import { sortPipelineTasks } from "../../task-pipeline-order";
import { normalizeTaskStatus } from "../../tasks.constants";
import { useIndexedDbConfig } from "@/domains/storage/use-indexeddb-config";

interface TaskBoardViewProps {
  tasks: TaskRecord[];
  stages: Array<{ key: string; name: string; color?: string; order?: number }>;
  organizationId?: string;
  onCardMove: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
  onTaskCreate?: (title: string, defaults?: BoardCreateDefaults) => void | Promise<void>;
  onTaskUpdate?: (task: TaskRecord, changes: Partial<TaskRecord>) => void | Promise<void>;
  onTaskDelete?: (task: TaskRecord) => void | Promise<void>;
  onTaskOpen?: (taskId: string) => void;
  currentUserId?: string;
  className?: string;
}

type DragState = { id: string; fromStatus: TaskStatus } | null;
type BoardCreateDefaults = Pick<Partial<TaskRecord>, "status" | "priority" | "assigneeUserId" | "dueDate" | "tags">;

const COLUMN_TINT: Record<TaskStatus, string> = {
  todo: "bg-card border-t-zinc-400",
  inProgress: "bg-card border-t-blue-500",
  waiting: "bg-card border-t-violet-500",
  done: "bg-card border-t-emerald-500",
  canceled: "bg-card border-t-muted-foreground/50",
};

const COLUMN_BADGE: Record<TaskStatus, string> = {
  todo: "bg-muted text-foreground",
  inProgress: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  waiting: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  done: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  canceled: "bg-muted text-muted-foreground",
};

const PRIORITY_FLAG: Record<TaskRecord["priority"], string> = {
  urgent: "text-red-400",
  high: "text-amber-300",
  normal: "text-blue-400",
  low: "text-zinc-400",
};

function plainText(value: string | undefined) {
  return value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

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
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onClick={() => setIsOpen(true)}
        className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Task
      </Button>
    );
  }

  return (
    <Card data-board-no-pan className="rounded-md border-border bg-card p-2">
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
    </Card>
  );
}

function BoardTaskCard({
  task,
  index,
  onDragStart,
  onDrop,
  assigneeOptions,
  currentUserId,
  onTaskUpdate,
  onTaskDelete,
  onTaskOpen,
}: {
  task: TaskRecord;
  index: number;
  onDragStart: () => void;
  onDrop: (targetIndex: number) => void;
  assigneeOptions: string[];
  currentUserId?: string;
  onTaskUpdate?: (task: TaskRecord, changes: Partial<TaskRecord>) => void | Promise<void>;
  onTaskDelete?: (task: TaskRecord) => void | Promise<void>;
  onTaskOpen?: (taskId: string) => void;
}) {
  const tagCount = task.tags?.length ?? 0;
  const assigneeLabel = task.assigneeUserId?.trim();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const statusOptions: Array<{ key: TaskStatus; label: string }> = [
    { key: "todo", label: "To do" },
    { key: "inProgress", label: "In progress" },
    { key: "waiting", label: "Waiting" },
    { key: "done", label: "Done" },
    { key: "canceled", label: "Canceled" },
  ];

  return (
    <Card
      data-board-no-pan
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.stopPropagation();
        onDrop(index);
      }}
      onClick={() => onTaskOpen?.(task.id)}
      className="group cursor-pointer rounded-xl border-border/70 bg-card p-3 text-card-foreground transition-colors hover:border-foreground/20 hover:bg-muted/20"
    >
      <div className="flex items-start gap-2">
        {task.status === "done" ? (
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
        ) : (
          <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        )}
        <h4 className="line-clamp-2 min-w-0 flex-1 text-[12px] font-bold leading-5 text-foreground">{task.title}</h4>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Actions for ${task.title}`}
                onPointerDown={(event: PointerEvent<HTMLButtonElement>) => event.stopPropagation()}
                onClick={(event: MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
                className="-mr-1 -mt-1 text-muted-foreground hover:text-foreground"
              />
            }
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">Task actions</div>
            {currentUserId && task.assigneeUserId !== currentUserId ? (
              <DropdownMenuItem onClick={() => void onTaskUpdate?.(task, { assigneeUserId: currentUserId })}>
                <UserPlus className="h-3.5 w-3.5" />
                Claim task
              </DropdownMenuItem>
            ) : null}
            <div className="px-1.5 pb-1 pt-2 text-xs font-medium text-muted-foreground">Assign to</div>
            {assigneeOptions.slice(0, 6).map((assignee) => (
              <DropdownMenuItem key={assignee} onClick={() => void onTaskUpdate?.(task, { assigneeUserId: assignee })}>
                <UserRound className="h-3.5 w-3.5" />
                <span className="truncate">{assignee}</span>
                {task.assigneeUserId === assignee ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={() => void onTaskUpdate?.(task, { assigneeUserId: "" })}>
              <UserRound className="h-3.5 w-3.5" />
              Unassign
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">Status</div>
            {statusOptions.map((statusOption) => (
              <DropdownMenuItem
                key={statusOption.key}
                onClick={() => void onTaskUpdate?.(task, { status: statusOption.key })}
              >
                <span className={cn("h-2 w-2 rounded-full", statusOption.key === "done" ? "bg-emerald-500" : statusOption.key === "inProgress" ? "bg-blue-500" : statusOption.key === "waiting" ? "bg-violet-500" : "bg-muted-foreground/50")} />
                {statusOption.label}
                {normalizeTaskStatus(task.status) === statusOption.key ? <Check className="ml-auto h-3.5 w-3.5" /> : null}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" />
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {plainText(task.description) ? (
        <p className="mt-1 line-clamp-2 pl-5 text-[11px] leading-4 text-muted-foreground">
          {plainText(task.description)}
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

        <Badge variant="outline" className={cn("ml-auto h-5 rounded border-border/70 px-1.5 text-[10px] capitalize tracking-normal", PRIORITY_FLAG[task.priority])}>
          <Flag className="h-3 w-3" />
          {task.priority}
        </Badge>
      </div>

      {!plainText(task.description) && !assigneeLabel && !task.dueDate && tagCount === 0 ? (
        <div className="mt-2 flex items-center justify-between pl-5 text-[10px] font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <List className="h-3 w-3" />
            No details
          </span>
        </div>
      ) : null}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              “{task.title}” will be removed from this workspace. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => void onTaskDelete?.(task)}
            >
              Delete task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

export function TaskBoardView({ tasks, stages, organizationId, onCardMove, onTaskCreate, onTaskUpdate, onTaskDelete, onTaskOpen, currentUserId, className }: TaskBoardViewProps) {
  const [dragging, setDragging] = useState<DragState>(null);
  const [addingStage, setAddingStage] = useState(false);
  const [stageName, setStageName] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);
  const canvasPanRef = useRef<{
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const defaultStages = useMemo(() => stages, [stages]);
  const stageConfig = useIndexedDbConfig(
    "layouts",
    `task-board-stages:${organizationId ?? "anonymous"}`,
    defaultStages,
  );
  const configuredStages = stageConfig.value;

  useEffect(() => {
    function panBoard(event: globalThis.MouseEvent) {
      const pan = canvasPanRef.current;
      const board = boardRef.current;
      if (!pan || !board) return;
      board.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
      board.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
    }

    function stopPanning() {
      canvasPanRef.current = null;
    }

    window.addEventListener("mousemove", panBoard);
    window.addEventListener("mouseup", stopPanning);
    return () => {
      window.removeEventListener("mousemove", panBoard);
      window.removeEventListener("mouseup", stopPanning);
    };
  }, []);

  const columns = useMemo(
    () =>
      [...configuredStages]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((stage) => {
          const status = stage.key as TaskStatus;
          return {
            ...stage,
            status,
            tasks: sortPipelineTasks(tasks.filter((task) => !task._deleted && task.status === status)),
          };
        }),
    [configuredStages, tasks],
  );

  async function addStage() {
    const name = stageName.trim();
    if (!name) return;
    const baseKey = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "stage";
    let key = baseKey;
    let suffix = 2;
    while (configuredStages.some((stage) => stage.key === key)) key = `${baseKey}-${suffix++}`;
    await stageConfig.setValue([
      ...configuredStages,
      { key, name, color: "#64748b", order: configuredStages.length },
    ]);
    setStageName("");
    setAddingStage(false);
  }

  const assigneeOptions = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.assigneeUserId).filter(Boolean) as string[])),
    [tasks],
  );

  function dropOnColumn(status: TaskStatus, targetIndex: number) {
    if (!dragging) return;
    onCardMove(dragging.id, dragging.fromStatus, status, targetIndex);
    setDragging(null);
  }

  function beginCanvasPan(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (
      event.button !== 0 ||
      target.closest("[data-board-no-pan], button, input, textarea, select, a, [contenteditable='true']")
    ) return;
    const board = boardRef.current;
    if (!board) return;
    event.preventDefault();
    canvasPanRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: board.scrollLeft,
      scrollTop: board.scrollTop,
    };
  }

  function scrollCanvas(event: WheelEvent<HTMLDivElement>) {
    const board = boardRef.current;
    if (!board) return;
    event.preventDefault();
    if (event.shiftKey && Math.abs(event.deltaX) < Math.abs(event.deltaY)) {
      board.scrollLeft += event.deltaY;
      return;
    }
    board.scrollLeft += event.deltaX;
    board.scrollTop += event.deltaY;
  }

  return (
    <div
      ref={boardRef}
      data-task-board-scroll
      onWheel={scrollCanvas}
      onMouseDown={beginCanvasPan}
      className={cn("h-full min-h-0 w-full min-w-0 max-w-full touch-none cursor-grab overflow-scroll overscroll-contain bg-muted/20 px-5 py-5 active:cursor-grabbing", className)}
    >
      <div
        className="flex min-w-max items-start gap-4"
      >
        {columns.map((column) => (
          <section
            key={column.key}
            className="w-[286px] shrink-0 rounded-2xl border border-border/60 bg-background/70 p-2.5 backdrop-blur"
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => dropOnColumn(column.status, column.tasks.length)}
          >
            <header className="mb-2 flex h-9 items-center gap-2 px-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: column.color ?? "#64748b" }} />
              <span className="text-xs font-semibold text-foreground">
                {column.name}
              </span>
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">{column.tasks.length}</span>
              <Settings2 className="ml-auto h-3.5 w-3.5 text-muted-foreground/60" />
            </header>
            <div className="space-y-2.5">
              {column.tasks.map((task, index) => (
                <BoardTaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  onDragStart={() => setDragging({ id: task.id, fromStatus: task.status })}
                  onDrop={(targetIndex) => dropOnColumn(column.status, targetIndex)}
                  assigneeOptions={assigneeOptions}
                  currentUserId={currentUserId}
                  onTaskUpdate={onTaskUpdate}
                  onTaskDelete={onTaskDelete}
                  onTaskOpen={onTaskOpen}
                />
              ))}
              <BoardAddTask status={column.status} assigneeOptions={assigneeOptions} onTaskCreate={onTaskCreate} />
            </div>
          </section>
        ))}
        <div className="w-[286px] shrink-0">
          {addingStage ? (
            <div className="rounded-2xl border border-border bg-background p-3">
              <label className="text-xs font-semibold text-foreground">New workflow stage</label>
              <input autoFocus value={stageName} onChange={(event) => setStageName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void addStage(); if (event.key === "Escape") setAddingStage(false); }} placeholder="e.g. In review" className="mt-2 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
              <div className="mt-2 flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setAddingStage(false)}>Cancel</Button>
                <Button size="sm" disabled={!stageName.trim()} onClick={() => void addStage()}>Add stage</Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => setAddingStage(true)} className="h-11 w-full justify-start rounded-xl border-dashed bg-background/50 text-muted-foreground hover:bg-background hover:text-foreground">
              <Plus className="h-4 w-4" /> Add stage
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
