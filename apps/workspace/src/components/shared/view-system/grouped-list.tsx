"use client";

import { useState, useCallback, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Search, User, Plus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CardItem, StageDefinition, CardAction, ListColumn } from "./types";

interface GroupedListProps {
  items: CardItem[];
  stages: StageDefinition[];
  columns?: ListColumn[];
  showSearch?: boolean;
  showCount?: boolean;
  defaultExpanded?: boolean;
  actions?: CardAction[];
  renderGroupHeader?: (stage: StageDefinition, count: number, isExpanded: boolean) => ReactNode;
  renderRow?: (item: CardItem, stage: StageDefinition) => ReactNode;
  renderCell?: (item: CardItem, column: ListColumn, stage: StageDefinition) => ReactNode;
  rowClassName?: string | ((item: CardItem, stage: StageDefinition) => string);
  draggable?: boolean;
  allowInlineCreate?: boolean;
  onItemMove?: (itemId: string, fromGroup: string, toGroup: string, targetIndex: number) => void;
  onInlineCreate?: (groupKey: string, data: Record<string, unknown>) => void;
  onAddGroup?: () => void;
  onRowClick?: (item: CardItem) => void;
  onCellClick?: (item: CardItem, column: ListColumn) => void;
  renderEmpty?: (stage: StageDefinition) => ReactNode;
  renderGroupFooter?: (stage: StageDefinition, items: CardItem[]) => ReactNode;
}

