import React from "react";

type RichTextRendererProps = {
  content: Record<string, unknown>;
  className?: string;
};

/**
 * Renders Payload Lexical rich text content
 * TODO: Implement full Lexical renderer when needed
 * For now, this is a placeholder that handles basic content
 */
export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  // Temporary simple renderer
  // In production, use @payloadcms/richtext-lexical's renderer or build custom

  if (!content || typeof content !== "object") {
    return null;
  }

  return (
    <div className={className}>
      {/* Placeholder: render content as JSON for now */}
      <pre className="whitespace-pre-wrap text-sm">
        {JSON.stringify(content, null, 2)}
      </pre>
    </div>
  );
}
