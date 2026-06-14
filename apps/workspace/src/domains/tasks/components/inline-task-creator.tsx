"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Expand,
  Flag,
  Paperclip,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
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
import {
  SlashCommandMenu,
  getSlashCommandItems,
  type SlashMenuItem,
} from "./slash-command-menu";

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  todo: { label: "Todo", color: "text-[#A3A3A3]" },
  inProgress: { label: "In progress", color: "text-[#F59E0B]" },
  waiting: { label: "Waiting", color: "text-[#3B82F6]" },
  done: { label: "Done", color: "text-[#10B981]" },
  canceled: { label: "Canceled", color: "text-[#6B6B6B]" },
};

const priorityConfig: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "text-[#6B6B6B]" },
  normal: { label: "Normal", color: "text-[#A3A3A3]" },
  high: { label: "High", color: "text-[#F59E0B]" },
  urgent: { label: "Urgent", color: "text-[#EF4444]" },
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

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  return [
    { label: "Tomorrow", value: tomorrow.toISOString().slice(0, 10), subtitle: fmt(tomorrow) },
    {
      label: "End of this week",
      value: endOfWeek.toISOString().slice(0, 10),
      subtitle: fmt(endOfWeek),
    },
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
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [assigneeUserId, setAssigneeUserId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashItems, setSlashItems] = useState<SlashMenuItem[]>([]);
  const [createMore, setCreateMore] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Add description...",
        emptyEditorClass:
          "is-editor-empty before:absolute before:text-[#525252] before:content-[attr(data-placeholder)] before:pointer-events-none",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-none min-h-[32px] py-1 px-0 focus:outline-none text-[15px] leading-relaxed text-[#E5E5E5] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[32px] [&_.ProseMirror_p]:my-0.5 [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h2]:text-lg [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_pre]:bg-[#141414] [&_.ProseMirror_pre]:border [&_.ProseMirror_pre]:border-white/10 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:my-2 [&_.ProseMirror_code]:text-[#E879F9] [&_.ProseMirror_code]:bg-white/5 [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-[13px] [&_.ProseMirror_pre_code]:bg-transparent [&_.ProseMirror_pre_code]:p-0 [&_.ProseMirror_pre_code]:text-inherit [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-[#3D3D3D] [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:my-2 [&_.ProseMirror_blockquote]:text-[#A3A3A3] [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-4 [&_.ProseMirror_ul]:my-1 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-4 [&_.ProseMirror_ol]:my-1 [&_.ProseMirror_li]:my-0.5 [&_.ProseMirror_hr]:border-0 [&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:border-white/10 [&_.ProseMirror_hr]:my-3",
      },
    },
    onUpdate: ({ editor: e }) => {
      const { state } = e;
      const { from } = state.selection;
      const textBefore = state.doc.textBetween(Math.max(0, from - 20), from, "\n");

      if (textBefore.endsWith("/")) {
        setShowSlashMenu(true);
        setSlashItems(getSlashCommandItems(e, () => setShowSlashMenu(false)));
      } else if (showSlashMenu) {
        const slashMatch = textBefore.match(/\/([a-zA-Z]*)$/);
        if (slashMatch) {
          const filter = slashMatch[1].toLowerCase();
          const all = getSlashCommandItems(e, () => setShowSlashMenu(false));
          setSlashItems(
            all.filter(
              (item) =>
                item.label.toLowerCase().includes(filter) ||
                item.description.toLowerCase().includes(filter),
            ),
          );
        } else {
          setShowSlashMenu(false);
        }
      }
    },
  });

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSlashCommand = useCallback(
    (item: SlashMenuItem) => {
      if (!editor) return;
      const { state } = editor;
      const { from } = state.selection;
      const slashPos = from - 1;
      editor
        .chain()
        .focus()
        .deleteRange({ from: slashPos, to: from })
        .run();
      item.action();
    },
    [editor],
  );

  const handleSubmit = useCallback(() => {
    if (!title.trim() || isSubmitting) return;
    const description = editor?.getHTML() || "";
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
  }, [title, status, priority, assigneeUserId, dueDate, editor, tags, defaultProjectId, isSubmitting, onSubmit]);

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="relative w-full max-w-[600px] rounded-xl bg-[#1C1C1E] border border-[#2A2A2A] shadow-2xl">
        {/* Top bar: project badge + expand + close */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 items-center rounded bg-[#3B82F6]/20 px-1.5 text-[11px] font-semibold text-[#3B82F6]">
              QEN
            </span>
            <span className="text-[13px] text-[#525252]">›</span>
            <span className="text-[13px] text-[#A3A3A3]">New issue</span>
          </div>
          <div className="flex items-center gap-0.5">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#525252] hover:bg-white/5 hover:text-[#A3A3A3] transition-colors"
              aria-label="Expand"
            >
              <Expand className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[#525252] hover:bg-white/5 hover:text-[#A3A3A3] transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="px-4 pt-0 pb-1">
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Issue title"
            className="w-full bg-transparent text-[17px] font-medium text-white outline-none placeholder:text-[#525252]"
          />
        </div>

        {/* Description (Tiptap) */}
        <div className="relative px-4 pb-4 min-h-[40px]">
          {editor && showSlashMenu && (
            <div className="absolute left-4 top-0 z-50">
              <SlashCommandMenu
                items={slashItems}
                command={handleSlashCommand}
                onClose={() => setShowSlashMenu(false)}
              />
            </div>
          )}
          <EditorContent editor={editor} />
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-[#2A2A2A]" />

        {/* Bottom toolbar */}
        <div className="flex items-center gap-1.5 px-4 py-3">
          {/* Status chip */}
          <Popover>
            <PopoverTrigger className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#2A2A2A] bg-transparent px-2.5 text-[12px] font-medium text-[#A3A3A3] hover:bg-white/5 transition-colors">
              <Circle className={cn("h-3 w-3 fill-current", statusConfig[status].color)} />
              <span>{statusConfig[status].label}</span>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={4}
              className="w-48 p-1 bg-[#1C1C1E] border-[#2A2A2A]"
            >
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors"
                >
                  <Circle className={cn("h-3 w-3 fill-current", statusConfig[s].color)} />
                  <span className="flex-1 text-left">{statusConfig[s].label}</span>
                  {status === s && <Check className="h-3.5 w-3.5 text-[#3B82F6]" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Priority chip */}
          <Popover>
            <PopoverTrigger className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#2A2A2A] bg-transparent px-2.5 text-[12px] font-medium text-[#A3A3A3] hover:bg-white/5 transition-colors">
              <Flag className={cn("h-3 w-3", priorityConfig[priority].color)} />
              <span>{priorityConfig[priority].label}</span>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={4}
              className="w-48 p-1 bg-[#1C1C1E] border-[#2A2A2A]"
            >
              {priorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors"
                >
                  <Flag className={cn("h-3 w-3", priorityConfig[p].color)} />
                  <span className="flex-1 text-left">{priorityConfig[p].label}</span>
                  {priority === p && <Check className="h-3.5 w-3.5 text-[#3B82F6]" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Assignee chip */}
          <Popover>
            <PopoverTrigger className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#2A2A2A] bg-transparent px-2.5 text-[12px] font-medium text-[#A3A3A3] hover:bg-white/5 transition-colors">
              <UserRound className="h-3 w-3" />
              <span>{selectedAssignee?.label ?? "Assignee"}</span>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={4}
              className="w-64 p-1 bg-[#1C1C1E] border-[#2A2A2A]"
            >
              <button
                type="button"
                onClick={() => setAssigneeUserId("")}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-[#A3A3A3] hover:bg-white/5 transition-colors"
              >
                <span className="flex-1 text-left">Unassigned</span>
                {!assigneeUserId && <Check className="h-3.5 w-3.5 text-[#3B82F6]" />}
              </button>
              <div className="my-1 h-px bg-[#2A2A2A]" />
              {assigneeOptions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAssigneeUserId(a.id)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors"
                >
                  <span className="flex-1 truncate text-left">{a.label}</span>
                  {assigneeUserId === a.id && <Check className="h-3.5 w-3.5 text-[#3B82F6]" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Labels chip */}
          <button
            type="button"
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-[#2A2A2A] bg-transparent px-2.5 text-[12px] font-medium text-[#A3A3A3] hover:bg-white/5 transition-colors"
          >
            <Tag className="h-3 w-3" />
            <span>Labels</span>
          </button>

          {/* More menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-7 items-center justify-center rounded-full border border-[#2A2A2A] bg-transparent px-2 text-[#A3A3A3] hover:bg-white/5 transition-colors">
              <span className="text-[11px] tracking-wider">•••</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={4}
              className="min-w-52 bg-[#1C1C1E] border-[#2A2A2A]"
            >
              <DropdownMenu>
                <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors">
                  <CalendarDays className="h-4 w-4 text-[#525252]" />
                  <span className="flex-1 text-left">Set due date</span>
                  <ChevronRight className="h-3.5 w-3.5 text-[#525252]" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  align="start"
                  sideOffset={4}
                  className="min-w-56 bg-[#1C1C1E] border-[#2A2A2A]"
                >
                  {dueDatePresets.map((preset) => (
                    <DropdownMenuItem
                      key={preset.value}
                      onClick={() => setDueDate(preset.value)}
                      className="text-[#E5E5E5]"
                    >
                      <CalendarDays className="h-4 w-4 text-[#525252]" />
                      <span className="flex-1">{preset.label}</span>
                      <span className="text-[11px] text-[#525252]">{preset.subtitle}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                  <DropdownMenuItem onClick={() => setDueDate("")} className="text-[#E5E5E5]">
                    <span className="flex-1">Clear due date</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenuSeparator className="bg-[#2A2A2A]" />
              <DropdownMenuItem className="text-[#E5E5E5]">
                <Tag className="h-4 w-4 text-[#525252]" />
                <span>Add label...</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex-1" />

          {/* Attachment */}
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#525252] hover:bg-white/5 hover:text-[#A3A3A3] transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Bottom bar: create more + submit */}
        <div className="flex items-center justify-between border-t border-[#2A2A2A] px-4 py-3">
          <button
            type="button"
            onClick={() => setCreateMore(!createMore)}
            className="flex items-center gap-2 text-[12px] text-[#525252] hover:text-[#A3A3A3] transition-colors"
          >
            <div
              className={cn(
                "relative h-4 w-7 rounded-full transition-colors",
                createMore ? "bg-[#3B82F6]" : "bg-[#3D3D3D]",
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform",
                  createMore ? "translate-x-3.5" : "translate-x-0.5",
                )}
              />
            </div>
            <span>Create more</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="inline-flex h-8 items-center rounded-lg bg-[#5E6AD2] px-3.5 text-[13px] font-medium text-white hover:bg-[#4F5BC0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Creating..." : "Create issue"}
          </button>
        </div>
      </div>
    </div>
  );
}
