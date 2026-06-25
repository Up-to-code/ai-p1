"use client";

import { useState, useCallback, type ReactNode } from "react";
import { Plus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineViewConfig, CardItem, StageDefinition, CardAction, CardSlotConfig } from "./types";

interface PipelineBoardProps {
  items: CardItem[];
  stages: StageDefinition[];
  columnWidth?: number;
  showBarColor?: boolean;
  showCount?: boolean;
  actions?: CardAction[];
  cardSlots?: CardSlotConfig[];
  cardClassName?: string | ((item: CardItem, stage: StageDefinition) => string);
  renderColumnHeader?: (stage: StageDefinition, count: number) => ReactNode;
  renderCard?: (item: CardItem, stage: StageDefinition) => ReactNode;
  renderColumnFooter?: (stage: StageDefinition) => ReactNode;
  draggable?: boolean;
  allowInlineCreate?: boolean;
  onCardMove?: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
  onInlineCreate?: (stageKey: string, data: { name: string; contact?: string }) => void;
  onStageRename?: (stageKey: string, newName: string) => void;
  onCardClick?: (item: CardItem) => void;
  onAddStage?: () => void;
  renderEmpty?: (stage: StageDefinition) => ReactNode;
}

function DefaultCard({
  item,
  stage,
  actions,
  cardSlots,
  cardClassName,
  onClick,
}: {
  item: CardItem;
  stage: StageDefinition;
  actions?: CardAction[];
  cardSlots?: CardSlotConfig[];
  cardClassName?: string | ((item: CardItem, stage: StageDefinition) => string);
  onClick?: (item: CardItem) => void;
}) {
  const headerSlots = cardSlots?.filter((s) => s.position === "header") ?? [];
  const bodySlots = cardSlots?.filter((s) => s.position === "body") ?? [];
  const footerSlots = cardSlots?.filter((s) => s.position === "footer") ?? [];
  const visibleActions = actions?.filter((a) => !a.show || a.show(item)) ?? [];

  const className = typeof cardClassName === "function" ? cardClassName(item, stage) : cardClassName;

  return (
    <div
      className={cn(
        "rounded-lg border border-border/50 bg-card p-3 cursor-pointer transition-all duration-200 hover:border-primary/30",
        className
      )}
      onClick={() => onClick?.(item)}
    >
      {headerSlots.map((slot) => (
        <div key={slot.position}>{slot.render(item, stage)}</div>
      ))}

      <div className="text-sm font-medium text-foreground truncate">{item.title}</div>

      {item.badge && (
        <span
          className="inline-block rounded text-[10px] font-medium px-1.5 py-0.5 mt-1.5"
          style={{ backgroundColor: item.badgeColor ?? `${stage.color}20`, color: item.badgeColor ?? stage.color }}
        >
          {item.badge}
        </span>
      )}

      {item.subtitle && (
        <div className="text-xs text-muted-foreground mt-1.5 truncate">{item.subtitle}</div>
      )}

      {item.meta && item.meta.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          {item.meta.map((m, i) => (
            <div key={i} className="flex items-center gap-1 text-[11px] text-muted-foreground/70 truncate">
              {m.icon}
              <span className="truncate">{m.value ?? m.label}</span>
            </div>
          ))}
        </div>
      )}

      {bodySlots.map((slot) => (
        <div key={slot.position}>{slot.render(item, stage)}</div>
      ))}

      {visibleActions.length > 0 && (
        <div className="flex gap-2 mt-2.5 pt-2.5 border-t border-border/50">
          {visibleActions.map((action) => (
            <button
              key={action.key}
              className={cn(
                "transition-colors",
                action.variant === "danger"
                  ? "text-destructive hover:text-destructive/80"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={action.label}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(item);
              }}
            >
              {action.icon}
            </button>
          ))}
        </div>
      )}

      {footerSlots.map((slot) => (
        <div key={slot.position}>{slot.render(item, stage)}</div>
      ))}
    </div>
  );
}

function InlineNewCard({
  stageColor,
  onSave,
  onCancel,
}: {
  stageColor: string;
  onSave: (data: { name: string; contact?: string }) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  return (
    <div className="rounded-lg border-2 p-3 transition-all" style={{ borderColor: stageColor }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Client name"
        className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) onSave({ name: name.trim(), contact: contact.trim() || undefined });
          if (e.key === "Escape") onCancel();
        }}
      />
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="Email or phone"
        className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground mt-1"
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) onSave({ name: name.trim(), contact: contact.trim() || undefined });
          if (e.key === "Escape") onCancel();
        }}
      />
      <div className="flex gap-1 mt-2">
        <button
          onClick={() => name.trim() && onSave({ name: name.trim(), contact: contact.trim() || undefined })}
          disabled={!name.trim()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: stageColor }}
        >
          <Check className="h-3 w-3" /> Save
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-3 w-3" /> Cancel
        </button>
      </div>
    </div>
  );
}

