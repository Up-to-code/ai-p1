"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Flag,
  Paperclip,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { TaskFormValues, TaskPriority, TaskStatus } from "../tasks.types";
import type { WorkOsPickerOption } from "@/domains/work-os/components/work-os-record-picker";
import { cn } from "@/lib/utils";
import {
  SlashCommandMenu,
  getSlashCommandItems,
  type SlashMenuItem,
} from "./slash-command-menu";

const statusConfig: Record<TaskStatus, { label: string; color: string; dot: string }> = {
  todo: { label: "Todo", color: "text-[#A3A3A3]", dot: "bg-[#A3A3A3]" },
  inProgress: { label: "In progress", color: "text-[#F59E0B]", dot: "bg-[#F59E0B]" },
  waiting: { label: "Waiting", color: "text-[#3B82F6]", dot: "bg-[#3B82F6]" },
  done: { label: "Done", color: "text-[#10B981]", dot: "bg-[#10B981]" },
  canceled: { label: "Canceled", color: "text-[#6B6B6B]", dot: "bg-[#6B6B6B]" },
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
  const [assigneeSearch, setAssigneeSearch] = useState("");
  const [showMentionMenu, setShowMentionMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Add description... Type / for commands, @ to mention",
        emptyEditorClass:
          "is-editor-empty before:absolute before:text-[#525252] before:content-[attr(data-placeholder)] before:pointer-events-none",
      }),
      Mention.configure({
        HTMLAttributes: {
          class: "mention text-[#5E6AD2] bg-[#5E6AD2]/10 rounded px-1",
        },
        suggestion: {
          char: "@",
          items: ({ query }: { query: string }) => {
            return assigneeOptions
              .filter((item) =>
                item.label.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 5);
          },
          render: () => {
            let component: HTMLDivElement | null = null;
            let popup: HTMLDivElement | null = null;

            return {
              onStart: (props: any) => {
                component = document.createElement("div");
                component.className = "suggestion-list bg-[#1C1C1E] border border-[#2A2A2A] rounded-xl shadow-xl p-1.5 w-64";
                component.style.position = "absolute";
                component.style.zIndex = "50";

                props.items.forEach((item: any) => {
                  const button = document.createElement("button");
                  button.type = "button";
                  button.className = "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors";
                  button.innerHTML = `
                    <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#3D3D3D] text-[10px] font-bold text-[#A3A3A3]">${item.label.charAt(0).toUpperCase()}</div>
                    <span class="flex-1 text-left">${item.label}</span>
                  `;
                  button.onclick = () => {
                    props.command({ id: item.id, label: item.label });
                    setShowMentionMenu(false);
                  };
                  component!.appendChild(button);
                });

                popup = document.createElement("div");
                popup.appendChild(component);
                document.body.appendChild(popup);
              },
              onUpdate: (props: any) => {
                if (component) {
                  component.innerHTML = "";
                  props.items.forEach((item: any) => {
                    const button = document.createElement("button");
                    button.type = "button";
                    button.className = "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors";
                    button.innerHTML = `
                      <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#3D3D3D] text-[10px] font-bold text-[#A3A3A3]">${item.label.charAt(0).toUpperCase()}</div>
                      <span class="flex-1 text-left">${item.label}</span>
                    `;
                    button.onclick = () => {
                      props.command({ id: item.id, label: item.label });
                      setShowMentionMenu(false);
                    };
                    component!.appendChild(button);
                  });
                }
              },
              onKeyDown: (props: any) => {
                if (props.event.key === "Escape") {
                  setShowMentionMenu(false);
                  return true;
                }
                return false;
              },
              onExit: () => {
                if (popup) {
                  popup.remove();
                  popup = null;
                  component = null;
                }
              },
            };
          },
        },
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm prose-invert max-w-none min-h-[80px] py-1 px-0 focus:outline-none text-[15px] leading-relaxed text-[#E5E5E5] [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[80px] [&_.ProseMirror_p]:my-0.5",
      },
    },
    onUpdate: ({ editor: e }) => {
      const { state } = e;
      const { from } = state.selection;
      const textBefore = state.doc.textBetween(Math.max(0, from - 20), from, "\n");

      if (textBefore.endsWith("/")) {
        setShowSlashMenu(true);
        setSlashItems(getSlashCommandItems());
      } else if (showSlashMenu) {
        const slashMatch = textBefore.match(/\/([a-zA-Z]*)$/);
        if (slashMatch) {
          const filter = slashMatch[1].toLowerCase();
          const all = getSlashCommandItems();
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

      const textBefore = state.doc.textBetween(Math.max(0, from - 30), from, "\n");
      const slashIndex = textBefore.lastIndexOf("/");
      if (slashIndex === -1) {
        setShowSlashMenu(false);
        return;
      }

      const slashFrom = from - (textBefore.length - slashIndex);
      const chain = editor.chain().focus().deleteRange({ from: slashFrom, to: from });
      item.chainCommands(chain).run();
      setShowSlashMenu(false);
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

  const filteredAssignees = assigneeSearch
    ? assigneeOptions.filter(
        (a) =>
          a.label.toLowerCase().includes(assigneeSearch.toLowerCase()) ||
          a.helper?.toLowerCase().includes(assigneeSearch.toLowerCase()),
      )
    : assigneeOptions;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="relative w-full max-w-[800px] mx-4 flex flex-col rounded-2xl bg-[#1C1C1E] border border-[#2A2A2A] shadow-2xl max-h-[85vh] overflow-hidden">
        {/* Top bar: project badge + close */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0 border-b border-[#2A2A2A]">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 items-center rounded-md bg-[#5E6AD2]/20 px-2 text-[11px] font-bold tracking-wide text-[#5E6AD2]">
              QEN
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-[#525252]" />
            <span className="text-[13px] font-medium text-[#A3A3A3]">New issue</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#525252] hover:bg-white/5 hover:text-[#A3A3A3] transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 pb-2 min-h-0">
          {/* Title */}
          <div className="pt-4 pb-2">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Issue title"
              className="w-full bg-transparent text-[18px] font-semibold text-white outline-none placeholder:text-[#525252]"
            />
          </div>

          {/* Description (Tiptap) */}
          <div className="relative min-h-[100px] pb-4">
            {editor && showSlashMenu && (
              <div className="absolute left-0 top-0 z-50">
                <SlashCommandMenu
                  items={slashItems}
                  command={handleSlashCommand}
                  onClose={() => setShowSlashMenu(false)}
                />
              </div>
            )}
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#2A2A2A] shrink-0" />

        {/* Bottom toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-3 shrink-0">
          {/* Status chip */}
          <Popover>
            <PopoverTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#252525] px-3 text-[12px] font-medium text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-[#E5E5E5] transition-colors">
              <div className={cn("h-2.5 w-2.5 rounded-full", statusConfig[status].dot)} />
              <span>{statusConfig[status].label}</span>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={4}
              className="w-52 p-1.5 bg-[#1C1C1E] border-[#2A2A2A] rounded-xl shadow-xl"
            >
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors"
                >
                  <div className={cn("h-2.5 w-2.5 rounded-full", statusConfig[s].dot)} />
                  <span className="flex-1 text-left">{statusConfig[s].label}</span>
                  {status === s && <Check className="h-4 w-4 text-[#5E6AD2]" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Priority chip */}
          <Popover>
            <PopoverTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#252525] px-3 text-[12px] font-medium text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-[#E5E5E5] transition-colors">
              <Flag className={cn("h-3.5 w-3.5", priorityConfig[priority].color)} />
              <span>{priorityConfig[priority].label}</span>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={4}
              className="w-52 p-1.5 bg-[#1C1C1E] border-[#2A2A2A] rounded-xl shadow-xl"
            >
              {priorities.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors"
                >
                  <Flag className={cn("h-3.5 w-3.5", priorityConfig[p].color)} />
                  <span className="flex-1 text-left">{priorityConfig[p].label}</span>
                  {priority === p && <Check className="h-4 w-4 text-[#5E6AD2]" />}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Assignee chip */}
          <Popover>
            <PopoverTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#252525] px-3 text-[12px] font-medium text-[#A3A3A3] hover:bg-[#2A2A2A] hover:text-[#E5E5E5] transition-colors">
              <UserRound className="h-3.5 w-3.5" />
              <span>{selectedAssignee?.label ?? "Assignee"}</span>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={4}
              className="w-72 p-1.5 bg-[#1C1C1E] border-[#2A2A2A] rounded-xl shadow-xl"
            >
              {/* Search */}
              <div className="px-2 pb-2">
                <div className="flex items-center gap-2 rounded-lg bg-[#252525] border border-[#2A2A2A] px-2.5 py-2">
                  <Search className="h-3.5 w-3.5 text-[#525252] shrink-0" />
                  <input
                    type="text"
                    value={assigneeSearch}
                    onChange={(e) => setAssigneeSearch(e.target.value)}
                    placeholder="Search or enter email..."
                    className="flex-1 bg-transparent text-[13px] text-[#E5E5E5] outline-none placeholder:text-[#525252]"
                  />
                </div>
              </div>

              {/* People section */}
              <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#525252]">
                People
              </div>

              {/* Me option */}
              <button
                type="button"
                onClick={() => {
                  setAssigneeUserId("");
                  setAssigneeSearch("");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#5E6AD2] text-[10px] font-bold text-white">
                  M
                </div>
                <span className="flex-1 text-left font-medium">Me</span>
                {!assigneeUserId && <Check className="h-4 w-4 text-[#5E6AD2]" />}
              </button>

              {/* Unassigned */}
              <button
                type="button"
                onClick={() => {
                  setAssigneeUserId("");
                  setAssigneeSearch("");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#A3A3A3] hover:bg-white/5 transition-colors"
              >
                <UserRound className="h-4 w-4 text-[#525252]" />
                <span className="flex-1 text-left">Unassigned</span>
              </button>

              <div className="my-1 h-px bg-[#2A2A2A]" />

              {/* Assignee list */}
              {filteredAssignees.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setAssigneeUserId(a.id);
                    setAssigneeSearch("");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3D3D3D] text-[10px] font-bold text-[#A3A3A3]">
                    {a.label.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="truncate font-medium">{a.label}</span>
                    {a.helper && (
                      <span className="truncate text-[11px] text-[#525252]">{a.helper}</span>
                    )}
                  </div>
                  {assigneeUserId === a.id && <Check className="h-4 w-4 text-[#5E6AD2] shrink-0" />}
                </button>
              ))}

              <div className="my-1 h-px bg-[#2A2A2A]" />

              {/* Create Agent */}
              <button
                type="button"
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-[#E5E5E5] hover:bg-white/5 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-[#3D3D3D]">
                  <Plus className="h-3 w-3 text-[#525252]" />
                </div>
                <span className="flex-1 text-left">Create Agent</span>
              </button>
            </PopoverContent>
          </Popover>

          <div className="flex-1" />

          {/* Attachment */}
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#525252] hover:bg-[#252525] hover:text-[#A3A3A3] transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#2A2A2A] shrink-0" />

        {/* Bottom bar: create more + submit */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <button
            type="button"
            onClick={() => setCreateMore(!createMore)}
            className="flex items-center gap-2.5 text-[12px] text-[#525252] hover:text-[#A3A3A3] transition-colors"
          >
            <div
              className={cn(
                "relative h-5 w-8 rounded-full transition-colors",
                createMore ? "bg-[#5E6AD2]" : "bg-[#3D3D3D]",
              )}
            >
              <div
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform shadow-sm",
                  createMore ? "translate-x-3.5" : "translate-x-0.5",
                )}
              />
            </div>
            <span className="font-medium">Create more</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#5E6AD2] px-5 text-[13px] font-semibold text-white hover:bg-[#4F5BC0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#5E6AD2]/20"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating...
              </>
            ) : (
              "Create issue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
