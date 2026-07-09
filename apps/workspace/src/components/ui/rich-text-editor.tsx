"use client";

import { YooptaRichTextEditor } from "@/components/shared/yoopta-rich-text-editor";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  className,
  minHeight = "120px",
}: RichTextEditorProps) {
  return (
    <YooptaRichTextEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      editorClassName="px-4 py-3 text-sm"
      minHeightClassName=""
      style={{ minHeight }}
    />
  );
}
