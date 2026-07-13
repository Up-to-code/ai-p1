"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { useTranslations } from "next-intl";
import {
  Archive,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Copy,
  Flag,
  GitMerge,
  GripVertical,
  Link2,
  List,
  Mail,
  MoreHorizontal,
  MoveRight,
  Pencil,
  Plus,
  Save,
  Search,
  Settings2,
  Shield,
  Star,
  Tag,
  Timer,
  Trash2,
  Unlink,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WorkspaceDatePicker } from "@/components/shared";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
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
import { getDueDateColor, normalizeTaskStatus } from "../../tasks.constants";
import { useIndexedDbConfig } from "@/domains/storage/use-indexeddb-config";
import { useSortableBoard } from "@qentrah/our-platform-components/pipeline";
import { AssigneePicker, PriorityPicker, StatusPicker } from "../task-pickers";
import type { TaskQuickCreateCommand } from "../../workspace/task-quick-create";

interface TaskBoardViewProps {
  tasks: TaskRecord[];
  stages: Array<{ key: string; name: string; color?: string; order?: number }>;
  organizationId?: string;
  onCardMove: (
    itemId: string,
    fromStage: string,
    toStage: string,
    targetIndex: number,
  ) => void;
  onTaskCreate?: TaskQuickCreateCommand;
  onTaskUpdate?: (
    task: TaskRecord,
    changes: Partial<TaskRecord>,
  ) => void | Promise<void>;
  onTaskDelete?: (task: TaskRecord) => void | Promise<void>;
  onTaskOpen?: (taskId: string) => void;
  currentUserId?: string;
  memberOptions?: WorkOsPickerOption[];
  className?: string;
}

const PRIORITY_FLAG: Record<TaskRecord["priority"], string> = {
  urgent: "text-red-400",
  high: "text-amber-300",
  normal: "text-blue-400",
  low: "text-zinc-400",
};

const GROUP_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#3b82f6",
  "#0ea5e9",
  "#14b8a6",
  "#22c55e",
  "#f59e0b",
  "#f97316",
  "#ef4444",
  "#ec4899",
  "#a855f7",
  "#78716c",
] as const;

