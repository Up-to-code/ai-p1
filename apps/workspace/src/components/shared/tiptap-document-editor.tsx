"use client";

import { createPortal } from "react-dom";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import {
  Bold,
  CheckSquare,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Plus,
  Quote,
  Strikethrough,
  UnderlineIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

export interface TiptapDocumentEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  editorClassName?: string;
  style?: CSSProperties;
  editorStyle?: CSSProperties;
  onUploadImage?: (file: File) => Promise<string | undefined>;
  disableImageUpload?: boolean;
  saveOnBlur?: boolean;
  onBlurHtml?: (value: string) => void;
  minHeightClassName?: string;
  variant?: "card" | "document" | "composer";
  mentionOptions?: Array<{
    id: string;
    label: string;
    helper?: string;
    type?: string;
    href?: string;
  }>;
  onSubmit?: () => void;
}

function FormatButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid size-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground",
      )}
    >
      {children}
    </button>
  );
}

type CommandId = "paragraph" | "heading-1" | "heading-2" | "heading-3" | "bullet-list" | "ordered-list" | "task-list" | "quote" | "code-block" | "divider";

interface CommandMenuState {
  anchor: { left: number; top: number };
  query: string;
  range?: { from: number; to: number };
}

export function getNextCommandSelectionIndex({
  currentIndex,
  itemCount,
  key,
}: {
  currentIndex: number;
  itemCount: number;
  key: "ArrowDown" | "ArrowUp" | "Home" | "End";
}) {
  if (itemCount <= 0) return 0;
  if (key === "Home") return 0;
  if (key === "End") return itemCount - 1;
  if (key === "ArrowDown") return Math.min(currentIndex + 1, itemCount - 1);
  return Math.max(currentIndex - 1, 0);
}

const BLOCK_COMMANDS: Array<{
  id: CommandId;
  label: string;
  description: string;
  keywords: string;
  icon: React.ReactNode;
}> = [
  { id: "paragraph", label: "Text", description: "Plain body text", keywords: "paragraph text", icon: <Pilcrow className="size-4" /> },
  { id: "heading-1", label: "Heading 1", description: "Large section heading", keywords: "title h1", icon: <Heading1 className="size-4" /> },
  { id: "heading-2", label: "Heading 2", description: "Medium section heading", keywords: "subtitle h2", icon: <Heading2 className="size-4" /> },
  { id: "heading-3", label: "Heading 3", description: "Small section heading", keywords: "subtitle h3", icon: <Heading3 className="size-4" /> },
  { id: "bullet-list", label: "Bulleted list", description: "Create a simple list", keywords: "unordered bullets", icon: <List className="size-4" /> },
  { id: "ordered-list", label: "Numbered list", description: "Create a numbered list", keywords: "ordered numbers", icon: <ListOrdered className="size-4" /> },
  { id: "task-list", label: "Checklist", description: "Track actionable items", keywords: "todo task checkbox", icon: <CheckSquare className="size-4" /> },
  { id: "quote", label: "Quote", description: "Capture a quotation", keywords: "blockquote", icon: <Quote className="size-4" /> },
  { id: "code-block", label: "Code block", description: "Write preformatted code", keywords: "code pre", icon: <Code2 className="size-4" /> },
  { id: "divider", label: "Divider", description: "Separate sections", keywords: "line rule separator", icon: <Minus className="size-4" /> },
];

