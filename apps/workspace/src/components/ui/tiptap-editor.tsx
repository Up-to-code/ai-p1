"use client";

import React, { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onUploadImage?: (file: File) => Promise<string | undefined>;
  disableImageUpload?: boolean;
  saveOnBlur?: boolean;
}

export function TiptapEditor({
  value,
  onChange,
  placeholder,
  className,
  onUploadImage,
  disableImageUpload,
  saveOnBlur = false,
}: TiptapEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Image.configure({
        inline: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!saveOnBlur) {
        onChange(editor.getHTML());
      }
    },
    onBlur: ({ editor }) => {
      if (saveOnBlur) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert prose-zinc max-w-none min-h-[150px] p-4 focus:outline-none",
      },
    },
  });

  // Sync external value changes with editor
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const handleImageClick = () => {
    if (onUploadImage) {
      fileInputRef.current?.click();
    } else {
      const url = window.prompt("Enter image URL");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

    try {
      setIsUploading(true);
      const url = await onUploadImage(file);
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    } catch (err) {
      logger.error("tipTap.image_upload_failed", { error: err });
    } finally {
      setIsUploading(false);
      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/50 p-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("rounded-md p-1.5 hover:bg-muted", editor.isActive("bold") && "bg-muted text-foreground")}
        >
          <Bold className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("rounded-md p-1.5 hover:bg-muted", editor.isActive("italic") && "bg-muted text-foreground")}
        >
          <Italic className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("rounded-md p-1.5 hover:bg-muted", editor.isActive("bulletList") && "bg-muted text-foreground")}
        >
          <List className="h-4 w-4 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("rounded-md p-1.5 hover:bg-muted", editor.isActive("orderedList") && "bg-muted text-foreground")}
        >
          <ListOrdered className="h-4 w-4 text-muted-foreground" />
        </button>
        <div className="h-4 w-[1px] bg-border mx-1" />
        {!disableImageUpload && (
          <>
            <button
              type="button"
              onClick={handleImageClick}
              disabled={isUploading}
              className="rounded-md p-1.5 hover:bg-muted disabled:opacity-[0.4]"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </>
        )}
      </div>
      <div className="bg-card">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
