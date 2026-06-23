"use client";

import { useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Plus,
  MoreHorizontal,
  FileText,
  Pencil,
  Trash2,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocFolder } from "../docs.types";
import { createDocFolderRequest, renameDocFolderRequest, deleteDocFolderRequest } from "../api/docs";

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

function FolderItem({
  node,
  selectedFolderId,
  onSelectFolder,
  depth,
  organizationId,
  projectId,
}: {
  node: FolderNode;
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  depth: number;
  organizationId?: string;
  projectId?: string;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showActions, setShowActions] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(node.name);
  const isSelected = selectedFolderId === node.id;
  const hasChildren = node.children.length > 0;

  async function handleRename() {
    if (!organizationId || !renameValue.trim()) return;
    await renameDocFolderRequest(organizationId, node.id, renameValue.trim());
    setRenaming(false);
  }

  async function handleDelete() {
    if (!organizationId) return;
    await deleteDocFolderRequest(organizationId, node.id);
    if (isSelected) onSelectFolder(null);
  }

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1.5 px-2 py-1 rounded-lg cursor-pointer transition-colors text-sm",
          isSelected ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted/50",
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelectFolder(isSelected ? null : node.id)}
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
        {renaming ? (
          <input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setRenaming(false);
            }}
            autoFocus
            className="flex-1 bg-transparent text-sm font-medium outline-none border-b border-primary"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="flex-1 truncate text-xs font-medium">{node.name}</span>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="opacity-0 group-hover:opacity-100 flex h-5 w-5 items-center justify-center rounded text-text-muted hover:bg-muted transition-all"
          >
            <MoreHorizontal className="h-3 w-3" />
          </button>
          {showActions && (
            <div className="absolute right-0 top-6 z-50 w-36 rounded-xl border border-border bg-background shadow-lg py-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setRenaming(true);
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-foreground hover:bg-muted transition-colors"
              >
                <Pencil className="h-3 w-3" />
                Rename
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                  setShowActions(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <FolderItem
              key={child.id}
              node={child}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
              depth={depth + 1}
              organizationId={organizationId}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DocFolderTreeProps {
  folders: DocFolder[];
  selectedFolderId: string | null;
  onSelectFolder: (id: string | null) => void;
  organizationId?: string;
  projectId?: string;
}

export function DocFolderTree({
  folders,
  selectedFolderId,
  onSelectFolder,
  organizationId,
  projectId,
}: DocFolderTreeProps) {
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const tree = useMemo(() => buildFolderTree(folders), [folders]);

  async function handleCreateFolder() {
    if (!organizationId || !newFolderName.trim()) return;
    await createDocFolderRequest(organizationId, {
      name: newFolderName.trim(),
      parentId: "",
      projectId: projectId ?? "",
    });
    setNewFolderName("");
    setShowNewFolder(false);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Folders
        </span>
        <button
          type="button"
          onClick={() => setShowNewFolder(true)}
          className="flex h-5 w-5 items-center justify-center rounded text-text-muted hover:bg-muted hover:text-foreground transition-colors"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <div className="flex-1 overflow-auto py-1">
        {/* All docs */}
        <button
          type="button"
          onClick={() => onSelectFolder(null)}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-sm",
            selectedFolderId === null
              ? "bg-primary/10 text-primary"
              : "text-foreground hover:bg-muted/50",
          )}
        >
          <Home className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs font-medium">All Docs</span>
        </button>

        {/* Folder tree */}
        {tree.map((node) => (
          <FolderItem
            key={node.id}
            node={node}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            depth={0}
            organizationId={organizationId}
            projectId={projectId}
          />
        ))}

        {/* New folder input */}
        {showNewFolder && (
          <div className="flex items-center gap-1.5 px-2 py-1" style={{ paddingLeft: "8px" }}>
            <Folder className="h-3.5 w-3.5 shrink-0 text-text-muted" />
            <input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => {
                if (newFolderName.trim()) handleCreateFolder();
                else setShowNewFolder(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") setShowNewFolder(false);
              }}
              autoFocus
              placeholder="Folder name..."
              className="flex-1 bg-transparent text-xs font-medium outline-none placeholder:text-text-muted"
            />
          </div>
        )}
      </div>
    </div>
  );
}
