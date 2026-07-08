"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { X, GripVertical, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { getViewMeta, DEFAULT_VIEW_CATALOG, type ViewType } from "./view-catalog";
import type { ViewSwitcherTabsProps } from "./types";
import { ViewIcon } from "./view-icon";
import { AddViewPopover } from "./add-view-popover";

export function ViewSwitcherTabs({
  views,
  activeViewId,
  onViewChange,
  onReorder,
  onAddView,
  onRemoveView,
  onRenameTab,
  onDuplicateTab,
  showAddView = true,
  count,
  leftSlot,
  rightSlot,
  catalog = DEFAULT_VIEW_CATALOG,
  draggable = true,
  className,
}: ViewSwitcherTabsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoveredViewId, setHoveredViewId] = useState<string | null>(null);
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTabId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTabId]);

  const handleDragStart = useCallback((index: number) => {
    if (!draggable) return;
    setDraggedIndex(index);
  }, [draggable]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    if (!draggable) return;
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggable, draggedIndex]);

  const handleDrop = useCallback((index: number) => {
    if (!draggable || draggedIndex === null || draggedIndex === index || !onReorder) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...views];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, moved);
    onReorder(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggable, draggedIndex, views, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleAddView = useCallback((type: ViewType) => {
    onAddView?.(type);
  }, [onAddView]);

  const startEditing = useCallback((viewId: string, currentLabel: string) => {
    setEditingTabId(viewId);
    setEditValue(currentLabel);
  }, []);

  const commitEditing = useCallback(() => {
    if (editingTabId && onRenameTab && editValue.trim()) {
      onRenameTab(editingTabId, editValue.trim());
    }
    setEditingTabId(null);
    setEditValue("");
  }, [editingTabId, onRenameTab, editValue]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        commitEditing();
      } else if (e.key === "Escape") {
        setEditingTabId(null);
        setEditValue("");
      }
    },
    [commitEditing],
  );

  return (
    <div className={cn("flex h-10 items-center justify-between gap-4 border-b border-border px-3", className)}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {leftSlot}
        <div className="flex h-full flex-wrap items-center gap-0.5">
          {views.map((view, index) => {
            const meta = getViewMeta(view.type, catalog);
            const isActive = activeViewId === view.id;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            const isEditing = editingTabId === view.id;
            const displayLabel = view.label ?? meta?.label ?? view.type;

            return (
              <button
                key={view.id}
                draggable={draggable && !isEditing}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                onMouseEnter={() => setHoveredViewId(view.id)}
                onMouseLeave={() => setHoveredViewId((id) => (id === view.id ? null : id))}
                onClick={() => {
                  if (!isEditing) onViewChange(view.id);
                }}
                onDoubleClick={() => {
                  if (onRenameTab) startEditing(view.id, displayLabel);
                }}
                className={cn(
                  "group relative inline-flex h-full items-center gap-1.5 border-b-2 px-2.5 text-[11px] font-semibold transition-colors",
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                  isDragging && "opacity-40",
                  isDragOver && "bg-muted/30",
                )}
              >
                {draggable && (
                  <GripVertical className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50 cursor-grab" />
                )}
                <ViewIcon type={view.type} catalog={catalog} size={14} />
                {isEditing ? (
                  <input
                    ref={editInputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={commitEditing}
                    onKeyDown={handleEditKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    className="w-20 bg-transparent text-xs font-bold text-foreground outline-none border-b border-foreground/30"
                  />
                ) : (
                  <span>
                    {displayLabel}
                  </span>
                )}
                {onRemoveView && !isEditing && (hoveredViewId === view.id || isActive) && views.length > 1 && (
                  <span
                    role="button"
                    aria-label="Remove view"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      onRemoveView(view.id);
                    }}
                    className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
                )}
                {(onRenameTab || onDuplicateTab) && !isEditing && hoveredViewId === view.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <span
                        role="button"
                        aria-label="Tab options"
                        onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
                      >
                        <MoreHorizontal className="h-2.5 w-2.5" />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" sideOffset={4}>
                      {onRenameTab && (
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            startEditing(view.id, displayLabel);
                          }}
                        >
                          Rename
                        </DropdownMenuItem>
                      )}
                      {onDuplicateTab && (
                        <DropdownMenuItem
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onDuplicateTab(view.id);
                          }}
                        >
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onRenameTab && onDuplicateTab && <DropdownMenuSeparator />}
                      {onRemoveView && views.length > 1 && (
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            onRemoveView(view.id);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </button>
            );
          })}
          {count !== undefined && (
            <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              {count}
            </span>
          )}
          {showAddView && onAddView && (
            <div className="ml-1 pl-2 border-l border-border/80">
              <AddViewPopover catalog={catalog} onSelect={handleAddView} />
            </div>
          )}
        </div>
      </div>
      {rightSlot && <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>}
    </div>
  );
}
