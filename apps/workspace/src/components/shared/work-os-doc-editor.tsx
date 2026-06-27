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
  useMemo,
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
import Image from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import UnderlineExtension from "@tiptap/extension-underline";
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
  Heading1,
  Heading2,
  Heading3,
  Strikethrough,
  Underline,
  ImageIcon,
  Link2,
  Loader2,
  Maximize2,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { uploadFiles } from "@/lib/uploadthing";
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
  type?: "member" | "client" | "project" | "task" | "meeting" | "deal" | "file";
  href?: string;
}

export type DocEditorContext =
  | { scope: "global"; organizationId: string }
  | { scope: "project"; organizationId: string; projectId: string };

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
  /** People/entities available for @ and @/-mention */
  mentionOptions?: DocEditorMentionOption[];
  /** Current document context used to scope entity links and labels */
  documentContext?: DocEditorContext;
  /** Trailing content rendered below metadata rows (e.g. subtasks, attachments) */
  children?: ReactNode;
  /** Extra class on the outermost container */
  className?: string;
  /** Hide the always-visible formatting bar and use only contextual controls */
  compactFormatting?: boolean;
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

function EditorToolbar({
  editor,
  onInsertLink,
  onPickImage,
  onPickFile,
}: {
  editor: ReturnType<typeof useEditor>;
  onInsertLink: () => void;
  onPickImage: () => void;
  onPickFile: () => void;
}) {
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
      <div className="mx-1.5 h-3.5 w-px bg-border" />

      {/* Rich inserts */}
      <ToolbarBtn title="Insert link" onClick={onInsertLink}>
        <Link2 className="h-3 w-3" />
      </ToolbarBtn>
      <ToolbarBtn title="Upload image" onClick={onPickImage}>
        <ImageIcon className="h-3 w-3" />
      </ToolbarBtn>
      <ToolbarBtn title="Attach file" onClick={onPickFile}>
        <Paperclip className="h-3 w-3" />
      </ToolbarBtn>
    </div>
  );
}

