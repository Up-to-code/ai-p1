"use client";

import { useEffect, useRef } from "react";
import { YooptaRichTextEditor } from "@/components/shared/yoopta-rich-text-editor";
import { cn } from "@/lib/utils";

interface ProjectDocumentEditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  placeholder?: string;
  className?: string;
}

export function ProjectDocumentEditor({
  value,
  onChange,
  title,
  onTitleChange,
  placeholder = "Start writing...",
  className,
}: ProjectDocumentEditorProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  return (
    <div className={cn("flex h-full flex-col gap-0", className)}>
      <textarea
        ref={titleRef}
        value={title}
        onChange={(e) => {
          onTitleChange(e.target.value);
          autoResize(e.target);
        }}
        placeholder="Untitled"
        rows={1}
        className="mb-3 w-full resize-none overflow-hidden bg-transparent text-xl font-black leading-snug text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
      />

      <YooptaRichTextEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="min-h-0 flex-1 rounded-none border-0 bg-transparent shadow-none"
        editorClassName="px-1 py-2 text-[13.5px] leading-relaxed"
        minHeightClassName="min-h-[240px]"
      />
    </div>
  );
}
