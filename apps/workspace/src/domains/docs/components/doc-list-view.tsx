"use client";

import { useMemo } from "react";
import {
  FileText,
  MoreHorizontal,
  Folder,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocRecord, DocFolder } from "../docs.types";
import { DocRowActions } from "./doc-row-actions";

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

interface DocListViewProps {
  docs: DocRecord[];
  folders: DocFolder[];
  selectedId?: string;
  onDocClick: (id: string) => void;
  onFolderClick: (id: string) => void;
  organizationId?: string;
  showNewFolder?: boolean;
  newFolderName?: string;
  onNewFolderNameChange?: (name: string) => void;
  onCreateFolder?: () => void;
  onCancelNewFolder?: () => void;
}

export function DocListView({
  docs,
  folders,
  selectedId,
  onDocClick,
  onFolderClick,
  organizationId,
  showNewFolder,
  newFolderName,
  onNewFolderNameChange,
  onCreateFolder,
  onCancelNewFolder,
}: DocListViewProps) {
  const sortedDocs = useMemo(
    () => [...docs].sort((a, b) => b.updatedAt - a.updatedAt),
    [docs],
  );

  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.name.localeCompare(b.name)),
    [folders],
  );

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-muted">
              Name
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-muted hidden sm:table-cell">
              Owner
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-muted hidden md:table-cell">
              Tags
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-text-muted hidden lg:table-cell">
              Updated
            </th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody>
          {/* Folder rows */}
          {sortedFolders.map((folder) => (
            <tr
              key={`folder-${folder.id}`}
              onClick={() => onFolderClick(folder.id)}
              className="border-b border-border cursor-pointer transition-colors hover:bg-muted/30"
            >
              <td className="px-4 py-3" colSpan={5}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <Folder className="h-4 w-4 text-primary/70 shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">
                    {folder.name}
                  </span>
                  <ChevronRight className="h-3 w-3 text-text-muted/50 shrink-0" />
                </div>
              </td>
            </tr>
          ))}

          {/* New folder inline input */}
          {showNewFolder && (
            <tr className="border-b border-border bg-muted/20">
              <td className="px-4 py-3" colSpan={5}>
                <div className="flex items-center gap-2.5">
                  <Folder className="h-4 w-4 text-text-muted shrink-0" />
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
              </td>
            </tr>
          )}

          {/* Doc rows */}
          {sortedDocs.map((doc) => (
            <tr
              key={doc.id}
              onClick={() => onDocClick(doc.id)}
              className={cn(
                "border-b border-border last:border-b-0 cursor-pointer transition-colors",
                selectedId === doc.id
                  ? "bg-primary/5"
                  : "hover:bg-muted/30",
              )}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="h-4 w-4 text-text-muted shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">
                    {doc.title || "Untitled"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
                <span className="text-xs text-text-muted">
                  {doc.createdByUserId.slice(0, 8)}
                </span>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="flex gap-1 flex-wrap">
                  {(doc.tags ?? []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-text-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <span className="text-xs text-text-muted">
                  {formatDate(doc.updatedAt)}
                </span>
              </td>
              <td className="px-2 py-3">
                {organizationId && (
                  <DocRowActions
                    doc={doc}
                    organizationId={organizationId}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