function plainText(value: string | undefined) {
  return value
    ?.replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function colorForTag(tag: string) {
  const index = Array.from(tag).reduce(
    (value, character) => value + character.charCodeAt(0),
    0,
  );
  return GROUP_COLORS[index % GROUP_COLORS.length];
}

function compactTaskDate(value?: string) {
  if (!value) return "";
  const date = value.includes("T")
    ? new Date(value)
    : new Date(`${value}T12:00:00`);
  const dateLabel = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  if (!value.includes("T")) return dateLabel;
  return `${dateLabel} ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function taskDate(value?: string) {
  if (!value) return undefined;
  return value.includes("T") ? new Date(value) : new Date(`${value}T12:00:00`);
}

function taskDateRangeLabel(startDate?: string, dueDate?: string) {
  if (startDate && dueDate)
    return `${compactTaskDate(startDate)} → ${compactTaskDate(dueDate)}`;
  if (startDate) return `Starts ${compactTaskDate(startDate)}`;
  if (dueDate) return compactTaskDate(dueDate);
  return "Set dates";
}

function BoardAddTask({
  status,
  assigneeOptions,
  existingTags,
  openRequest,
  onTaskCreate,
}: {
  status: TaskStatus;
  assigneeOptions: WorkOsPickerOption[];
  existingTags: string[];
  openRequest?: number;
  onTaskCreate?: TaskQuickCreateCommand;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskRecord["priority"]>("normal");
  const [tags, setTags] = useState("");
  const [activeField, setActiveField] = useState<
    "assignee" | "priority" | "tags" | null
  >(null);
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const canSave = title.trim().length > 0 && !isSaving;
  const selectedAssignee = assigneeOptions.find(
    (option) => option.id === assigneeUserId,
  );
  const filteredAssignees = assigneeQuery
    ? assigneeOptions.filter((option) =>
        [option.label, option.helper].some((text) =>
          text?.toLowerCase().includes(assigneeQuery.toLowerCase()),
        ),
      )
    : assigneeOptions;

  useEffect(() => {
    if (openRequest) setIsOpen(true);
  }, [openRequest]);

  useEffect(() => {
    if (!activeField) return;
    const closeOnOutsideClick = (event: globalThis.MouseEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      )
        setActiveField(null);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [activeField]);

  async function save() {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onTaskCreate?.({
        title,
        status,
        priority,
        assigneeUserId: assigneeUserId.trim() || undefined,
        dueDate: dueDate || undefined,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
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
        className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Task
      </Button>
    );
  }

  return (
    <Card
      ref={rootRef}
      data-board-no-pan
      className="rounded-md border-border bg-card p-2"
    >
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
          onClick={() =>
            setActiveField(activeField === "assignee" ? null : "assignee")
          }
          className={cn(
            "flex h-6 w-full items-center gap-2 rounded px-1.5 text-left hover:bg-muted hover:text-foreground",
            assigneeUserId && "text-foreground",
          )}
        >
          <UserRound className="h-3 w-3" />
          {selectedAssignee?.label || "Add assignee"}
        </button>
        <WorkspaceDatePicker
          fields={["due"]}
          defaultField="due"
          dueDate={dueDate ? new Date(`${dueDate}T12:00:00`) : undefined}
          onDueDateChange={(date) =>
            setDueDate(date ? date.toISOString().slice(0, 10) : "")
          }
          className="h-6 w-full justify-start rounded bg-transparent px-1.5 text-[11px] hover:bg-muted"
        />
        <button
          type="button"
          onClick={() =>
            setActiveField(activeField === "priority" ? null : "priority")
          }
          className="flex h-6 w-full items-center gap-2 rounded px-1.5 text-left capitalize text-foreground hover:bg-muted"
        >
          <Flag className={cn("h-3 w-3", PRIORITY_FLAG[priority])} />
          {priority}
        </button>
        <button
          type="button"
          onClick={() => setActiveField(activeField === "tags" ? null : "tags")}
          className={cn(
            "flex h-6 w-full items-center gap-2 rounded px-1.5 text-left hover:bg-muted hover:text-foreground",
            tags && "text-foreground",
          )}
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
            {filteredAssignees.map((assignee) => (
              <button
                key={assignee.id}
                type="button"
                onClick={() => {
                  setAssigneeUserId(assignee.id);
                  setAssigneeQuery("");
                  setActiveField(null);
                }}
                className="flex h-8 w-full items-center justify-between rounded px-2 text-left text-[12px] font-semibold text-foreground hover:bg-muted"
              >
                <span className="truncate">{assignee.label}</span>
                {assigneeUserId === assignee.id ? (
                  <Check className="h-3.5 w-3.5" />
                ) : null}
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
                if (event.key === "Enter" || event.key === "Escape")
                  setActiveField(null);
              }}
              placeholder="tag, design, follow-up"
              className="h-8 w-full rounded border border-border bg-background px-2 text-[12px] font-semibold text-foreground outline-none placeholder:text-muted-foreground"
            />
            <p className="mt-1 text-[10px] text-muted-foreground">
              Separate tags with commas.
            </p>
            {existingTags.length ? (
              <div className="mt-2 flex flex-wrap gap-1 border-t border-border pt-2">
                {existingTags.slice(0, 12).map((tag, index) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      const values = new Set(
                        tags
                          .split(",")
                          .map((value) => value.trim())
                          .filter(Boolean),
                      );
                      values.add(tag);
                      setTags(Array.from(values).join(", "));
                    }}
                    className="rounded-full px-2 py-1 text-[10px] font-semibold text-white"
                    style={{
                      backgroundColor:
                        GROUP_COLORS[index % GROUP_COLORS.length],
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ) : null}
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
  memberOptions,
  currentUserId,
  onTaskUpdate,
  onTaskDelete,
  onTaskOpen,
}: {
  task: TaskRecord;
  memberOptions: WorkOsPickerOption[];
  currentUserId?: string;
  onTaskUpdate?: (
    task: TaskRecord,
    changes: Partial<TaskRecord>,
  ) => void | Promise<void>;
  onTaskDelete?: (task: TaskRecord) => void | Promise<void>;
  onTaskOpen?: (taskId: string) => void;
}) {
  const t = useTranslations("Tasks");
  const tagCount = task.tags?.length ?? 0;
  const assigneeLabel =
    memberOptions.find((option) => option.id === task.assigneeUserId)?.label ??
    task.assigneeUserId?.trim();
  const taskDescription = plainText(task.description);
  const [deleteOpen, setDeleteOpen] = useState(false);
  return (
    <Card
      data-board-no-pan
      data-card-id={task.id}
      className="group relative cursor-grab rounded-lg border border-border/70 bg-card p-2 text-card-foreground shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[border-color,box-shadow,background-color] active:cursor-grabbing hover:border-border hover:bg-background hover:shadow-[0_4px_14px_rgba(15,23,42,0.08)] dark:hover:bg-muted/20"
    >
      <div className="absolute right-1.5 top-1.5 z-10 flex h-6 items-center rounded-md border border-border/70 bg-background/95 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
        <button
          type="button"
          aria-label={
            normalizeTaskStatus(task.status) === "done"
              ? `Reopen ${task.title}`
              : `Complete ${task.title}`
          }
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            void onTaskUpdate?.(task, {
              status:
                normalizeTaskStatus(task.status) === "done" ? "todo" : "done",
            });
          }}
          className="flex size-6 items-center justify-center rounded-l-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Check className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Add detail to ${task.title}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="flex size-6 items-center justify-center border-l border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Copy link for ${task.title}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            void navigator.clipboard?.writeText(task.id);
          }}
          className="flex size-6 items-center justify-center border-l border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Link2 className="size-3.5" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Actions for ${task.title}`}
                onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
                  event.stopPropagation()
                }
                onClick={(event: MouseEvent<HTMLButtonElement>) =>
                  event.stopPropagation()
                }
                className="flex size-6 items-center justify-center rounded-r-md border-l border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"
              />
            }
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            sideOffset={6}
            className="w-56 rounded-lg p-1.5 text-[12px] shadow-xl"
          >
            <div className="grid grid-cols-3 gap-1 border-b border-border/70 pb-1">
              {[
                ["Copy link", Link2],
                ["Copy ID", Copy],
                ["New tab", MoveRight],
              ].map(([label]) => (
                <button
                  key={label as string}
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (label === "Copy ID")
                      void navigator.clipboard?.writeText(task.id);
                  }}
                  className="h-7 rounded-md border border-border/70 px-1 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {label as string}
                </button>
              ))}
            </div>
            {currentUserId && task.assigneeUserId !== currentUserId ? (
              <DropdownMenuItem
                onClick={() =>
                  void onTaskUpdate?.(task, { assigneeUserId: currentUserId })
                }
                className="h-8 gap-2 text-[12px]"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Claim task
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <Star className="h-3.5 w-3.5" />
              Favorite
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onTaskOpen?.(task.id)}
              className="h-8 gap-2 text-[12px]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <Unlink className="h-3.5 w-3.5" />
              Unfollow task
            </DropdownMenuItem>
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <Bell className="h-3.5 w-3.5" />
              Remind me in Inbox
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <MoveRight className="h-3.5 w-3.5" />
              Move to
            </DropdownMenuItem>
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <List className="h-3.5 w-3.5" />
              Add to
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuItem>
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <GitMerge className="h-3.5 w-3.5" />
              Merge
            </DropdownMenuItem>
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <Copy className="h-3.5 w-3.5" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <Settings2 className="h-3.5 w-3.5" />
              Convert to
              <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <Timer className="h-3.5 w-3.5" />
              Start timer
            </DropdownMenuItem>
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <Mail className="h-3.5 w-3.5" />
              Send email to task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="h-8 gap-2 text-[12px]">
              <Archive className="h-3.5 w-3.5" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="h-8 gap-2 text-[12px]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <button
              type="button"
              className="mt-1 flex h-8 w-full items-center justify-center rounded-md bg-foreground text-[11px] font-bold text-background"
            >
              <Shield className="mr-1.5 h-3.5 w-3.5" />
              Sharing & Permissions
            </button>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex min-w-0 items-start gap-1.5 pr-16">
        <span
          role="button"
          tabIndex={0}
          data-card-drag-handle
          aria-label={`Drag ${task.title}`}
          className="flex size-5 shrink-0 cursor-grab items-center justify-center rounded text-muted-foreground/50 hover:bg-muted hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" />
        </span>
        <div
          data-board-no-pan
          data-board-property
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <StatusPicker
            value={normalizeTaskStatus(task.status)}
            onChange={(status) => void onTaskUpdate?.(task, { status })}
            t={t}
            showLabel={false}
            triggerClassName="size-5 border-0 bg-transparent p-0 hover:bg-muted"
          />
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => onTaskOpen?.(task.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ")
              onTaskOpen?.(task.id);
          }}
          className="line-clamp-2 min-w-0 flex-1 cursor-grab text-left text-[12px] font-semibold leading-4 text-foreground hover:underline active:cursor-grabbing"
        >
          {task.title}
        </div>
      </div>

      {taskDescription ? (
        <div
          role="button"
          tabIndex={0}
          onClick={() => onTaskOpen?.(task.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ")
              onTaskOpen?.(task.id);
          }}
          className="mt-1 line-clamp-2 w-full cursor-grab pl-5 text-left text-[11px] leading-4 text-muted-foreground hover:text-foreground active:cursor-grabbing"
        >
          {taskDescription}
        </div>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-1 pl-5 text-[10px] font-medium text-muted-foreground">
        <div
          data-board-no-pan
          data-board-property
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <AssigneePicker
            values={
              task.assigneeUserIds ??
              (task.assigneeUserId ? [task.assigneeUserId] : [])
            }
            options={memberOptions}
            onChange={(assigneeUserIds) =>
              void onTaskUpdate?.(task, {
                assigneeUserIds,
                assigneeUserId: assigneeUserIds[0] ?? "",
              })
            }
            t={t}
            showLabel={false}
            triggerClassName="h-5 border-border/70 bg-background px-1"
          />
        </div>

        <div
          data-board-no-pan
          data-board-property
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <WorkspaceDatePicker
            fields={["start", "due"]}
            defaultField="due"
            startDate={taskDate(task.startDate)}
            dueDate={taskDate(task.dueDate)}
            onStartDateChange={(date) =>
              void onTaskUpdate?.(task, {
                startDate: date ? date.toISOString() : "",
              })
            }
            onDueDateChange={(date) =>
              void onTaskUpdate?.(task, {
                dueDate: date ? date.toISOString() : "",
              })
            }
            triggerLabel={taskDateRangeLabel(task.startDate, task.dueDate)}
            includeTime
            className={cn(
              "h-5 rounded border border-border/70 bg-background px-1.5 text-[10px]",
              ["done", "canceled"].includes(normalizeTaskStatus(task.status))
                ? "text-muted-foreground"
                : getDueDateColor(task.dueDate),
            )}
          />
        </div>

        <div
          data-board-no-pan
          data-board-property
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          <PriorityPicker
            value={task.priority}
            onChange={(priority) => void onTaskUpdate?.(task, { priority })}
            t={t}
            showLabel={false}
            triggerClassName="h-5 border-border/70 bg-background px-1.5"
          />
        </div>

        {task.tags?.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="inline-flex h-5 max-w-24 items-center gap-1 rounded-full px-1.5 text-[9px] font-semibold text-white"
            style={{ backgroundColor: colorForTag(tag) }}
          >
            <span className="truncate">{tag}</span>
          </span>
        ))}
        {tagCount > 2 ? (
          <span className="text-[9px] font-semibold">+{tagCount - 2}</span>
        ) : null}
      </div>

      {!taskDescription && !assigneeLabel && !task.dueDate && tagCount === 0 ? (
        <div className="mt-2 flex items-center justify-between pl-5 text-[10px] font-medium text-muted-foreground">
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
              “{task.title}” will be removed from this workspace. This action
              cannot be undone.
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

export function TaskBoardView({
  tasks,
  stages,
  organizationId,
  onCardMove,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
  onTaskOpen,
  currentUserId,
  memberOptions = [],
  className,
}: TaskBoardViewProps) {
  const [addingStage, setAddingStage] = useState(false);
  const [stageName, setStageName] = useState("");
  const [stageColor, setStageColor] = useState<string>(GROUP_COLORS[0]);
  const [collapsedStages, setCollapsedStages] = useState<Set<string>>(
    () => new Set(),
  );
  const [addTaskRequests, setAddTaskRequests] = useState<
    Record<string, number>
  >({});
  const addStageRef = useRef<HTMLDivElement>(null);
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
    if (!addingStage) return;
    const closeOnOutsideClick = (event: globalThis.MouseEvent) => {
      if (
        event.target instanceof Node &&
        !addStageRef.current?.contains(event.target)
      ) {
        setAddingStage(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [addingStage]);

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
            tasks: sortPipelineTasks(
              tasks.filter((task) => !task._deleted && task.status === status),
            ),
          };
        }),
    [configuredStages, tasks],
  );
  const { getColumnRef } = useSortableBoard({
    stages: columns,
    draggable: true,
    itemSelector: "[data-card-id]",
    onCardMove,
  });

  async function addStage() {
    const name = stageName.trim();
    if (!name) return;
    const baseKey =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "stage";
    let key = baseKey;
    let suffix = 2;
    while (configuredStages.some((stage) => stage.key === key))
      key = `${baseKey}-${suffix++}`;
    await stageConfig.setValue([
      ...configuredStages,
      { key, name, color: stageColor, order: configuredStages.length },
    ]);
    setStageName("");
    setStageColor(GROUP_COLORS[0]);
    setAddingStage(false);
  }

  const existingTags = useMemo(
    () => Array.from(new Set(tasks.flatMap((task) => task.tags ?? []))).sort(),
    [tasks],
  );

  async function updateStage(
    stageKey: string,
    changes: { name?: string; color?: string },
  ) {
    await stageConfig.setValue(
      configuredStages.map((stage) =>
        stage.key === stageKey ? { ...stage, ...changes } : stage,
      ),
    );
  }

  function beginCanvasPan(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (
      event.button !== 0 ||
      target.closest(
        "[data-board-no-pan], button, input, textarea, select, a, [contenteditable='true']",
      )
    )
      return;
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
      className={cn(
        "h-full min-h-0 w-full min-w-0 max-w-full touch-none cursor-grab overflow-scroll overscroll-contain bg-background px-3 py-2 active:cursor-grabbing",
        className,
      )}
    >
      <div
        data-board-no-pan
        className="sticky left-0 z-20 mb-2 flex h-8 w-max items-center gap-2"
      >
        <div className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-[11px] font-medium text-muted-foreground shadow-sm">
          <Settings2 className="size-3.5" />
          Group: <span className="text-foreground">Status</span>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {tasks.length} task{tasks.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="flex min-w-max items-start gap-2">
        {columns.map((column) => (
          <section
            key={column.key}
            className={cn(
              "shrink-0 rounded-lg border border-border/45 p-1.5 transition-[width]",
              collapsedStages.has(column.key) ? "min-h-44 w-10" : "w-[230px]",
            )}
            style={{
              backgroundColor: `color-mix(in srgb, ${column.color ?? "#64748b"} 6%, var(--background))`,
            }}
          >
            <header
              className={cn(
                "mb-1 flex items-center gap-1.5 px-1.5",
                collapsedStages.has(column.key)
                  ? "h-auto flex-col py-1"
                  : "h-7",
              )}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: column.color ?? "#64748b" }}
              />
              <span
                className={cn(
                  "min-w-0 truncate text-[11px] font-bold uppercase text-foreground",
                  collapsedStages.has(column.key) && "max-h-28 py-1",
                )}
                style={
                  collapsedStages.has(column.key)
                    ? { writingMode: "vertical-rl" }
                    : undefined
                }
              >
                {column.name}
              </span>
              <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {column.tasks.length}
              </span>
              {!collapsedStages.has(column.key) ? (
                <div
                  data-board-no-pan
                  className="ml-auto flex items-center gap-0.5"
                >
                  <button
                    type="button"
                    aria-label={`Add task to ${column.name}`}
                    onClick={() =>
                      setAddTaskRequests((current) => ({
                        ...current,
                        [column.key]: (current[column.key] ?? 0) + 1,
                      }))
                    }
                    className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-background/80 hover:text-foreground"
                  >
                    <Plus className="size-3.5" />
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <button
                          type="button"
                          aria-label={`Quick actions for ${column.name}`}
                          className="flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-background/80 hover:text-foreground"
                        />
                      }
                    >
                      <MoreHorizontal className="size-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-52 rounded-lg p-1.5"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          setCollapsedStages((current) => {
                            const next = new Set(current);
                            if (next.has(column.key)) next.delete(column.key);
                            else next.add(column.key);
                            return next;
                          })
                        }
                        className="h-8 text-xs"
                      >
                        {collapsedStages.has(column.key)
                          ? "Expand group"
                          : "Collapse group"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          const nextName = window
                            .prompt("Group name", column.name)
                            ?.trim();
                          if (nextName)
                            void updateStage(column.key, { name: nextName });
                        }}
                        className="h-8 text-xs"
                      >
                        Rename group
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <div className="px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                        Color
                      </div>
                      <div className="flex flex-wrap gap-1 px-2 pb-2">
                        {GROUP_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            aria-label={`Use ${color}`}
                            onClick={() =>
                              void updateStage(column.key, { color })
                            }
                            className="size-5 rounded-full border border-foreground/15 ring-offset-1 hover:ring-2 hover:ring-ring"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <label className="flex size-5 cursor-pointer items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground">
                          +
                          <input
                            type="color"
                            value={column.color ?? GROUP_COLORS[0]}
                            onChange={(event) =>
                              void updateStage(column.key, {
                                color: event.target.value,
                              })
                            }
                            className="sr-only"
                          />
                        </label>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <button
                  type="button"
                  data-board-no-pan
                  aria-label={`Expand ${column.name}`}
                  onClick={() =>
                    setCollapsedStages((current) => {
                      const next = new Set(current);
                      next.delete(column.key);
                      return next;
                    })
                  }
                  className="mt-1 flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              )}
            </header>
            {!collapsedStages.has(column.key) ? (
              <div
                ref={getColumnRef(column.key)}
                data-stage-key={column.key}
                className="space-y-1.5"
              >
                {column.tasks.map((task) => (
                  <BoardTaskCard
                    key={task.id}
                    task={task}
                    memberOptions={memberOptions}
                    currentUserId={currentUserId}
                    onTaskUpdate={onTaskUpdate}
                    onTaskDelete={onTaskDelete}
                    onTaskOpen={onTaskOpen}
                  />
                ))}
                <BoardAddTask
                  status={column.status}
                  assigneeOptions={memberOptions}
                  existingTags={existingTags}
                  openRequest={addTaskRequests[column.key]}
                  onTaskCreate={onTaskCreate}
                />
              </div>
            ) : null}
          </section>
        ))}
        <div className="w-[180px] shrink-0">
          {addingStage ? (
            <div
              ref={addStageRef}
              data-board-no-pan
              className="rounded-lg border border-border bg-background p-3 shadow-lg"
            >
              <label className="text-xs font-semibold text-foreground">
                Add group
              </label>
              <input
                autoFocus
                value={stageName}
                onChange={(event) => setStageName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void addStage();
                  if (event.key === "Escape") setAddingStage(false);
                }}
                placeholder="Group name"
                className="mt-2 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="mt-2">
                <div className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">
                  Color
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {GROUP_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={`Use ${color}`}
                      onClick={() => setStageColor(color)}
                      className={cn(
                        "size-5 rounded-full border border-foreground/15 ring-offset-1",
                        stageColor === color && "ring-2 ring-foreground",
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <label className="flex size-5 cursor-pointer items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground">
                    +
                    <input
                      type="color"
                      value={stageColor}
                      onChange={(event) => setStageColor(event.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>
              <div className="mt-2 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAddingStage(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!stageName.trim()}
                  onClick={() => void addStage()}
                >
                  Add stage
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAddingStage(true)}
              className="h-9 w-full justify-start rounded-lg border border-dashed border-border/70 bg-muted/20 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            >
              <Plus className="h-4 w-4" /> Add group
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
