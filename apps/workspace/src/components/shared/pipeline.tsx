"use client";

import { useMemo, useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

export interface PipelineColumn<T> {
  id: string;
  label: string;
  items: T[];
  dotColor?: string;
  bgColor?: string;
}

export interface PipelineCardProps<T> {
  item: T;
  columnId: string;
  index: number;
  isSelected?: boolean;
  onClick?: (item: T) => void;
}

export interface PipelineProps<T> {
  /** Columns to display */
  columns: PipelineColumn<T>[];
  /** Custom card renderer */
  renderCard: (props: PipelineCardProps<T>) => React.ReactNode;
  /** Callback when item is dropped */
  onDrop?: (itemId: string, targetColumnId: string, targetIndex: number) => void;
  /** Callback when item is clicked */
  onItemClick?: (item: T) => void;
  /** Currently selected item ID */
  selectedItemId?: string;
  /** Function to get item ID from item */
  getItemId: (item: T) => string;
  /** Whether to show empty state */
  showEmptyState?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** Column width */
  columnWidth?: string;
}

export function Pipeline<T>({
  columns,
  renderCard,
  onDrop,
  onItemClick,
  selectedItemId,
  getItemId,
  showEmptyState = true,
  emptyMessage = "No items",
  className,
  columnWidth = "300px",
}: PipelineProps<T>) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    onDrop?.(draggableId, destination.droppableId, destination.index);
  };

  if (!mounted) return null; // Avoid hydration mismatch with DND

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className={cn("flex min-h-[480px] gap-4 items-start", className)}>
        {columns.map((column) => (
          <div
            key={column.id}
            className={cn(
              "flex shrink-0 flex-col rounded-2xl border border-border",
              column.bgColor || "bg-card",
            )}
            style={{ width: columnWidth }}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                {column.dotColor && (
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shrink-0",
                      column.dotColor,
                    )}
                  />
                )}
                <span className="text-xs font-black uppercase tracking-widest text-foreground">
                  {column.label}
                </span>
              </div>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-black text-muted-foreground">
                {column.items.length}
              </span>
            </div>

            {/* Cards Droppable Area */}
            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "flex flex-1 flex-col gap-2 p-2 min-h-[150px] transition-colors rounded-b-2xl",
                    snapshot.isDraggingOver && "bg-muted/50",
                  )}
                >
                  {column.items.map((item, index) => (
                    <Draggable
                      key={getItemId(item)}
                      draggableId={getItemId(item)}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onItemClick?.(item)}
                          className={cn(
                            "transition-opacity",
                            snapshot.isDragging && "opacity-90",
                          )}
                        >
                          {renderCard({
                            item,
                            columnId: column.id,
                            index,
                            isSelected: selectedItemId === getItemId(item),
                            onClick: onItemClick,
                          })}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {showEmptyState && column.items.length === 0 && !snapshot.isDraggingOver && (
                    <div className="flex h-20 items-center justify-center text-[11px] font-medium text-muted-foreground/50">
                      {emptyMessage}
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