function InlineNewRow({
  columns,
  stageColor,
  onSave,
  onCancel,
}: {
  columns: ListColumn[];
  stageColor: string;
  onSave: (data: Record<string, unknown>) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});

  return (
    <div className="flex items-center gap-0 px-4 py-1.5 bg-muted/30 border-b border-border/30">
      {columns.map((col, i) => (
        <div key={col.key} className="px-2 py-1" style={{ width: col.width ?? "auto", flex: col.width ? undefined : 1 }}>
          {i === 0 ? (
            <input
              autoFocus
              value={values[col.key] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [col.key]: e.target.value }))}
              placeholder={col.label}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter" && values[col.key]?.trim()) {
                  onSave(values);
                }
                if (e.key === "Escape") onCancel();
              }}
            />
          ) : (
            <input
              value={values[col.key] ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, [col.key]: e.target.value }))}
              placeholder={col.label}
              className="w-full bg-transparent text-xs text-muted-foreground outline-none placeholder:text-muted-foreground/50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && values[columns[0]?.key]?.trim()) {
                  onSave(values);
                }
                if (e.key === "Escape") onCancel();
              }}
            />
          )}
        </div>
      ))}
      <div className="flex items-center gap-1 shrink-0 pl-2">
        <button
          onClick={() => values[columns[0]?.key]?.trim() && onSave(values)}
          disabled={!values[columns[0]?.key]?.trim()}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: stageColor }}
        >
          <Check className="h-3 w-3" />
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function DefaultRow({
  item,
  stage,
  columns,
  actions,
  renderCell,
  onClick,
  onCellClick,
  draggable,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  isDragOver,
  isDragging,
}: {
  item: CardItem;
  stage: StageDefinition;
  columns: ListColumn[];
  actions?: CardAction[];
  renderCell?: (item: CardItem, column: ListColumn, stage: StageDefinition) => ReactNode;
  onClick?: (item: CardItem) => void;
  onCellClick?: (item: CardItem, column: ListColumn) => void;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  isDragOver?: boolean;
  isDragging?: boolean;
}) {
  const visibleActions = actions?.filter((a) => !a.show || a.show(item)) ?? [];

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "flex items-center gap-0 px-4 py-2 hover:bg-muted/40 transition-colors cursor-pointer border-b border-border/20 last:border-b-0",
        isDragging && "opacity-40",
        isDragOver && "bg-primary/5"
      )}
    >
      {columns.map((col) => (
        <div
          key={col.key}
          className={cn("px-2 py-0.5 truncate", col.className)}
          style={{ width: col.width ?? "auto", flex: col.width ? undefined : 1, textAlign: col.align }}
          onClick={(e) => {
            e.stopPropagation();
            onCellClick?.(item, col);
          }}
        >
          {renderCell ? (
            renderCell(item, col, stage)
          ) : col.render ? (
            col.render(item, stage)
          ) : col.key === "title" ? (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                {item.avatar ? (
                  <img src={item.avatar} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : item.avatarFallback ? (
                  <span className="text-[10px] font-medium text-muted-foreground">{item.avatarFallback}</span>
                ) : (
                  <User className="h-3 w-3 text-muted-foreground" />
                )}
              </div>
              <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
            </div>
          ) : col.key === "badge" && item.badge ? (
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
            >
              {item.badge}
            </span>
          ) : col.key === "subtitle" && item.subtitle ? (
            <span className="text-xs text-muted-foreground truncate">{item.subtitle}</span>
          ) : col.key === "meta" ? (
            <div className="flex items-center gap-2">
              {item.meta?.slice(0, 3).map((m, i) => (
                <span key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                  {m.icon}
                  {m.value ?? m.label}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground truncate">
              {String(item.data[col.key] ?? "")}
            </span>
          )}
        </div>
      ))}
      {visibleActions.length > 0 && (
        <div className="flex items-center gap-1 shrink-0 pl-2">
          {visibleActions.map((action) => (
            <button
              key={action.key}
              className={cn(
                "transition-colors p-0.5 rounded",
                action.variant === "danger"
                  ? "text-destructive hover:text-destructive/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={action.label}
              onClick={(e) => { e.stopPropagation(); action.onClick(item); }}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupedList({
  items,
  stages,
  columns,
  showSearch = true,
  showCount = true,
  defaultExpanded = true,
  actions,
  renderGroupHeader,
  renderRow,
  renderCell,
  rowClassName,
  draggable = false,
  allowInlineCreate = false,
  onItemMove,
  onInlineCreate,
  onAddGroup,
  onRowClick,
  onCellClick,
  renderEmpty,
  renderGroupFooter,
}: GroupedListProps) {
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    () => new Set(defaultExpanded ? stages.map((s) => s.key) : [])
  );
  const [search, setSearch] = useState("");
  const [inlineGroup, setInlineGroup] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ group: string; index: number } | null>(null);

  const effectiveColumns: ListColumn[] = columns ?? [
    { key: "title", label: "Name", width: "250px" },
    { key: "subtitle", label: "Contact" },
    { key: "meta", label: "Details" },
    { key: "badge", label: "Status", width: "100px" },
  ];

  function toggleStage(key: string) {
    setExpandedStages((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const filtered = search.trim()
    ? items.filter((c) => {
        const q = search.toLowerCase();
        return c.title.toLowerCase().includes(q) || (c.subtitle ?? "").toLowerCase().includes(q);
      })
    : items;

  const handleDrop = useCallback(
    (toGroup: string, groupItems: CardItem[]) => {
      if (!draggedId) return;
      const fromGroup = items.find((i) => i.id === draggedId)?.stageKey ?? "";
      const targetIndex = dragOverIndex?.group === toGroup ? dragOverIndex.index : groupItems.length;
      onItemMove?.(draggedId, fromGroup, toGroup, targetIndex);
      setDraggedId(null);
      setDragOverGroup(null);
      setDragOverIndex(null);
    },
    [draggedId, dragOverIndex, items, onItemMove]
  );

  return (
    <div className="flex flex-col h-full">
      {showSearch && (
        <div className="px-4 mb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-8 rounded-lg border border-border bg-background pl-8 pr-3 text-xs outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>
      )}

      {/* Column Headers */}
      <div className="flex items-center gap-0 px-4 py-1.5 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
        {effectiveColumns.map((col) => (
          <div
            key={col.key}
            className={cn("px-2 truncate", col.className)}
            style={{ width: col.width ?? "auto", flex: col.width ? undefined : 1, textAlign: col.align }}
          >
            {col.label}
          </div>
        ))}
        {actions && actions.length > 0 && <div className="w-10 shrink-0" />}
      </div>

      <div className="flex-1 overflow-y-auto">
        {stages.map((stage) => {
          const stageItems = filtered.filter((i) => i.stageKey === stage.key);
          const isExpanded = expandedStages.has(stage.key);
          const isGroupDragOver = dragOverGroup === stage.key;

          return (
            <div
              key={stage.key}
              onDragOver={(e) => {
                e.preventDefault();
                if (draggable) setDragOverGroup(stage.key);
              }}
              onDragLeave={() => setDragOverGroup(null)}
              onDrop={() => draggable && handleDrop(stage.key, stageItems)}
            >
              {/* Group Header */}
              {renderGroupHeader ? (
                <div onClick={() => toggleStage(stage.key)} className="cursor-pointer">
                  {renderGroupHeader(stage, stageItems.length, isExpanded)}
                </div>
              ) : (
                <button
                  className={cn(
                    "flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-muted/30 transition-colors sticky top-0 bg-background z-10 border-b border-border/30",
                    isGroupDragOver && "bg-primary/5"
                  )}
                  onClick={() => toggleStage(stage.key)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: stage.color }} />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: stage.color }} />
                  )}
                  <span className="text-xs font-semibold" style={{ color: stage.color }}>{stage.name}</span>
                  {showCount && (
                    <span className="text-[11px] text-muted-foreground ml-1">({stageItems.length})</span>
                  )}
                  {allowInlineCreate && !inlineGroup && (
                    <button
                      className="ml-auto flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setInlineGroup(stage.key);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </button>
              )}

              {/* Rows */}
              {isExpanded && (
                <div>
                  {stageItems.length === 0 && !inlineGroup && (
                    renderEmpty ? (
                      renderEmpty(stage)
                    ) : (
                      <div className="px-4 py-3 text-xs text-muted-foreground">No items</div>
                    )
                  )}

                  {stageItems.map((item, index) => {
                    const isDragOverItem = dragOverIndex?.group === stage.key && dragOverIndex.index === index;
                    return renderRow ? (
                      <div
                        key={item.id}
                        className={cn("cursor-pointer hover:bg-muted/40 transition-colors", typeof rowClassName === "function" ? rowClassName(item, stage) : rowClassName)}
                        onClick={() => onRowClick?.(item)}
                      >
                        {renderRow(item, stage)}
                      </div>
                    ) : (
                      <DefaultRow
                        key={item.id}
                        item={item}
                        stage={stage}
                        columns={effectiveColumns}
                        actions={actions}
                        renderCell={renderCell}
                        onClick={onRowClick}
                        onCellClick={onCellClick}
                        draggable={draggable}
                        isDragging={draggedId === item.id}
                        isDragOver={isDragOverItem}
                        onDragStart={() => setDraggedId(item.id)}
                        onDragEnd={() => { setDraggedId(null); setDragOverGroup(null); setDragOverIndex(null); }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedId !== item.id) {
                            setDragOverIndex({ group: stage.key, index });
                            setDragOverGroup(stage.key);
                          }
                        }}
                        onDrop={() => handleDrop(stage.key, stageItems)}
                      />
                    );
                  })}

                  {/* Inline New Row */}
                  {allowInlineCreate && inlineGroup === stage.key && (
                    <InlineNewRow
                      columns={effectiveColumns}
                      stageColor={stage.color}
                      onSave={(data) => { onInlineCreate?.(stage.key, data); setInlineGroup(null); }}
                      onCancel={() => setInlineGroup(null)}
                    />
                  )}

                  {renderGroupFooter?.(stage, stageItems)}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Group */}
        {onAddGroup && (
          <button
            onClick={onAddGroup}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Group
          </button>
        )}
      </div>
    </div>
  );
}
