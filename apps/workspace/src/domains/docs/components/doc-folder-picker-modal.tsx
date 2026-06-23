"use client";

import { useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Home,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDocFoldersQuery } from "../api/docs";
import type { DocFolder } from "../docs.types";

interface FolderNode extends DocFolder {
  children: FolderNode[];
}

function buildFolderTree(folders: DocFolder[]): FolderNode[] {
  const map = new Map<string, FolderNode>();
  const roots: FolderNode[] = [];

  for (const folder of folders) {
    map.set(folder.id, { ...folder, children: [] });
  }

  for (const folder of folders) {
    const node = map.get(folder.id)!;
    if (folder.parentId && map.has(folder.parentId)) {
      map.get(folder.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function PickerFolderItem({
  node,
  selectedId,
  onSelect,
  depth,
}: {
  node: FolderNode;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 rounded-lg cursor-pointer transition-colors",
          isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(isSelected ? null : node.id)}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="shrink-0"
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}
        {isSelected ? (
          <FolderOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
        ) : (
          <Folder className="h-3.5 w-3.5 shrink-0 text-text-muted" />
        )}
        <span className="flex-1 truncate text-xs font-medium">{node.name}</span>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <PickerFolderItem
              key={child.id}
              node={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DocFolderPickerModalProps {
  onClose: () => void;
  onSelect: (folderId?: string) => void;
  currentFolderId?: string | null;
  organizationId: string;
}

export function DocFolderPickerModal({
  onClose,
  onSelect,
  currentFolderId,
  organizationId,
}: DocFolderPickerModalProps) {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(
    currentFolderId ?? null,
  );
  const foldersResult = useDocFoldersQuery(organizationId);
  const tree = useMemo(
    () => buildFolderTree(foldersResult.data ?? []),
    [foldersResult.data],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 w-[360px] max-h-[500px] overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">Move to folder</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-text-muted hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Breadcrumb */}
        {selectedFolderId && (
          <div className="border-b border-border px-4 py-2">
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className="text-[10px] font-medium text-primary hover:underline"
            >
              Root
            </button>
            <span className="text-[10px] text-text-muted"> / </span>
            <span className="text-[10px] font-medium text-foreground">
              {foldersResult.data?.find((f) => f.id === selectedFolderId)?.name}
            </span>
          </div>
        )}

        {/* Folder tree */}
        <div className="overflow-auto py-1 max-h-[350px]">
          <button
            type="button"
            onClick={() => setSelectedFolderId(null)}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors",
              selectedFolderId === null
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted/50",
            )}
          >
            <Home className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-medium">Root</span>
          </button>
          {tree.map((node) => (
            <PickerFolderItem
              key={node.id}
              node={node}
              selectedId={selectedFolderId}
              onSelect={setSelectedFolderId}
              depth={0}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={onClose}
            className="h-8 rounded-xl px-3 text-xs font-semibold text-text-muted hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSelect(selectedFolderId ?? undefined)}
            className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-primary px-3 text-xs font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            Move here
          </button>
        </div>
      </div>
    </div>
  );
}
