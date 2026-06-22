import React from "react";
import { lexicalToHtml } from "@/lib/lexical-to-html";

type RichTextRendererProps = {
  content: Record<string, unknown>;
  className?: string;
};

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  if (!content || typeof content !== "object") {
    return null;
  }

  const html = lexicalToHtml(content);

  if (!html) {
    return null;
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