export function TiptapDocumentEditor({
  value,
  onChange,
  placeholder = "Add a description…",
  className,
  editorClassName,
  style,
  editorStyle,
  onUploadImage,
  disableImageUpload = false,
  saveOnBlur = false,
  onBlurHtml,
  minHeightClassName = "min-h-[150px]",
  variant = "document",
  onSubmit,
}: TiptapDocumentEditorProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [lineAnchor, setLineAnchor] = useState<{ left: number; top: number } | null>(null);
  const [commandMenu, setCommandMenu] = useState<CommandMenuState | null>(null);
  const [selectedCommand, setSelectedCommand] = useState(0);
  const commandMenuId = useId();
  const latestHtmlRef = useRef(value);
  const uploadRef = useRef(onUploadImage);
  uploadRef.current = onUploadImage;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      Image.configure({ allowBase64: false, inline: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder, showOnlyCurrent: false }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: cn(
          "tiptap-document prose prose-sm max-w-none text-foreground outline-none dark:prose-invert",
          "prose-headings:mb-2 prose-headings:mt-6 prose-p:my-2 prose-p:leading-7 prose-li:my-1",
          "prose-blockquote:border-l-2 prose-blockquote:border-border prose-blockquote:text-muted-foreground",
          minHeightClassName,
          editorClassName,
        ),
      },
      handlePaste: (_view, event) => {
        const image = Array.from(event.clipboardData?.files ?? []).find((file) => file.type.startsWith("image/"));
        if (!image || disableImageUpload || !uploadRef.current) return false;
        event.preventDefault();
        void uploadRef.current(image).then((url) => {
          if (url) editor?.chain().focus().setImage({ src: url, alt: image.name }).run();
        }).catch((error) => logger.error("tiptap.image_paste_failed", { error }));
        return true;
      },
      handleDrop: (_view, event) => {
        const image = Array.from(event.dataTransfer?.files ?? []).find((file) => file.type.startsWith("image/"));
        if (!image || disableImageUpload || !uploadRef.current) return false;
        event.preventDefault();
        void uploadRef.current(image).then((url) => {
          if (url) editor?.chain().focus().setImage({ src: url, alt: image.name }).run();
        }).catch((error) => logger.error("tiptap.image_drop_failed", { error }));
        return true;
      },
    },
    onFocus: ({ editor: activeEditor }) => {
      setIsFocused(true);
      const caret = activeEditor.view.coordsAtPos(activeEditor.state.selection.from);
      setLineAnchor({ left: caret.left - 34, top: caret.top + Math.max(0, (caret.bottom - caret.top - 24) / 2) });
    },
    onSelectionUpdate: ({ editor: activeEditor }) => {
      setCommandMenu((current) => current && !current.range ? null : current);
      const selection = activeEditor.state.selection;
      if (!selection.empty) {
        setLineAnchor(null);
        return;
      }
      const caret = activeEditor.view.coordsAtPos(selection.from);
      setLineAnchor({ left: caret.left - 34, top: caret.top + Math.max(0, (caret.bottom - caret.top - 24) / 2) });
    },
    onBlur: ({ editor: activeEditor }) => {
      setIsFocused(false);
      setCommandMenu(null);
      const html = activeEditor.getHTML();
      latestHtmlRef.current = html;
      onBlurHtml?.(html);
      if (saveOnBlur) onChange(html);
    },
    onUpdate: ({ editor: activeEditor }) => {
      const html = activeEditor.getHTML();
      latestHtmlRef.current = html;
      if (!saveOnBlur) onChange(html);

      const { selection } = activeEditor.state;
      if (!selection.empty) return;
      const { $from } = selection;
      const lineBeforeCaret = $from.parent.textBetween(0, $from.parentOffset, "\n", "\ufffc");
      const slashIndex = lineBeforeCaret.lastIndexOf("/");
      if (slashIndex < 0) {
        setCommandMenu((current) => current?.range ? null : current);
        return;
      }
      const caret = activeEditor.view.coordsAtPos(selection.from);
      setSelectedCommand(0);
      setCommandMenu({
        anchor: { left: caret.left, top: caret.bottom + 6 },
        query: lineBeforeCaret.slice(slashIndex + 1),
        range: { from: $from.start() + slashIndex, to: selection.from },
      });
    },
  });

  useEffect(() => {
    if (!editor || value === latestHtmlRef.current) return;
    latestHtmlRef.current = value;
    editor.commands.setContent(value || "<p></p>", { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    if (!editor) return;
    const frame = requestAnimationFrame(() => {
      const caret = editor.view.coordsAtPos(editor.state.selection.from);
      setLineAnchor({ left: caret.left - 34, top: caret.top + Math.max(0, (caret.bottom - caret.top - 24) / 2) });
    });
    return () => cancelAnimationFrame(frame);
  }, [editor]);

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const href = window.prompt("Paste a link", previous ?? "https://");
    if (href === null) return;
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  const filteredCommands = useMemo(() => {
    const query = commandMenu?.query.trim().toLowerCase() ?? "";
    if (!query) return BLOCK_COMMANDS;
    return BLOCK_COMMANDS.filter((command) => `${command.label} ${command.description} ${command.keywords}`.toLowerCase().includes(query));
  }, [commandMenu?.query]);

  useEffect(() => {
    setSelectedCommand((current) => Math.min(current, Math.max(filteredCommands.length - 1, 0)));
  }, [filteredCommands.length]);

  function runBlockCommand(commandId: CommandId) {
    if (!editor) return;
    let chain = editor.chain().focus();
    if (commandMenu?.range) chain = chain.deleteRange(commandMenu.range);

    switch (commandId) {
      case "paragraph": chain.setParagraph().run(); break;
      case "heading-1": chain.toggleHeading({ level: 1 }).run(); break;
      case "heading-2": chain.toggleHeading({ level: 2 }).run(); break;
      case "heading-3": chain.toggleHeading({ level: 3 }).run(); break;
      case "bullet-list": chain.toggleBulletList().run(); break;
      case "ordered-list": chain.toggleOrderedList().run(); break;
      case "task-list": chain.toggleTaskList().run(); break;
      case "quote": chain.toggleBlockquote().run(); break;
      case "code-block": chain.toggleCodeBlock().run(); break;
      case "divider": chain.setHorizontalRule().run(); break;
    }
    setCommandMenu(null);
  }

  function openCommandMenuFromGutter() {
    if (!editor || !lineAnchor) return;
    const caret = editor.view.coordsAtPos(editor.state.selection.from);
    setSelectedCommand(0);
    setCommandMenu({ anchor: { left: caret.left, top: caret.bottom + 6 }, query: "" });
  }

  if (!editor) return <div className={minHeightClassName} />;

  return (
    <div
      className={cn(
        "relative bg-transparent",
        variant === "card" && "rounded-xl border border-border bg-card px-4 py-3",
        isFocused && variant === "card" && "ring-2 ring-ring/20",
        className,
      )}
      style={style}
      onKeyDownCapture={(event: KeyboardEvent<HTMLDivElement>) => {
        if (commandMenu) {
          const commandNavigationKey = event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End" ? event.key : null;
          if (commandNavigationKey) {
            event.preventDefault();
            setSelectedCommand((current) => getNextCommandSelectionIndex({
              currentIndex: current,
              itemCount: filteredCommands.length,
              key: commandNavigationKey,
            }));
            return;
          }
          if ((event.key === "Enter" || event.key === "Tab") && filteredCommands[selectedCommand]) {
            event.preventDefault();
            runBlockCommand(filteredCommands[selectedCommand].id);
            return;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setCommandMenu(null);
            return;
          }
        }
        if (variant !== "composer" || event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <BubbleMenu
        editor={editor}
        options={{ placement: "top", offset: 8 }}
        className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg"
      >
        <FormatButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="size-3.5" /></FormatButton>
        <FormatButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="size-3.5" /></FormatButton>
        <FormatButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="size-3.5" /></FormatButton>
        <FormatButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="size-3.5" /></FormatButton>
        <span className="mx-1 h-4 w-px bg-border" />
        <FormatButton label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="size-3.5" /></FormatButton>
        <FormatButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="size-3.5" /></FormatButton>
        <FormatButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code2 className="size-3.5" /></FormatButton>
        <FormatButton label="Link" active={editor.isActive("link")} onClick={setLink}><Link2 className="size-3.5" /></FormatButton>
      </BubbleMenu>

      <EditorContent editor={editor} style={editorStyle} />

      {typeof document !== "undefined" && lineAnchor && !commandMenu
        ? createPortal(
            <button
              type="button"
              aria-label="Insert block"
              title="Insert block"
              onMouseDown={(event) => event.preventDefault()}
              onClick={openCommandMenuFromGutter}
              className={cn(
                "fixed z-[100] grid size-6 place-items-center rounded-md border border-transparent transition-colors",
                isFocused
                  ? "text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground"
                  : "text-muted-foreground/55 hover:border-border hover:bg-muted hover:text-foreground",
              )}
              style={{ left: lineAnchor.left, top: lineAnchor.top }}
            >
              <Plus className="size-4" />
            </button>,
            document.body,
          )
        : null}

      {typeof document !== "undefined" && commandMenu
        ? createPortal(
            <div
              role="listbox"
              aria-label="Block commands"
              aria-activedescendant={filteredCommands[selectedCommand] ? `${commandMenuId}-${filteredCommands[selectedCommand].id}` : undefined}
              className="fixed z-[110] w-72 overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-2xl"
              style={{
                left: Math.max(12, Math.min(commandMenu.anchor.left, window.innerWidth - 300)),
                top: Math.max(12, Math.min(commandMenu.anchor.top, window.innerHeight - 380)),
              }}
              onMouseDown={(event) => event.preventDefault()}
            >
              <div className="border-b border-border/70 px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Basic blocks</p>
                {commandMenu.query ? <p className="mt-0.5 truncate text-xs text-muted-foreground">/{commandMenu.query}</p> : null}
              </div>
              <div className="max-h-80 overflow-y-auto p-1.5">
                {filteredCommands.length ? filteredCommands.map((command, index) => (
                  <button
                    key={command.id}
                    id={`${commandMenuId}-${command.id}`}
                    type="button"
                    role="option"
                    aria-selected={index === selectedCommand}
                    onMouseEnter={() => setSelectedCommand(index)}
                    onClick={() => runBlockCommand(command.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
                      index === selectedCommand ? "bg-muted text-foreground" : "hover:bg-muted/70",
                    )}
                  >
                    <span className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">{command.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{command.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{command.description}</span>
                    </span>
                  </button>
                )) : <p className="px-3 py-6 text-center text-sm text-muted-foreground">No matching blocks</p>}
              </div>
            </div>,
            document.body,
          )
        : null}

      <style jsx global>{`
        .tiptap-document {
          color: var(--foreground);
          font-size: 15px;
          line-height: 1.7;
        }
        .tiptap-document > *:first-child { margin-top: 0; }
        .tiptap-document p { margin: 0.45rem 0; }
        .tiptap-document h1 {
          margin: 1.5rem 0 0.65rem;
          font-size: 2rem;
          font-weight: 750;
          line-height: 1.18;
          letter-spacing: -0.035em;
        }
        .tiptap-document h2 {
          margin: 1.3rem 0 0.55rem;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.25;
          letter-spacing: -0.025em;
        }
        .tiptap-document h3 {
          margin: 1.1rem 0 0.45rem;
          font-size: 1.2rem;
          font-weight: 650;
          line-height: 1.35;
        }
        .tiptap-document ul:not([data-type="taskList"]) {
          margin: 0.6rem 0;
          list-style: disc outside;
          padding-left: 1.55rem;
        }
        .tiptap-document ol {
          margin: 0.6rem 0;
          list-style: decimal outside;
          padding-left: 1.65rem;
        }
        .tiptap-document li { margin: 0.2rem 0; padding-left: 0.15rem; }
        .tiptap-document li > p { margin: 0; }
        .tiptap-document blockquote {
          margin: 0.85rem 0;
          border-left: 3px solid var(--border);
          padding: 0.25rem 0 0.25rem 1rem;
          color: var(--muted-foreground);
          font-style: italic;
        }
        .tiptap-document pre {
          margin: 0.85rem 0;
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: 0.65rem;
          background: color-mix(in srgb, var(--muted) 65%, transparent);
          padding: 0.85rem 1rem;
          font-family: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .tiptap-document :not(pre) > code {
          border-radius: 0.3rem;
          background: var(--muted);
          padding: 0.12rem 0.35rem;
          font-family: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 0.88em;
        }
        .tiptap-document hr {
          margin: 1.35rem 0;
          border: 0;
          border-top: 1px solid var(--border);
        }
        .tiptap-document a {
          color: var(--primary);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .tiptap-document strong { font-weight: 700; }
        .tiptap-document em { font-style: italic; }
        .tiptap-document u { text-decoration: underline; text-underline-offset: 2px; }
        .tiptap-document s { text-decoration: line-through; }
        .tiptap-document p.is-editor-empty:first-child::before {
          color: var(--muted-foreground);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          opacity: 0.65;
          pointer-events: none;
        }
        .tiptap-document ul[data-type="taskList"] { margin: 0.6rem 0; list-style: none; padding-left: 0; }
        .tiptap-document ul[data-type="taskList"] li { display: flex; gap: 0.55rem; align-items: flex-start; }
        .tiptap-document ul[data-type="taskList"] li > label { margin-top: 0.35rem; }
        .tiptap-document img { max-height: 640px; border-radius: 0.75rem; border: 1px solid var(--border); }
      `}</style>
    </div>
  );
}
