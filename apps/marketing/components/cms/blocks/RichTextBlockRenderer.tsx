import React from "react";
import { RichTextRenderer } from "../rich-text-renderer";

type RichTextBlockData = {
  content: Record<string, unknown>;
};

type RichTextBlockRendererProps = {
  data: RichTextBlockData;
};

export function RichTextBlockRenderer({ data }: RichTextBlockRendererProps) {
  return (
    <section className="bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="prose prose-lg mx-auto max-w-3xl dark:prose-invert">
          <RichTextRenderer content={data.content} />
        </div>
      </div>
    </section>
  );
}
