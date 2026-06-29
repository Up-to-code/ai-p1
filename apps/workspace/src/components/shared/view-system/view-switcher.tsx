"use client";

import { useState, useCallback } from "react";
import { X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getViewMeta, DEFAULT_VIEW_CATALOG, type ViewType } from "./view-catalog";
import type { ViewSwitcherTabsProps } from "./types";
import { ViewIcon } from "./view-icon";
import { AddViewPopover } from "./add-view-popover";

/**
 * Shareable view-tab switcher.
 *
 * Renders an ordered row of clickable view tabs (Box, Table, Board, etc.)
 * with drag-to-reorder, an optional "Add view" popover, and slots for
 * surrounding toolbar content. Domain-agnostic — used by projects today,
 * and any page that wants the same tab affordance (deals, clients, etc.).
 *
 * State (which views exist, which is active, persistence) is owned by the
 * consumer. The component just renders and emits events.
 */
export function ViewSwitcherTabs({
  views,
  activeViewId,
  onViewChange,
  onReorder,
  onAddView,
  onRemoveView,
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

  return (
    <div className={cn("flex items-center justify-between gap-4 px-4 py-3 border-b border-border", className)}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {leftSlot}
        <div className="flex flex-wrap items-center gap-1.5">
          {views.map((view, index) => {
            const meta = getViewMeta(view.type, catalog);
            const isActive = activeViewId === view.id;
            const isDragging = draggedIndex === index;
            const isDragOver = dragOverIndex === index;
            return (
              <button
                key={view.id}
                draggable={draggable}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                onMouseEnter={() => setHoveredViewId(view.id)}
                onMouseLeave={() => setHoveredViewId((id) => (id === view.id ? null : id))}
                onClick={() => onViewChange(view.id)}
                className={cn(
                  "group relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold transition-all",
                  "border",
                  isActive
                    ? "bg-background text-foreground border-border shadow-sm"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50",
                  isDragging && "opacity-40",
                  isDragOver && "border-l-2 border-primary",
                )}
              >
                {draggable && (
                  <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab" />
                )}
                <ViewIcon type={view.type} catalog={catalog} size={14} />
                <span style={isActive ? { color: meta?.color } : undefined}>
                  {view.label ?? meta?.label ?? view.type}
                </span>
                {onRemoveView && (hoveredViewId === view.id || isActive) && views.length > 1 && (
                  <span
                    role="button"
                    aria-label="Remove view"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveView(view.id);
                    }}
                    className="ml-0.5 inline-flex h-3.5 w-3.5 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted-foreground/20 hover:text-foreground"
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
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