function safeEditorHtml(editor: ReturnType<typeof useEditor>) {
  if (!editor || editor.isDestroyed) return null;
  try {
    return editor.getHTML();
  } catch {
    return null;
  }
}

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width") || null,
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
            style: `width: ${attributes.width}; max-width: 100%; height: auto;`,
          };
        },
      },
    };
  },
});

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
  documentContext,
  children,
  className,
  compactFormatting = false,
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
  const slashFromRef = useRef(0);
  const slashSelectedIndexRef = useRef(0);
  const [slashSelectedIndex, setSlashSelectedIndex] = useState(0);
  const slashItemsRef = useRef<SlashMenuItem[]>([]);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const showMentionMenuRef = useRef(false);
  const mentionFromRef = useRef(0);
  const [mentionItems, setMentionItems] = useState<DocEditorMentionOption[]>(
    [],
  );
  const mentionItemsRef = useRef<DocEditorMentionOption[]>([]);
  const mentionSelectedIndexRef = useRef(0);
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [selectionToolbar, setSelectionToolbar] = useState({
    show: false,
    top: 0,
    left: 0,
  });
  const [linkPanel, setLinkPanel] = useState({
    open: false,
    href: "",
    label: "",
  });
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // ── Tiptap editor ───────────────────────────────────────────────────────
  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        orderedList: false,
      }),
      LinkExtension.configure({
        autolink: true,
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2",
          rel: "noreferrer",
          target: "_blank",
        },
      }),
      UnderlineExtension,
      Heading.configure({ levels: [1, 2, 3] }),
      Blockquote,
      CodeBlock,
      OrderedList,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      ResizableImage.configure({
        HTMLAttributes: {
          class:
            "my-4 block h-auto max-w-full rounded-2xl border border-border",
        },
      }),
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
          items: ({ query }: { query: string }) => {
            const normalized = query.startsWith("/") ? query.slice(1) : query;
            return mentionOptions
              .filter((m) =>
                [m.label, m.helper, m.type].some((value) =>
                  value?.toLowerCase().includes(normalized.toLowerCase()),
                ),
              )
              .slice(0, 8);
          },
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
      const html = safeEditorHtml(e);
      if (!html) return;
      onBodyChange?.(html);

      // Contextual @/ mention detection
      const { state } = e;
      const { from } = state.selection;
      const textBefore = state.doc.textBetween(
        Math.max(0, from - 80),
        from,
        "\n",
      );
      const mentionIndex = textBefore.lastIndexOf("@/");
      if (mentionIndex !== -1) {
        const query = textBefore.slice(mentionIndex + 2);
        if (!query.includes("\n")) {
          const absFrom = from - (textBefore.length - mentionIndex);
          const filtered = mentionOptions
            .filter((item) =>
              [item.label, item.helper, item.type].some((value) =>
                value?.toLowerCase().includes(query.toLowerCase()),
              ),
            )
            .slice(0, 10);
          mentionFromRef.current = absFrom;
          mentionItemsRef.current = filtered;
          mentionSelectedIndexRef.current = 0;
          setMentionItems(filtered);
          setMentionSelectedIndex(0);
          const domPos = e.view.domAtPos(from);
          const node = domPos.node as HTMLElement;
          const el =
            node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
          if (el) {
            const rect = el.getBoundingClientRect();
            setMenuPos({ top: rect.bottom + 4, left: rect.left });
          }
          showMentionMenuRef.current = true;
          setShowMentionMenu(true);
          return;
        }
      }
      if (showMentionMenuRef.current) {
        showMentionMenuRef.current = false;
        setShowMentionMenu(false);
      }

      // Slash command detection
      const slashIndex = textBefore.lastIndexOf("/");
      const slashIsMentionTrigger = slashIndex > 0 && textBefore[slashIndex - 1] === "@";
      if (slashIndex !== -1 && !slashIsMentionTrigger) {
        const query = textBefore.slice(slashIndex + 1);
        if (!query.includes(" ") && !query.includes("\n")) {
          const absFrom = from - (textBefore.length - slashIndex);
          slashFromRef.current = absFrom;
          const filtered = getSlashCommandItems().filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()),
          );
          slashItemsRef.current = filtered;
          setSlashItems(filtered);
          slashSelectedIndexRef.current = 0;
          setSlashSelectedIndex(0);

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
    onSelectionUpdate({ editor: e }) {
      const { from, to } = e.state.selection;
      if (from === to) {
        setSelectionToolbar((current) =>
          current.show ? { ...current, show: false } : current,
        );
        return;
      }
      const start = e.view.coordsAtPos(from);
      const end = e.view.coordsAtPos(to);
      setSelectionToolbar({
        show: true,
        top: Math.max(8, Math.min(start.top, end.top) - 46),
        left: Math.min(
          Math.max(12, (start.left + end.right) / 2 - 96),
          Math.max(12, window.innerWidth - 220),
        ),
      });
    },
    editorProps: {
      attributes: {
        class:
          "doc-editor-body prose prose-sm dark:prose-invert prose-zinc max-w-none min-h-[240px] px-0 py-4 text-sm leading-relaxed text-foreground focus:outline-none",
      },
      handleClick(view, pos, event) {
        const target = event.target as HTMLElement | null;
        const link = target?.closest?.("a[href]") as HTMLAnchorElement | null;
        if (!link?.href) return false;
        if (event.metaKey || event.ctrlKey || link.dataset.mentionType) {
          event.preventDefault();
          window.location.href = link.getAttribute("href") || link.href;
          return true;
        }
        return false;
      },
      handleKeyDown(view, event) {
        if (showMentionMenuRef.current) {
          const items = mentionItemsRef.current;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            const nextIndex = Math.min(
              mentionSelectedIndexRef.current + 1,
              items.length - 1,
            );
            mentionSelectedIndexRef.current = nextIndex;
            setMentionSelectedIndex(nextIndex);
            setMentionItems([...items]);
            return true;
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            const nextIndex = Math.max(mentionSelectedIndexRef.current - 1, 0);
            mentionSelectedIndexRef.current = nextIndex;
            setMentionSelectedIndex(nextIndex);
            setMentionItems([...items]);
            return true;
          }
          if (event.key === "Enter" && items.length > 0) {
            event.preventDefault();
            executeMentionReference(items[mentionSelectedIndexRef.current]);
            return true;
          }
          if (event.key === "Escape") {
            showMentionMenuRef.current = false;
            setShowMentionMenu(false);
            return true;
          }
          return false;
        }
        if (!showSlashMenuRef.current) return false;
        const items = slashItemsRef.current;
        if (event.key === "ArrowDown") {
          event.preventDefault();
          const nextIndex = Math.min(
            slashSelectedIndexRef.current + 1,
            items.length - 1,
          );
          slashSelectedIndexRef.current = nextIndex;
          setSlashSelectedIndex(nextIndex);
          setSlashItems([...items]); // force re-render
          return true;
        }
        if (event.key === "ArrowUp") {
          event.preventDefault();
          const nextIndex = Math.max(slashSelectedIndexRef.current - 1, 0);
          slashSelectedIndexRef.current = nextIndex;
          setSlashSelectedIndex(nextIndex);
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
    if (!editor || editor.isDestroyed) return;
    const currentHtml = safeEditorHtml(editor);
    if (currentHtml && body !== currentHtml) {
      editor.commands.setContent(body, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [body]);

  const localizedHref = useCallback((href: string) => {
    if (!href || href === "#" || /^(https?:|mailto:|tel:)/.test(href)) return href || "#";
    if (typeof window === "undefined") return href;
    const first = window.location.pathname.split("/").filter(Boolean)[0];
    const prefix = first && /^[a-z]{2}(?:-[A-Z]{2})?$/.test(first) ? `/${first}` : "";
    if (!prefix || href.startsWith(`${prefix}/`)) return href;
    if (/^\/[a-z]{2}(?:-[A-Z]{2})?\//.test(href)) return href;
    return `${prefix}${href.startsWith("/") ? href : `/${href}`}`;
  }, []);

  const executeMentionReference = useCallback(
    (option: DocEditorMentionOption) => {
      if (!editor) return;
      const mentionStart = mentionFromRef.current;
      const { from } = editor.state.selection;
      const type = option.type || "member";
      const label = option.label.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const href = localizedHref(option.href || "#");
      editor
        .chain()
        .focus()
        .deleteRange({ from: mentionStart, to: from })
        .insertContent(
          `<a href="${href}" data-mention-type="${type}" data-mention-id="${option.id}" class="mention inline-flex items-center rounded bg-primary/10 px-1 text-primary font-medium">@${label}</a>&nbsp;`,
        )
        .run();
      showMentionMenuRef.current = false;
      mentionSelectedIndexRef.current = 0;
      setMentionSelectedIndex(0);
      setShowMentionMenu(false);
    },
    [editor, localizedHref],
  );

  const executeSlashCommand = useCallback(
    (item: SlashMenuItem) => {
      if (!editor) return;
      const slashStart = slashFromRef.current;
      const { state } = editor;
      const { from } = state.selection;
      editor.chain().focus().deleteRange({ from: slashStart, to: from }).run();
      item.chainCommands(editor.chain().focus()).run();
      showSlashMenuRef.current = false;
      slashSelectedIndexRef.current = 0;
      setSlashSelectedIndex(0);
      setShowSlashMenu(false);
    },
    [editor, localizedHref],
  );

  const handleBodyBlur = useCallback(() => {
    const html = safeEditorHtml(editor);
    if (!html) return;
    onBodyBlur?.(html);
  }, [editor, onBodyBlur]);

  const openLinkPanel = useCallback(() => {
    if (!editor) return;
    const selected = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      " ",
    );
    setLinkPanel({ open: true, href: "", label: selected });
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor || !linkPanel.href.trim()) return;
    const rawHref = linkPanel.href.trim();
    const href = /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(rawHref)
      ? localizedHref(rawHref)
      : `https://${rawHref}`;
    const label = (linkPanel.label || href).trim();
    if (editor.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${href}">${label}</a>`).run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkPanel({ open: false, href: "", label: "" });
  }, [editor, linkPanel.href, linkPanel.label, localizedHref]);

  const uploadAndInsert = useCallback(
    async (files: FileList | null, mode: "image" | "file") => {
      if (!editor || !files?.length) return;
      setUploading(true);
      try {
        const [uploaded] = await uploadFiles("projectMedia", {
          files: Array.from(files),
          input: { organizationId: documentContext?.organizationId || "" },
        });
        if (!uploaded?.url) return;
        if (mode === "image") {
          editor
            .chain()
            .focus()
            .setImage({
              src: uploaded.url,
              alt: uploaded.name || "Uploaded image",
            })
            .updateAttributes("image", { width: "100%" })
            .run();
        } else {
          editor
            .chain()
            .focus()
            .insertContent(
              `<p><a href="${uploaded.url}" target="_blank" rel="noreferrer">📎 ${uploaded.name || "Attached file"}</a></p>`,
            )
            .run();
        }
      } finally {
        setUploading(false);
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [documentContext?.organizationId, editor],
  );

  const menuStyle = {
    top: menuPos.top,
    left: Math.min(
      menuPos.left,
      Math.max(
        16,
        (typeof window !== "undefined" ? window.innerWidth : 1200) - 384,
      ),
    ),
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className={cn("flex h-full flex-col bg-background", className)}>
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-6 pb-20 pt-8 sm:px-10">
          {/* ── Title ── */}
          <div className="relative mb-4">
            <textarea
              ref={titleRef}
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={() => {
                const trimmed = localTitle.trim();
                if (trimmed !== title)
                  onTitleBlur?.(trimmed || titlePlaceholder);
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
                "text-[1.8rem] font-bold leading-tight tracking-tight text-foreground",
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
            <div className="mb-5 grid gap-2 md:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className="group grid min-h-9 grid-cols-[112px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-transparent px-2 py-1 transition-colors hover:border-border hover:bg-muted/35"
                >
                  <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-text-muted">
                    <span className="shrink-0 opacity-60">{field.icon}</span>
                    <span className="truncate">{field.label}</span>
                  </div>
                  <div className="min-w-0 text-sm text-foreground">
                    {field.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Divider ── */}
          <div className="mb-4 h-px bg-border/80" />

          {/* ── Editor ── */}
          <div
            ref={editorContainerRef}
            className="relative"
            onBlur={(e) => {
              // Only fire when focus leaves the editor entirely
              if (
                !editorContainerRef.current?.contains(e.relatedTarget as Node)
              ) {
                handleBodyBlur();
              }
            }}
          >
            {!compactFormatting && (
              <div className="sticky top-0 z-10 -mx-1 mb-2 overflow-hidden rounded-xl border border-border shadow-sm">
                <EditorToolbar
                  editor={editor}
                  onInsertLink={openLinkPanel}
                  onPickImage={() => imageInputRef.current?.click()}
                  onPickFile={() => fileInputRef.current?.click()}
                />
              </div>
            )}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void uploadAndInsert(e.target.files, "image")}
            />
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => void uploadAndInsert(e.target.files, "file")}
            />
            {uploading && (
              <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[10px] text-text-muted">
                {uploading && (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                  </span>
                )}
              </div>
            )}

            <EditorContent editor={editor} />
            {editor &&
              selectionToolbar.show &&
              typeof document !== "undefined" &&
              createPortal(
                <div
                  className="fixed z-[2000] flex items-center gap-0.5 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-2xl"
                  style={{
                    top: selectionToolbar.top,
                    left: selectionToolbar.left,
                  }}
                >
                  <ToolbarBtn
                    title="Heading 1"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive("heading", { level: 1 })}
                  >
                    <Heading1 className="h-3 w-3" />
                  </ToolbarBtn>
                  <ToolbarBtn
                    title="Heading 2"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive("heading", { level: 2 })}
                  >
                    <Heading2 className="h-3 w-3" />
                  </ToolbarBtn>
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
                  <ToolbarBtn
                    title="Underline"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive("underline")}
                  >
                    <Underline className="h-3 w-3" />
                  </ToolbarBtn>
                  <ToolbarBtn
                    title="Strikethrough"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive("strike")}
                  >
                    <Strikethrough className="h-3 w-3" />
                  </ToolbarBtn>
                  <ToolbarBtn title="Link" onClick={openLinkPanel}>
                    <Link2 className="h-3 w-3" />
                  </ToolbarBtn>
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
                  <ToolbarBtn
                    title="Quote"
                    onClick={() =>
                      editor.chain().focus().toggleBlockquote().run()
                    }
                    active={editor.isActive("blockquote")}
                  >
                    <Quote className="h-3 w-3" />
                  </ToolbarBtn>
                  <ToolbarBtn
                    title="Code"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    active={editor.isActive("code")}
                  >
                    <Code className="h-3 w-3" />
                  </ToolbarBtn>
                  {editor.isActive("image") ? (
                    <>
                      <div className="mx-1 h-3.5 w-px bg-border" />
                      <ToolbarBtn
                        title="Small image"
                        onClick={() =>
                          editor.chain().focus().updateAttributes("image", { width: "40%" }).run()
                        }
                      >
                        <ImageIcon className="h-3 w-3" />
                      </ToolbarBtn>
                      <ToolbarBtn
                        title="Medium image"
                        onClick={() =>
                          editor.chain().focus().updateAttributes("image", { width: "65%" }).run()
                        }
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                      </ToolbarBtn>
                      <ToolbarBtn
                        title="Full width image"
                        onClick={() =>
                          editor.chain().focus().updateAttributes("image", { width: "100%" }).run()
                        }
                      >
                        <Maximize2 className="h-3 w-3" />
                      </ToolbarBtn>
                    </>
                  ) : null}
                </div>,
                document.body,
              )}

            {linkPanel.open &&
              typeof document !== "undefined" &&
              createPortal(
                <div
                  className="fixed z-[2000] w-[min(92vw,360px)] rounded-2xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl"
                  style={{
                    top: Math.max(80, selectionToolbar.top || 160),
                    left: Math.min(
                      Math.max(16, selectionToolbar.left || 280),
                      Math.max(
                        16,
                        (typeof window !== "undefined"
                          ? window.innerWidth
                          : 1200) - 384,
                      ),
                    ),
                  }}
                >
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    Add link
                  </div>
                  <label className="mb-2 block text-xs font-semibold text-text-muted">
                    Link name
                  </label>
                  <input
                    value={linkPanel.label}
                    onChange={(e) =>
                      setLinkPanel((current) => ({
                        ...current,
                        label: e.target.value,
                      }))
                    }
                    className="mb-3 h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="Display text"
                  />
                  <label className="mb-2 block text-xs font-semibold text-text-muted">
                    URL
                  </label>
                  <input
                    value={linkPanel.href}
                    onChange={(e) =>
                      setLinkPanel((current) => ({
                        ...current,
                        href: e.target.value,
                      }))
                    }
                    className="h-9 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/20"
                    placeholder="https://..."
                    autoFocus
                  />
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setLinkPanel({ open: false, href: "", label: "" });
                      }}
                      className="h-8 rounded-xl px-3 text-xs font-semibold text-text-muted hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyLink();
                      }}
                      className="h-8 rounded-xl bg-primary px-3 text-xs font-semibold text-primary-foreground"
                    >
                      Insert link
                    </button>
                  </div>
                </div>,
                document.body,
              )}

            {/* Slash command portal */}
            {editor &&
              showSlashMenu &&
              typeof document !== "undefined" &&
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
                    selectedIndex={slashSelectedIndex}
                  />
                </div>,
                document.body,
              )}
            {editor &&
              showMentionMenu &&
              typeof document !== "undefined" &&
              createPortal(
                <div
                  className="fixed z-[2000] w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-border bg-popover p-1 text-popover-foreground shadow-2xl"
                  style={menuStyle}
                >
                  <div className="border-b border-border px-3 py-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-text-muted">
                      Reference workspace
                    </div>
                    <div className="text-xs text-text-muted">
                      Members, clients, projects, and scoped tasks
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {mentionItems.length === 0 ? (
                      <div className="px-3 py-3 text-xs text-text-muted">
                        No matching references
                      </div>
                    ) : (
                      mentionItems.map((item, index) => (
                        <button
                          key={`${item.type || "member"}-${item.id}`}
                          type="button"
                          className={cn(
                            "flex w-full flex-col rounded-lg px-3 py-2 text-left transition-colors",
                            index === mentionSelectedIndex
                              ? "bg-muted text-foreground"
                              : "text-foreground hover:bg-muted/70",
                          )}
                          onMouseDown={(event) => {
                            event.preventDefault();
                            executeMentionReference(item);
                          }}
                        >
                          <span className="text-sm font-semibold">
                            @{item.label}
                          </span>
                          <span className="text-[11px] text-text-muted">
                            {item.helper || item.type || "Reference"}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
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
