"use client";

import { useMemo } from "react";
import { FileText, Folder, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocRecord, DocFolder } from "../docs.types";

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, "").slice(0, 120);
}

interface DocGridViewProps {
  docs: DocRecord[];
  folders: DocFolder[];
  selectedId?: string;
  onDocClick: (id: string) => void;
  onFolderClick: (id: string) => void;
  showNewFolder?: boolean;
  newFolderName?: string;
  onNewFolderNameChange?: (name: string) => void;
  onCreateFolder?: () => void;
  onCancelNewFolder?: () => void;
}

export function DocGridView({
  docs,
  folders,
  selectedId,
  onDocClick,
  onFolderClick,
  showNewFolder,
  newFolderName,
  onNewFolderNameChange,
  onCreateFolder,
  onCancelNewFolder,
}: DocGridViewProps) {
  const sortedDocs = useMemo(
    () => [...docs].sort((a, b) => b.updatedAt - a.updatedAt),
    [docs],
  );

  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.name.localeCompare(b.name)),
    [folders],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {/* Folder cards */}
      {sortedFolders.map((folder) => (
        <button
          key={`folder-${folder.id}`}
          type="button"
          onClick={() => onFolderClick(folder.id)}
          className="group flex flex-col rounded-xl border border-border p-4 text-left transition-all hover:shadow-md hover:border-primary/30"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
              <Folder className="h-4 w-4 text-primary/70" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {folder.name}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-auto pt-2 text-text-muted">
            <span className="text-[10px] font-medium">Open</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </button>
      ))}

      {/* New folder inline card */}
      {showNewFolder && (
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4">
          <div className="flex items-center gap-2.5">
            <Folder className="h-4 w-4 text-primary/70 shrink-0" />
            <input
              value={newFolderName ?? ""}
              onChange={(e) => onNewFolderNameChange?.(e.target.value)}
              onBlur={() => {
                if (newFolderName?.trim()) onCreateFolder?.();
                else onCancelNewFolder?.();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") onCreateFolder?.();
                if (e.key === "Escape") onCancelNewFolder?.();
              }}
              autoFocus
              placeholder="Folder name..."
              className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-text-muted"
            />
          </div>
        </div>
      )}

      {/* Doc cards */}
      {sortedDocs.map((doc) => (
        <button
          key={doc.id}
          type="button"
          onClick={() => onDocClick(doc.id)}
          className={cn(
            "group flex flex-col rounded-xl border border-border p-4 text-left transition-all hover:shadow-md hover:border-primary/30",
            selectedId === doc.id && "border-primary bg-primary/5",
          )}
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted shrink-0">
              <FileText className="h-4 w-4 text-text-muted" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {doc.title || "Untitled"}
              </h3>
              <p className="text-[10px] text-text-muted mt-0.5">
                {formatDate(doc.updatedAt)}
              </p>
            </div>
          </div>
          {doc.content && (
            <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">
              {stripHtml(doc.content)}
            </p>
          )}
          {(doc.tags ?? []).length > 0 && (
            <div className="flex gap-1 flex-wrap mt-auto pt-3">
              {(doc.tags ?? []).slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
