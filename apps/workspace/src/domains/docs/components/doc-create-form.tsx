"use client";

import { useState } from "react";
import { FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DOC_TEMPLATE_TYPES, DOC_TEMPLATE_CONTENT } from "../docs.constants";

interface DocCreateFormProps {
  onClose: () => void;
  onSubmit: (title: string, templateId?: string) => void;
  folderId?: string | null;
}

export function DocCreateForm({ onClose, onSubmit }: DocCreateFormProps) {
  const [title, setTitle] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank");

  function handleSubmit() {
    if (!title.trim()) return;
    onSubmit(title.trim(), selectedTemplate);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 w-[480px] max-h-[80vh] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">New Document</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Title input */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder="Document title..."
              autoFocus
              className="w-full h-9 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground outline-none focus:ring-2 focus:ring-ring/20 placeholder:text-text-muted"
            />
          </div>

          {/* Template picker */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Start from template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DOC_TEMPLATE_TYPES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all",
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/30",
                  )}
                >
                  <FileText className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-xs font-medium text-foreground">
                    {template.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-xl px-3 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
