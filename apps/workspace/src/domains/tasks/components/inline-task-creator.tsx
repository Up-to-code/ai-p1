"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Flag,
  Maximize2,
  Paperclip,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TaskFormValues, TaskPriority, TaskStatus } from "../tasks.types";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { cn } from "@/lib/utils";

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "Todo", color: "text-zinc-400" },
  inProgress: { label: "In progress", color: "text-amber-500" },
  waiting: { label: "Waiting", color: "text-blue-500" },
  done: { label: "Done", color: "text-emerald-500" },
  canceled: { label: "Canceled", color: "text-zinc-500" },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "text-zinc-400" },
  normal: { label: "Normal", color: "text-zinc-500" },
  high: { label: "High", color: "text-amber-500" },
  urgent: { label: "Urgent", color: "text-red-500" },
};

const statuses: TaskStatus[] = ["todo", "inProgress", "waiting", "done", "canceled"];
const priorities: TaskPriority[] = ["low", "normal", "high", "urgent"];

function getDueDatePresets() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const endOfWeek = new Date(now);
  endOfWeek.setDate(endOfWeek.getDate() + (5 - endOfWeek.getDay()));
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const fmt = (d: Date) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return [
    { label: "Tomorrow", value: tomorrow.toISOString().slice(0, 10), subtitle: fmt(tomorrow) },
    { label: "End of this week", value: endOfWeek.toISOString().slice(0, 10), subtitle: fmt(endOfWeek) },
    { label: "In one week", value: nextWeek.toISOString().slice(0, 10), subtitle: fmt(nextWeek) },
  ];
}

interface InlineTaskCreatorProps {
  onSubmit: (values: TaskFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  assigneeOptions: WorkOsPickerOption[];
  defaultProjectId?: string;
}

export function InlineTaskCreator({
  onSubmit,
  onCancel,
  isSubmitting,
  assigneeOptions,
  defaultProjectId,
}: InlineTaskCreatorProps) {
  const t = useTranslations("Tasks");
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(() => {
    if (!title.trim() || isSubmitting) return;
    onSubmit({
      title: title.trim(),
      status,
      priority,
      visibility: "team",
      assigneeUserId,
      clientId: "",
      projectId: defaultProjectId ?? "",
      dueDate,
      description,
      tags,
    });
  }, [title, status, priority, assigneeUserId, dueDate, description, tags, defaultProjectId, isSubmitting, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === "Escape") {
        onCancel();
      }
    },
    [handleSubmit, onCancel],
  );