export function PipelineBoard({
  items,
  stages,
  columnWidth = 280,
  showBarColor = true,
  showCount = true,
  actions,
  cardSlots,
  cardClassName,
  renderColumnHeader,
  renderCard,
  renderColumnFooter,
  draggable = true,
  allowInlineCreate = false,
  onCardMove,
  onInlineCreate,
  onStageRename,
  onCardClick,
  onAddStage,
  renderEmpty,
}: PipelineBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<{ stage: string; index: number } | null>(null);
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [inlineNewStage, setInlineNewStage] = useState<string | null>(null);

  const handleDrop = useCallback(
    (stageKey: string, stageItems: CardItem[]) => {
      if (!draggedId) return;
      const fromStage = items.find((i) => i.id === draggedId)?.stageKey ?? "";
      const targetIndex = dragOverIndex?.stage === stageKey ? dragOverIndex.index : stageItems.length;
      onCardMove?.(draggedId, fromStage, stageKey, targetIndex);
      setDraggedId(null);
      setDragOverStage(null);
      setDragOverIndex(null);
    },
    [draggedId, dragOverIndex, items, onCardMove]
  );

  return (
    <div className="flex gap-3 w-full h-full flex-1 overflow-x-auto">
      {stages.map((stage) => {
        const stageItems = items.filter((i) => i.stageKey === stage.key);
        const isDragOver = dragOverStage === stage.key;
        const isEditing = editingStage === stage.key;

        return (
          <div
            key={stage.key}
            className="shrink-0 flex flex-col h-full"
            style={{ width: columnWidth }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOverStage !== stage.key) setDragOverStage(stage.key);
            }}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={() => handleDrop(stage.key, stageItems)}
          >
            {/* Column Header */}
            {renderColumnHeader ? (
              renderColumnHeader(stage, stageItems.length)
            ) : (
              <div className="flex items-center justify-between px-1 py-1.5 shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  {isEditing ? (
                    <input
                      className="text-xs font-medium text-muted-foreground bg-transparent border-b border-primary outline-none w-full"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      autoFocus
                      onBlur={() => {
                        if (editingName.trim()) onStageRename?.(stage.key, editingName.trim());
                        setEditingStage(null);
                        setEditingName("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        if (e.key === "Escape") { setEditingStage(null); setEditingName(""); }
                      }}
                    />
                  ) : (
                    <h2
                      className="text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors truncate"
                      onDoubleClick={() => { setEditingStage(stage.key); setEditingName(stage.name); }}
                    >
                      {stage.name}
                    </h2>
                  )}
                  {showCount && (
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground border border-border/50">
                      {stageItems.length}
                    </span>
                  )}
                </div>
                {allowInlineCreate && (
                  inlineNewStage === stage.key ? null : (
                    <button
                      className="shrink-0 flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      onClick={() => setInlineNewStage(stage.key)}
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  )
                )}
              </div>
            )}

            {/* Bar Color */}
            {showBarColor && <div className="h-[3px] rounded-sm mb-2 shrink-0" style={{ backgroundColor: stage.color }} />}

            {/* Cards */}
            <div className="flex flex-col gap-2 overflow-y-auto min-h-0 flex-1">
              {stageItems.length === 0 && renderEmpty ? (
                renderEmpty(stage)
              ) : (
                stageItems.map((item, index) => {
                  const isDragOverItem = dragOverIndex?.stage === stage.key && dragOverIndex.index === index;
                  return (
                    <div
                      key={item.id}
                      draggable={draggable}
                      onDragStart={(e) => {
                        setDraggedId(item.id);
                        e.dataTransfer.setData("cardId", item.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => { setDraggedId(null); setDragOverStage(null); setDragOverIndex(null); }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (draggedId !== item.id) {
                          setDragOverIndex({ stage: stage.key, index });
                          setDragOverStage(stage.key);
                        }
                      }}
                      className={cn(
                        draggedId === item.id && "opacity-40",
                        isDragOverItem && "relative before:absolute before:top-1 before:left-0 before:right-0 before:h-0.5 before:bg-primary/40 before:rounded-full",
                        isDragOver && "border-primary/30"
                      )}
                    >
                      {renderCard ? (
                        renderCard(item, stage)
                      ) : (
                        <DefaultCard
                          item={item}
                          stage={stage}
                          actions={actions}
                          cardSlots={cardSlots}
                          cardClassName={cardClassName}
                          onClick={onCardClick}
                        />
                      )}
                    </div>
                  );
                })
              )}

              {/* Inline New Card Form */}
              {allowInlineCreate && inlineNewStage === stage.key && (
                <InlineNewCard
                  stageColor={stage.color}
                  onSave={(data) => { onInlineCreate?.(stage.key, data); setInlineNewStage(null); }}
                  onCancel={() => setInlineNewStage(null)}
                />
              )}

              {renderColumnFooter?.(stage)}
            </div>
          </div>
        );
      })}

      {/* Add Stage Column */}
      {onAddStage && (
        <button
          onClick={onAddStage}
          className="shrink-0 flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border/50 transition-all hover:border-border hover:bg-muted/50"
          style={{ width: columnWidth, minHeight: 120 }}
        >
          <Plus className="h-4 w-4 text-muted-foreground" />
          <span className="text-[11px] font-medium text-muted-foreground">Add Stage</span>
        </button>
      )}
    </div>
  );
}
