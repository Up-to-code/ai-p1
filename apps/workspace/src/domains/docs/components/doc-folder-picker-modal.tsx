"use client";

import { useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Folder,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ModulePanel,
  ModulePanelContent,
  ModulePanelHeader,
  ModulePanelBody,
  ModulePanelFooter,
  ModulePanelCloseButton,
} from "@/components/shared/module-panel";
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
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
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
          </Button>
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
  const [open, setOpen] = useState(true);
  const foldersResult = useDocFoldersQuery(organizationId);
  const tree = useMemo(
    () => buildFolderTree(foldersResult.data ?? []),
    [foldersResult.data],
  );

  function handleClose() {
    setOpen(false);
    onClose();
  }

  return (
    <ModulePanel open={open} onOpenChange={(next) => { if (!next) handleClose(); }} defaultWidth={360} defaultHeight={500}>
      <ModulePanelContent>
        <ModulePanelHeader
          center={<span className="text-sm font-semibold text-foreground">Move to folder</span>}
          right={<ModulePanelCloseButton />}
        />

        {/* Breadcrumb */}
        {selectedFolderId && (
          <div className="border-b border-border px-4 py-2">
            <Button
              type="button"
              variant="link"
              onClick={() => setSelectedFolderId(null)}
              className="text-[10px] font-medium h-auto p-0"
            >
              Root
            </Button>
            <span className="text-[10px] text-text-muted"> / </span>
            <span className="text-[10px] font-medium text-foreground">
              {foldersResult.data?.find((f) => f.id === selectedFolderId)?.name}
            </span>
          </div>
        )}

        {/* Folder tree */}
        <ModulePanelBody className="py-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSelectedFolderId(null)}
            className={cn(
              "flex w-full items-center gap-2 px-3 py-1.5 rounded-lg justify-start h-auto",
              selectedFolderId === null
                ? "bg-primary/10 text-primary"
                : "text-foreground hover:bg-muted/50",
            )}
          >
            <Home className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs font-medium">Root</span>
          </Button>
          {tree.map((node) => (
            <PickerFolderItem
              key={node.id}
              node={node}
              selectedId={selectedFolderId}
              onSelect={setSelectedFolderId}
              depth={0}
            />
          ))}
        </ModulePanelBody>

        <ModulePanelFooter>
          <div />
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleClose} className="h-8 rounded-xl px-3 text-xs">
              Cancel
            </Button>
            <Button
              onClick={() => onSelect(selectedFolderId ?? undefined)}
              className="h-8 rounded-xl px-3 text-xs"
            >
              Move here
            </Button>
          </div>
        </ModulePanelFooter>
      </ModulePanelContent>
    </ModulePanel>
  );
}
