"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddTokenModal, type TokenOption, type AddTokenModalExtra, type AddTokenModalFlags } from "./add-token-modal";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";

export type { TokenOption, AddTokenModalExtra, AddTokenModalFlags } from "./add-token-modal";

export interface TokenBarProps<T extends TokenOption> {
  items: T[];
  activeItemId?: string | null;
  getItemHref?: (id: string) => string | undefined;
  onItemSelect: (id: string) => void;
  onItemAdd: (item: T) => void;
  onItemRemove?: (id: string) => void;
  onItemsReorder?: (newItems: T[]) => void;
  availableItems: T[];
  categoryLabels?: Record<string, string>;
  addLabel?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  modalTitle?: string;
  showAddDivider?: boolean;
  modalExtra?: AddTokenModalExtra;
  modalFlags?: AddTokenModalFlags;
  onModalFlagsChange?: (flags: AddTokenModalFlags) => void;
  className?: string;
  variant?: "default" | "tabs";
}

export function TokenBar<T extends TokenOption>({
  items,
  activeItemId,
  getItemHref,
  onItemSelect,
  onItemAdd,
  onItemRemove,
  onItemsReorder,
  availableItems,
  categoryLabels,
  addLabel = "Add",
  searchPlaceholder = "Search...",
  emptyMessage = "No items available",
  modalTitle,
  showAddDivider = true,
  modalExtra,
  modalFlags,
  onModalFlagsChange,
  className,
  variant = "default",
}: TokenBarProps<T>) {

  const unusedItems = availableItems.filter(
    (avail) => !items.some((item) => item.id === avail.id),
  );

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination || !onItemsReorder) return;
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    if (startIndex === endIndex) return;

    const newItems = Array.from(items);
    const [removed] = newItems.splice(startIndex, 1);
    newItems.splice(endIndex, 0, removed);
    onItemsReorder(newItems);
  };

  return (
    <>
      <div className={cn("flex items-center", variant === "tabs" ? "gap-5" : "gap-0.5", className)}>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="token-bar-droppable" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn("flex items-center h-full", variant === "tabs" ? "gap-5" : "gap-0.5")}
              >
                {items.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeItemId === item.id;
                  return (
                    <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={!onItemsReorder}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={provided.draggableProps.style}
                          className={cn("relative group/token h-full flex items-center", snapshot.isDragging && "opacity-80 z-50")}
                        >
                          <Link
                            href={getItemHref?.(item.id) ?? "#"}
                            onClick={(e: React.MouseEvent) => { if (!getItemHref?.(item.id)) { e.preventDefault(); onItemSelect(item.id); } }}
                            className={cn(
                              "group inline-flex items-center gap-1.5 transition-all",
                              variant === "default" ? [
                                "rounded-md px-1.5 h-7 text-[12.5px] font-medium border",
                                isActive
                                  ? "bg-background text-foreground border-border/80 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]"
                                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40",
                              ] : [
                                "h-[38px] text-[13px] font-medium border-b-2 relative -mb-px",
                                isActive
                                  ? "text-foreground border-foreground"
                                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-muted-foreground/30",
                              ]
                            )}
                          >
                            {Icon && (
                              <span className={cn("shrink-0 inline-flex", variant === "tabs" && !isActive ? "opacity-70 group-hover:opacity-100" : item.color)}>
                                <Icon className={cn(variant === "tabs" ? "h-4 w-4" : "h-3.5 w-3.5")} strokeWidth={2.25} />
                              </span>
                            )}
                            <span className="truncate">{item.label}</span>
                            {onItemRemove && items.length > 1 && (
                              <span
                                role="button"
                                aria-label={`Remove ${item.label}`}
                                onPointerDown={(e) => e.stopPropagation()} // Prevent drag when clicking remove
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  onItemRemove(item.id);
                                }}
                                className={cn(
                                  "inline-flex items-center justify-center rounded-sm transition-colors",
                                  variant === "default" 
                                    ? "ml-0.5 h-3.5 w-3.5 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-foreground hover:bg-muted-foreground/15"
                                    : "ml-1 h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-foreground hover:bg-muted-foreground/15"
                                )}
                              >
                                <X className={cn(variant === "tabs" ? "h-3 w-3" : "h-2.5 w-2.5")} />
                              </span>
                            )}
                          </Link>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {unusedItems.length > 0 && (
          <>
            {showAddDivider && variant === "default" && (
              <div className="mx-1.5 h-4 w-px bg-border/70" />
            )}
            <AddTokenModal
              onSelect={onItemAdd}
              options={unusedItems}
              categoryLabels={categoryLabels}
              searchPlaceholder={searchPlaceholder}
              emptyMessage={emptyMessage}
              title={modalTitle || addLabel}
              flags={modalFlags}
              extra={modalExtra}
              onFlagsChange={onModalFlagsChange}
              trigger={
                <button
                  className={cn(
                    "inline-flex items-center gap-1 font-medium transition-colors",
                    variant === "default"
                      ? "rounded-md px-1.5 h-7 text-[12.5px] text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      : "h-[38px] text-[13px] text-muted-foreground hover:text-foreground relative -mb-px ml-1"
                  )}
                >
                  <Plus className={cn(variant === "tabs" ? "h-4 w-4" : "h-3.5 w-3.5")} strokeWidth={2.25} />
                  {addLabel}
                </button>
              }
            />
          </>
        )}
      </div>
    </>
  );
}
