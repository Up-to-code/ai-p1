"use client";

import { useState, useCallback, type ReactNode } from "react";
import { Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ViewDefinition } from "./types";

interface ViewSwitcherTabsProps {
  views: ViewDefinition[];
  activeView: string;
  onViewChange: (viewKey: string) => void;
  onViewReorder?: (views: ViewDefinition[]) => void;
  onAddView?: () => void;
  count?: number;
  toolbarLeft?: ReactNode;
  toolbarRight?: ReactNode;
}

export function ViewSwitcherTabs({
  views,
  activeView,
  onViewChange,
  onViewReorder,
  onAddView,
  count,
  toolbarLeft,
  toolbarRight,
}: ViewSwitcherTabsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  const handleDrop = useCallback((index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const reordered = [...views];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, moved);
    onViewReorder?.(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, views, onViewReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
      <div className="flex items-center gap-1">
        {views.map((view, index) => (
          <button
            key={view.key}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            onClick={() => onViewChange(view.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors group",
              draggedIndex === index && "opacity-40",
              dragOverIndex === index && "border-l-2 border-primary",
              activeView === view.key
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <GripVertical className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab" />
            {view.icon}
            {view.label}
          </button>
        ))}
        {count !== undefined && (
          <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {count}
          </span>
        )}
        {onAddView && (
          <button
            onClick={onAddView}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        {toolbarLeft}
        {toolbarRight}
      </div>
    </div>
  );
}