  const dueDatePresets = getDueDatePresets();
  const selectedAssignee = assigneeOptions.find((a) => a.id === assigneeUserId);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-divider)] bg-background transition-all",
        isExpanded && "min-h-[300px]",
      )}
      onKeyDown={handleKeyDown}
    >
      {/* Header: expand + close */}
      <div className="flex items-center justify-end gap-0.5 px-3 pt-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-[var(--color-divider)] hover:text-text-primary transition-colors"
          aria-label="Expand"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-[var(--color-divider)] hover:text-text-primary transition-colors"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Title */}
      <div className="px-4 pt-1">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="w-full bg-transparent text-lg font-semibold text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description..."
          rows={isExpanded ? 6 : 1}
          className="w-full resize-none bg-transparent text-sm text-text-secondary outline-none placeholder:text-text-muted"
        />
      </div>

      {/* Divider */}
      <div className="mx-3 h-px bg-[var(--color-divider)]" />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-2">
        {/* Status chip */}
        <Popover>
          <PopoverTrigger className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[var(--color-divider)] bg-background px-2 text-xs font-medium text-text-secondary hover:bg-[var(--color-divider)] transition-colors">
            <Circle className={cn("h-3 w-3 fill-current", statusConfig[status].color)} />
            <span>{statusConfig[status].label}</span>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={4} className="w-48 p-1">
            {statuses.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-primary hover:bg-[var(--color-divider)] transition-colors"
              >
                <Circle className={cn("h-3 w-3 fill-current", statusConfig[s].color)} />
                <span className="flex-1 text-left">{statusConfig[s].label}</span>
                {status === s && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Priority chip */}
        <Popover>
          <PopoverTrigger className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[var(--color-divider)] bg-background px-2 text-xs font-medium text-text-secondary hover:bg-[var(--color-divider)] transition-colors">
            <Flag className={cn("h-3 w-3", priorityConfig[priority].color)} />
            <span>{priorityConfig[priority].label}</span>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={4} className="w-48 p-1">
            {priorities.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-primary hover:bg-[var(--color-divider)] transition-colors"
              >
                <Flag className={cn("h-3 w-3", priorityConfig[p].color)} />
                <span className="flex-1 text-left">{priorityConfig[p].label}</span>
                {priority === p && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Assignee chip */}
        <Popover>
          <PopoverTrigger className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[var(--color-divider)] bg-background px-2 text-xs font-medium text-text-secondary hover:bg-[var(--color-divider)] transition-colors">
            <UserRound className="h-3 w-3" />
            <span>{selectedAssignee?.label ?? "Assignee"}</span>
          </PopoverTrigger>
          <PopoverContent align="start" sideOffset={4} className="w-64 p-1">
            <button
              type="button"
              onClick={() => setAssigneeUserId("")}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-muted hover:bg-[var(--color-divider)] transition-colors"
            >
              <span className="flex-1 text-left">Unassigned</span>
              {!assigneeUserId && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
            <div className="my-1 h-px bg-[var(--color-divider)]" />
            {assigneeOptions.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAssigneeUserId(a.id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-primary hover:bg-[var(--color-divider)] transition-colors"
              >
                <span className="flex-1 truncate text-left">{a.label}</span>
                {assigneeUserId === a.id && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            ))}
          </PopoverContent>
        </Popover>

        {/* Labels chip */}
        <button
          type="button"
          className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[var(--color-divider)] bg-background px-2 text-xs font-medium text-text-secondary hover:bg-[var(--color-divider)] transition-colors"
        >
          <Tag className="h-3 w-3" />
          <span>Labels</span>
        </button>

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-7 items-center justify-center rounded-lg border border-[var(--color-divider)] bg-background px-1.5 text-text-secondary hover:bg-[var(--color-divider)] transition-colors">
            <span className="text-xs">•••</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" sideOffset={4} className="min-w-52">
            {/* Due date submenu */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-primary hover:bg-[var(--color-divider)] transition-colors">
                <CalendarDays className="h-4 w-4 text-text-muted" />
                <span className="flex-1 text-left">Set due date</span>
                <ChevronRight className="h-3.5 w-3.5 text-text-muted" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" sideOffset={4} className="min-w-56">
                {dueDatePresets.map((preset) => (
                  <DropdownMenuItem key={preset.value} onClick={() => setDueDate(preset.value)}>
                    <CalendarDays className="h-4 w-4 text-text-muted" />
                    <span className="flex-1">{preset.label}</span>
                    <span className="text-xs text-text-muted">{preset.subtitle}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDueDate("")}>
                  <span className="flex-1">Clear due date</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <Tag className="h-4 w-4 text-text-muted" />
              <span>Add label...</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex-1" />

        {/* Attachment */}
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-[var(--color-divider)] hover:text-text-primary transition-colors"
          aria-label="Attach file"
        >
          <Paperclip className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Submit hint */}
      <div className="flex items-center justify-end border-t border-[var(--color-divider)] px-3 py-2">
        <span className="text-[10px] text-text-muted">
          <kbd className="rounded border border-[var(--color-divider)] bg-surface px-1 py-0.5 text-[9px] font-medium">
            {typeof navigator !== "undefined" && navigator.platform?.includes("Mac") ? "⌘" : "Ctrl"}
          </kbd>
          {" + "}
          <kbd className="rounded border border-[var(--color-divider)] bg-surface px-1 py-0.5 text-[9px] font-medium">
            ↵
          </kbd>
          {" to submit"}
        </span>
      </div>
    </div>
  );
}
