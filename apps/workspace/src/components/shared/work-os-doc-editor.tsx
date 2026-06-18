"use client";

/**
 * WorkOsDocEditor
 *
 * A reusable document-editor component that renders a ClickUp-style detail
 * view: large editable title, structured metadata rows, and a full Tiptap
 * rich-text body with slash-command support and @-mention.
 *
 * Designed to be used for:
 *   • Task detail screens
 *   • Project documents
 *
 * The component is purely presentational — it surfaces callbacks for every
 * edit event; callers are responsible for persisting data.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import TextAlign from "@tiptap/extension-text-align";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Heading from "@tiptap/extension-heading";
import OrderedList from "@tiptap/extension-ordered-list";
import { createPortal } from "react-dom";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Code,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Heading2,
  Heading3,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SlashCommandMenu,
  getSlashCommandItems,
  type SlashMenuItem,
} from "@/domains/tasks/components/slash-command-menu";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DocEditorMetaField {
  /** Unique key for this field */
  key: string;
  /** Icon rendered on the left */
  icon: ReactNode;
  /** Label shown to the left */
  label: string;
  /** Rendered value / control (button, select, etc.) */
  value: ReactNode;
}

export interface DocEditorMentionOption {
  id: string;
  label: string;
  helper?: string;
}

export interface WorkOsDocEditorProps {
  /** Current title value */
  title: string;
  /** Current body HTML */
  body: string;
  /** Metadata rows shown below the title */
  fields: DocEditorMetaField[];
  /** Placeholder shown when title is empty */
  titlePlaceholder?: string;
  /** Placeholder shown when body is empty */
  bodyPlaceholder?: string;
  /** Whether the whole editor is in a saving/busy state */
  isSaving?: boolean;
  /** Called when the title field loses focus with a new value */
  onTitleBlur?: (value: string) => void;
  /** Called when the body loses focus with new HTML */
  onBodyBlur?: (html: string) => void;
  /** Called on every body keystroke — use for optimistic local state only */
  onBodyChange?: (html: string) => void;
  /** People available for @-mention */
  mentionOptions?: DocEditorMentionOption[];
  /** Trailing content rendered below metadata rows (e.g. subtasks, attachments) */
  children?: ReactNode;
  /** Extra class on the outermost container */
  className?: string;
}

// ─── Toolbar button ──────────────────────────────────────────────────────────

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  title?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-text-muted hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

// ─── Floating editor toolbar ─────────────────────────────────────────────────

function EditorToolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-card/60 px-3 py-1.5 backdrop-blur-sm">
      {/* Text style */}
      <ToolbarBtn
        title="Bold"
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
      >
        <Bold className="h-3 w-3" />
      </ToolbarBtn>
      <ToolbarBtn
        title="Italic"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
      >
        <Italic className="h-3 w-3" />
      </ToolbarBtn>

      <div className="mx-1.5 h-3.5 w-px bg-border" />

      {/* Headings */}
      <ToolbarBtn
        title="Heading 2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 className="h-3 w-3" />
      </ToolbarBtn>
      <ToolbarBtn
        title="Heading 3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 className="h-3 w-3" />
      </ToolbarBtn>

      <div className="mx-1.5 h-3.5 w-px bg-border" />

      {/* Lists */}
      <ToolbarBtn
        title="Bullet list"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
      >
        <List className="h-3 w-3" />
      </ToolbarBtn>
      <ToolbarBtn
        title="Numbered list"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
      >
        <ListOrdered className="h-3 w-3" />
      </ToolbarBtn>

      <div className="mx-1.5 h-3.5 w-px bg-border" />

      {/* Blocks */}
      <ToolbarBtn
        title="Blockquote"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
      >
        <Quote className="h-3 w-3" />
      </ToolbarBtn>
      <ToolbarBtn
        title="Code block"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
      >
        <Code className="h-3 w-3" />
      </ToolbarBtn>
      <ToolbarBtn
        title="Divider"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-3 w-3" />
      </ToolbarBtn>

      <div className="mx-1.5 h-3.5 w-px bg-border" />

      {/* Alignment */}
      <ToolbarBtn
        title="Align left"
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
      >
        <AlignLeft className="h-3 w-3" />
      </ToolbarBtn>
      <ToolbarBtn
        title="Align center"
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
      >
        <AlignCenter className="h-3 w-3" />
      </ToolbarBtn>
      <ToolbarBtn
        title="Align right"
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
      >
        <AlignRight className="h-3 w-3" />
      </ToolbarBtn>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorkOsDocEditor({
  title,
  body,
  fields,
  titlePlaceholder = "Untitled",
  bodyPlaceholder = "Write something, or type / for commands…",
  isSaving = false,
  onTitleBlur,
  onBodyBlur,
  onBodyChange,
  mentionOptions = [],
  children,
  className,
}: WorkOsDocEditorProps) {
  // ── Title ──────────────────────────────────────────────────────────────
  const [localTitle, setLocalTitle] = useState(title);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Sync external title into local state when it changes externally
  useEffect(() => {
    if (title !== localTitle) setLocalTitle(title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // Auto-grow textarea height
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [localTitle]);

  // ── Slash menu state ────────────────────────────────────────────────────
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const showSlashMenuRef = useRef(false);
  const [slashItems, setSlashItems] = useState<SlashMenuItem[]>([]);
  const [slashFrom, setSlashFrom] = useState(0);
  const slashFromRef = useRef(0);
  const slashSelectedIndexRef = useRef(0);
  const slashItemsRef = useRef<SlashMenuItem[]>([]);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // ── Tiptap editor ───────────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        orderedList: false,
      }),
      Heading.configure({ levels: [1, 2, 3] }),
      Blockquote,
      CodeBlock,
      OrderedList,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder: bodyPlaceholder,
        emptyEditorClass:
          "is-editor-empty before:absolute before:text-text-muted/60 before:content-[attr(data-placeholder)] before:pointer-events-none",
      }),
      Mention.configure({
        HTMLAttributes: {
          class:
            "mention inline-flex items-center rounded bg-primary/10 px-1 text-primary font-medium",
        },
        suggestion: {
          char: "@",
          items: ({ query }: { query: string }) =>
            mentionOptions
              .filter((m) => m.label.toLowerCase().includes(query.toLowerCase()))
              .slice(0, 6),
          render: () => {
            // Minimal inline dropdown handled via portal below
            return {
              onStart: () => {},
              onUpdate: () => {},
              onKeyDown: () => false,
              onExit: () => {},
            };
          },
        },
      }),
    ],
    content: body,
    onUpdate({ editor: e }) {
      const html = e.getHTML();
      onBodyChange?.(html);

      // Slash command detection
      const { state } = e;
      const { from } = state.selection;
      const textBefore = state.doc.textBetween(
        Math.max(0, from - 50),
        from,
        "\n",
      );
      const slashIndex = textBefore.lastIndexOf("/");
      if (slashIndex !== -1) {
        const query = textBefore.slice(slashIndex + 1);
        if (!query.includes(" ") && !query.includes("\n")) {
          const absFrom = from - (textBefore.length - slashIndex);
          slashFromRef.current = absFrom;
          setSlashFrom(absFrom);
          const filtered = getSlashCommandItems().filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          );
          slashItemsRef.current = filtered;
          setSlashItems(filtered);
          slashSelectedIndexRef.current = 0;

          // Position the menu near the cursor
          const domPos = e.view.domAtPos(from);
          const node = domPos.node as HTMLElement;
          const el =
            node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
          if (el) {
            const rect = el.getBoundingClientRect();
            setMenuPos({ top: rect.bottom + 4, left: rect.left });
          }
          showSlashMenuRef.current = true;
          setShowSlashMenu(true);
          return;
        }
      }
      if (showSlashMenuRef.current) {
        showSlashMenuRef.current = false;
        setShowSlashMenu(false);
      }
    },
    editorProps: {
      attributes: {
        class:
          "doc-editor-body prose prose-sm dark:prose-invert prose-zinc max-w-none min-h-[240px] px-0 py-4 text-sm leading-relaxed text-foreground focus:outline-none",
      },
      handleKeyDown(view, event) {
        if (!showSlashMenuRef.current) return false;
        const items = slashItemsRef.current;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          slashSelectedIndexRef.current = Math.min(
            slashSelectedIndexRef.current + 1,
            items.length - 1,
          );
          setSlashItems([...items]); // force re-render
          return true;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          slashSelectedIndexRef.current = Math.max(
            slashSelectedIndexRef.current - 1,
            0,
          );
          setSlashItems([...items]);
          return true;
        }
        if (event.key === "Enter" && items.length > 0) {
          event.preventDefault();
          executeSlashCommand(items[slashSelectedIndexRef.current]);
          return true;
        }
        if (event.key === "Escape") {
          showSlashMenuRef.current = false;
          setShowSlashMenu(false);
          return true;
        }
        return false;
      },
    },
  });

  // Sync external body when it changes from outside
  useEffect(() => {
    if (!editor) return;
    if (body !== editor.getHTML()) {
      editor.commands.setContent(body, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);

  const executeSlashCommand = useCallback(
    (item: SlashMenuItem) => {
      if (!editor) return;
      const slashStart = slashFromRef.current;
      const { state } = editor;
      const { from } = state.selection;
      editor
        .chain()
        .focus()
        .deleteRange({ from: slashStart, to: from })
        .run();
      item.chainCommands(editor.chain().focus()).run();
      showSlashMenuRef.current = false;
      slashSelectedIndexRef.current = 0;
      setShowSlashMenu(false);
    },
    [editor],
  );

  const handleBodyBlur = useCallback(() => {
    if (!editor) return;
    onBodyBlur?.(editor.getHTML());
  }, [editor, onBodyBlur]);

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-8 pb-20 pt-10">
          {/* ── Title ── */}
          <div className="relative mb-2">
            <textarea
              ref={titleRef}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={() => {
                const trimmed = localTitle.trim();
                if (trimmed !== title) onTitleBlur?.(trimmed || titlePlaceholder);
              }}
              onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  editor?.commands.focus("start");
                }
              }}
              placeholder={titlePlaceholder}
              rows={1}
              className={cn(
                "w-full resize-none overflow-hidden bg-transparent",
                "text-[2rem] font-bold leading-tight tracking-tight text-foreground",
                "placeholder:text-text-muted/40",
                "outline-none focus:outline-none",
                "transition-colors",
              )}
              aria-label="Document title"
            />
            {isSaving && (
              <div className="absolute end-0 top-1 flex items-center gap-1.5 text-[11px] text-text-muted">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving…</span>
              </div>
            )}
          </div>

          {/* ── Metadata rows ── */}
          {fields.length > 0 && (
            <div className="mb-6 flex flex-col gap-0.5">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="group flex min-h-[34px] items-center gap-0 rounded-lg transition-colors hover:bg-muted/50"
                >
                  {/* Label column — fixed width */}
                  <div className="flex w-40 shrink-0 items-center gap-2 px-3 text-xs font-medium text-text-muted">
                    <span className="shrink-0 opacity-60">{field.icon}</span>
                    <span className="truncate">{field.label}</span>
                  </div>
                  {/* Value column */}
                  <div className="min-w-0 flex-1 px-2 text-sm text-foreground">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Divider ── */}
          <div className="mb-4 h-px bg-border" />

          {/* ── Editor ── */}
          <div
            ref={editorContainerRef}
            className="relative"
            onBlur={(e) => {
              // Only fire when focus leaves the editor entirely
              if (!editorContainerRef.current?.contains(e.relatedTarget as Node)) {
                handleBodyBlur();
              }
            }}
          >
            {/* Sticky toolbar */}
            <div className="sticky top-0 z-10 -mx-1 mb-2 overflow-hidden rounded-xl border border-border shadow-sm">
              <EditorToolbar editor={editor} />
            </div>

            <EditorContent editor={editor} />

            {/* Slash command portal */}
            {editor && showSlashMenu && typeof document !== "undefined" &&
              createPortal(
                <div
                  className="fixed z-[200]"
                  style={{ top: menuPos.top, left: menuPos.left }}
                >
                  <SlashCommandMenu
                    items={slashItems}
                    command={executeSlashCommand}
                    onClose={() => {
                      showSlashMenuRef.current = false;
                      setShowSlashMenu(false);
                    }}
                    selectedIndex={slashSelectedIndexRef.current}
                  />
                </div>,
                document.body,
              )}
          </div>

          {/* ── Extra content (subtasks, attachments, etc.) ── */}
          {children && (
            <div className="mt-8 border-t border-border pt-8">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
