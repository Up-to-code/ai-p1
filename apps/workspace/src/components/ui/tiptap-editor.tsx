"use client";

import { useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Bold, Italic, List, ListOrdered, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onUploadImage?: (file: File) => Promise<string | undefined>;
  disableImageUpload?: boolean;
}

export function TiptapEditor({ value, onChange, placeholder, className, onUploadImage, disableImageUpload }: TiptapEditorProps) {
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
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert prose-zinc max-w-none min-h-[150px] p-4 focus:outline-none",
      },
    },
  });

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
      console.error("Image upload failed:", err);
    } finally {
      setIsUploading(false);
      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={cn("overflow-hidden rounded-xl border border-zinc-200/70 bg-white shadow-sm dark:border-white/[0.06] dark:bg-zinc-950", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200/70 bg-zinc-50/50 p-2 dark:border-white/[0.06] dark:bg-white/[0.02]">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn("rounded-md p-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/10", editor.isActive("bold") && "bg-zinc-200/50 dark:bg-white/10 text-zinc-900 dark:text-white")}
        >
          <Bold className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn("rounded-md p-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/10", editor.isActive("italic") && "bg-zinc-200/50 dark:bg-white/10 text-zinc-900 dark:text-white")}
        >
          <Italic className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </button>
        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-white/10 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn("rounded-md p-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/10", editor.isActive("bulletList") && "bg-zinc-200/50 dark:bg-white/10 text-zinc-900 dark:text-white")}
        >
          <List className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn("rounded-md p-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/10", editor.isActive("orderedList") && "bg-zinc-200/50 dark:bg-white/10 text-zinc-900 dark:text-white")}
        >
          <ListOrdered className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
        </button>
        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-white/10 mx-1" />
        {!disableImageUpload && (
          <>
            <button
              type="button"
              onClick={handleImageClick}
              disabled={isUploading}
              className="rounded-md p-1.5 hover:bg-zinc-200/50 dark:hover:bg-white/10 disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin text-zinc-500 dark:text-zinc-400" /> : <ImageIcon className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />}
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
      <div className="bg-white dark:bg-zinc-950">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
