"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Blockquote from "@tiptap/extension-blockquote";
import CodeBlock from "@tiptap/extension-code-block";
import Heading from "@tiptap/extension-heading";
import OrderedList from "@tiptap/extension-ordered-list";
import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectDocumentEditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  placeholder?: string;
  className?: string;
}

function ToolbarBtn({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-6 w-6 items-center justify-center rounded-md transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "pointer-events-none opacity-30",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-3.5 w-px shrink-0 bg-border" />;
}

export function ProjectDocumentEditor({
  value,
  onChange,
  title,
  onTitleChange,
  placeholder = "Start writing…",
  className,
}: ProjectDocumentEditorProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);

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
      Placeholder.configure({ placeholder }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert prose-zinc max-w-none focus:outline-none px-1 py-2 text-[13.5px] leading-relaxed text-foreground min-h-[240px]",
      },
    },
  });

  // Sync external value changes (e.g. tab switches)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  // Auto-resize title textarea
  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  if (!editor) return null;

  return (
    <div className={cn("flex flex-col gap-0 h-full", className)}>
      {/* Title */}
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => {
          onTitleChange(e.target.value);
          autoResize(e.target);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            editor.commands.focus("start");
          }
        }}
        placeholder="Untitled"
        rows={1}
        className="w-full resize-none bg-transparent text-xl font-black text-foreground placeholder:text-muted-foreground/40 focus:outline-none overflow-hidden mb-3 leading-snug"
      />

      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap items-center gap-0.5 rounded-xl border border-border bg-muted/40 px-2 py-1.5">
        <ToolbarBtn
          title="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-3 w-3" />
        </ToolbarBtn>
        <ToolbarBtn
          title="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-3 w-3" />
        </ToolbarBtn>

        <ToolbarDivider />

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

        <ToolbarDivider />

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
          title="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive("strike")}
        >
          <Strikethrough className="h-3 w-3" />
        </ToolbarBtn>

        <ToolbarDivider />

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

        <ToolbarDivider />

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

        <ToolbarDivider />

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

        <ToolbarDivider />

        <ToolbarBtn
          title="Divider"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-3 w-3" />
        </ToolbarBtn>
      </div>

      {/* Editor body */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
