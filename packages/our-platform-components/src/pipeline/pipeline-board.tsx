"use client";

import { useState, useCallback, useRef, useEffect, type ReactNode } from "react";
import Sortable from "sortablejs";
import { Plus, Check, X, MoreHorizontal, Calendar, ListTodo, AtSign, MessageSquare, Eye, Pencil, Trash2 } from "lucide-react";
import { cn } from "@qentrah/platform-core";
import type { CardItem, StageDefinition, CardAction, CardSlotConfig } from "./types";

const STAGE_BADGE_BG: Record<string, string> = {
  "#6b7280": "#f3f4f6",
  "#3b82f6": "#dbeafe",
  "#f59e0b": "#fef3c7",
  "#22c55e": "#dcfce7",
  "#ef4444": "#fee2e2",
  "#a855f7": "#f3e8ff",
  "#ec4899": "#fce7f3",
  "#06b6d4": "#cffafe",
  "#0ea5e9": "#e0f2fe",
};

function badgeBgFor(color: string, dark: boolean): string {
  if (dark) {
    return `${color}26`;
  }
  return STAGE_BADGE_BG[color.toLowerCase()] ?? `${color}1a`;
}

interface MenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  onClick: () => void;
}

function PopoverMenu({ trigger, items, align = "right" }: { trigger: ReactNode; items: MenuItem[]; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <span onClick={() => setOpen((v) => !v)} className="inline-flex">
        {trigger}
      </span>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-full mt-1 z-50 min-w-[160px] rounded-md border border-border/60 bg-popover shadow-lg p-1",
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] rounded-sm text-left transition-colors",
                item.destructive
                  ? "text-destructive hover:bg-destructive/10"
                  : "text-foreground hover:bg-muted",
              )}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
            >
              {item.icon && <span className="shrink-0 w-3.5 h-3.5 flex items-center justify-center">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  inlineCreatePrimaryPlaceholder?: string;
  inlineCreateSecondaryPlaceholder?: string;
  inlineCreatePrimaryLabel?: string;
  onCardMove?: (itemId: string, fromStage: string, toStage: string, targetIndex: number) => void;
  onInlineCreate?: (stageKey: string, data: { name: string; contact?: string }) => void;
  onStageRename?: (stageKey: string, newName: string) => void;
  onStageDelete?: (stageKey: string) => void;
  onCardClick?: (item: CardItem) => void;
  onCardDelete?: (item: CardItem) => void;
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
  onDelete,
}: {
  item: CardItem;
  stage: StageDefinition;
  actions?: CardAction[];
  cardSlots?: CardSlotConfig[];
  cardClassName?: string | ((item: CardItem, stage: StageDefinition) => string);
  onClick?: (item: CardItem) => void;
  onDelete?: (item: CardItem) => void;
}) {
  const headerSlots = cardSlots?.filter((s) => s.position === "header") ?? [];
  const bodySlots = cardSlots?.filter((s) => s.position === "body") ?? [];
  const footerSlots = cardSlots?.filter((s) => s.position === "footer") ?? [];
  const visibleActions = actions?.filter((a) => !a.show || a.show(item)) ?? [];

  const className = typeof cardClassName === "function" ? cardClassName(item, stage) : cardClassName;
  const fallback = item.avatarFallback || item.title.charAt(0).toUpperCase() || "?";

  return (
    <div
      className={cn(
        "group/card relative rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md hover:border-border transition-all duration-150 cursor-pointer overflow-hidden flex flex-col",
        className
      )}
      onClick={() => onClick?.(item)}
    >
      {headerSlots.map((slot) => (
        <div key={slot.position}>{slot.render(item, stage)}</div>
      ))}

      {/* Header: avatar + title + more */}
      <div className="flex items-center justify-between gap-2 px-3.5 pt-3.5 pb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shrink-0"
            style={{ backgroundColor: stage.color }}
            aria-hidden
          >
            {fallback}
          </div>
          <h3 className="text-[13px] font-semibold text-foreground truncate">{item.title}</h3>
        </div>
        <PopoverMenu
          align="right"
          trigger={
            <button
              type="button"
              className="text-muted-foreground/60 hover:text-foreground transition-colors shrink-0 p-0.5 -mr-0.5 inline-flex"
              aria-label="More actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          }
          items={[
            ...(onClick
              ? [
                  {
                    key: "open",
                    label: "Open",
                    icon: <Eye className="w-3.5 h-3.5" />,
                    onClick: () => onClick(item),
                  },
                ]
              : []),
            ...(onDelete
              ? [
                  {
                    key: "delete",
                    label: "Delete",
                    icon: <Trash2 className="w-3.5 h-3.5" />,
                    destructive: true,
                    onClick: () => {
                      if (typeof window !== "undefined" && !window.confirm(`Delete "${item.title}"?`)) return;
                      onDelete(item);
                    },
                  },
                ]
              : []),
          ]}
        />
      </div>

      {/* Tags row */}
      {(item.tags?.length || item.badge) && (
        <div className="flex flex-wrap gap-1 px-3.5 pb-2">
          {item.tags?.map((tag, i) => (
            <span
              key={i}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
              style={{ backgroundColor: tag.bg || `${stage.color}1a`, color: tag.color || stage.color }}
            >
              {tag.label}
            </span>
          ))}
          {!item.tags?.length && item.badge && (
            <span
              className="px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap"
              style={{ backgroundColor: item.badgeColor ?? `${stage.color}1a`, color: item.badgeColor ?? stage.color }}
            >
              {item.badge}
            </span>
          )}
        </div>
      )}

      {/* Meta detail rows */}
      {item.meta && item.meta.length > 0 && (
        <div className="flex flex-col gap-1.5 px-3.5 pb-2">
          {item.meta.map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px] leading-none min-w-0">
              {m.icon && (
                <span className="text-muted-foreground/70 shrink-0 w-3.5 h-3.5 flex items-center justify-center">
                  {m.icon}
                </span>
              )}
              <span className="text-muted-foreground truncate">{m.label}</span>
              {m.value !== undefined && m.value !== "" && (
                <span className="text-foreground font-medium ml-auto truncate max-w-[60%]">{m.value}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {bodySlots.map((slot) => (
        <div key={slot.position}>{slot.render(item, stage)}</div>
      ))}

      <div className="flex-1" />

      {/* Footer: avatars + counters */}
      {(item.avatars?.length || item.commentsCount !== undefined || item.mentionsCount !== undefined) && (
        <div className="flex items-center justify-between px-3.5 py-2 border-t border-border/40">
          <div className="flex -space-x-1.5 items-center">
            {item.avatars?.slice(0, 3).map((avatar, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border-2 border-card bg-muted flex items-center justify-center overflow-hidden shrink-0 text-[9px] font-medium text-muted-foreground"
                title={avatar.name}
              >
                {avatar.src ? (
                  <img src={avatar.src} alt={avatar.fallback} className="w-full h-full object-cover" />
                ) : (
                  avatar.fallback
                )}
              </div>
            ))}
            {!item.avatars?.length && (
              <div className="w-5 h-5 rounded-full border border-dashed border-border/60 shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2.5 text-[11px] font-medium text-muted-foreground/80">
            {item.mentionsCount !== undefined && item.mentionsCount > 0 && (
              <div className="flex items-center gap-1">
                <AtSign className="w-3 h-3" />
                <span>{item.mentionsCount}</span>
              </div>
            )}
            {item.commentsCount !== undefined && item.commentsCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{item.commentsCount}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom action button */}
      {visibleActions.length > 0 ? (
        <div className="flex border-t border-border/50">
          {visibleActions.map((action, i) => (
            <button
              key={action.key}
              type="button"
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[12px] font-medium transition-colors",
                i > 0 && "border-l border-border/50",
                action.variant === "danger"
                  ? "text-destructive hover:bg-destructive/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick(item);
              }}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      ) : onClick ? (
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-t border-border/50"
          onClick={(e) => { e.stopPropagation(); onClick(item); }}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View</span>
        </button>
      ) : null}

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
  primaryPlaceholder = "Title",
  secondaryPlaceholder,
  primaryLabel = "Save",
}: {
  stageColor: string;
  onSave: (data: { name: string; contact?: string }) => void;
  onCancel: () => void;
  primaryPlaceholder?: string;
  secondaryPlaceholder?: string;
  primaryLabel?: string;
}) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const submit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), contact: contact.trim() || undefined });
  };

  return (
    <div className="rounded-lg border-2 p-3 transition-all" style={{ borderColor: stageColor }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={primaryPlaceholder}
        className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground"
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && name.trim()) submit();
          if (e.key === "Escape") onCancel();
        }}
      />
      {secondaryPlaceholder && (
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder={secondaryPlaceholder}
          className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground mt-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) submit();
            if (e.key === "Escape") onCancel();
          }}
        />
      )}
      <div className="flex gap-1 mt-2">
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: stageColor }}
        >
          <Check className="h-3 w-3" /> {primaryLabel}
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
  inlineCreatePrimaryPlaceholder = "Title",
  inlineCreateSecondaryPlaceholder,
  inlineCreatePrimaryLabel = "Save",
  onCardMove,
  onInlineCreate,
  onStageRename,
  onStageDelete,
  onCardClick,
  onCardDelete,
  onAddStage,
  renderEmpty,
}: PipelineBoardProps) {
  const [editingStage, setEditingStage] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [inlineNewStage, setInlineNewStage] = useState<string | null>(null);

  /* ── SortableJS refs ────────────────────────────────────────────────── */
  const columnRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const onCardMoveRef = useRef(onCardMove);
  onCardMoveRef.current = onCardMove;
  const draggableRef = useRef(draggable);
  draggableRef.current = draggable;

  const getColumnRef = useCallback((key: string) => (el: HTMLDivElement | null) => {
    columnRefs.current.set(key, el);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "pipeline-board-sortable-styles";
    style.textContent = `
      .sortable-ghost { opacity: 0.4; background: transparent; }
      .sortable-drag { opacity: 0.8; transform: scale(0.97); }
      .sortable-chosen { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    `;
    document.head.appendChild(style);

    if (!draggableRef.current) return () => style.remove();
    const sortables: Sortable[] = [];

    stages.forEach((stage) => {
      const el = columnRefs.current.get(stage.key);
      if (!el) return;

      const sortable = Sortable.create(el, {
        group: "pipeline-board",
        animation: 150,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
        ghostClass: "sortable-ghost",
        dragClass: "sortable-drag",
        chosenClass: "sortable-chosen",
        dataIdAttr: "data-card-id",
        onEnd: (evt) => {
          const itemId = evt.item.getAttribute("data-card-id");
          if (!itemId) return;

          const fromStage = evt.from.getAttribute("data-stage-key");
          const toStage = evt.to.getAttribute("data-stage-key");

          // CRITICAL: Revert the SortableJS DOM move BEFORE React re-renders.
          // SortableJS physically moved the node; React's virtual DOM still
          // expects it in the original parent. Putting it back prevents the
          // "removeChild: node is not a child of this node" crash.
          if (fromStage !== toStage) {
            // Move the item back to its original column at its original position
            const originalParent = evt.from;
            const siblings = Array.from(originalParent.children);
            const oldIndex = evt.oldIndex ?? 0;
            const refNode = siblings[oldIndex] ?? null;
            originalParent.insertBefore(evt.item, refNode);
          } else {
            // Same-column reorder: also revert and let React re-render
            const parent = evt.from;
            const siblings = Array.from(parent.children);
            const oldIndex = evt.oldIndex ?? 0;
            const refNode = siblings[oldIndex] ?? null;
            parent.insertBefore(evt.item, refNode);
          }

          if (fromStage && toStage && fromStage !== toStage) {
            onCardMoveRef.current?.(itemId, fromStage, toStage, evt.newIndex ?? 0);
          }
        },
      });

      sortables.push(sortable);
    });

    return () => {
      sortables.forEach((s) => s.destroy());
      style.remove();
    };
  }, [stages]);

  return (
    <div className="flex gap-4 px-1 py-1">
      {stages.map((stage) => {
        const stageItems = items.filter((i) => i.stageKey === stage.key);
        const isEditing = editingStage === stage.key;
        const showNewBadge = stage.isNew === true && stage.createdAt !== undefined && (Date.now() - stage.createdAt < 30_000 || stageItems.length === 0);

        return (
          <div
            key={stage.key}
            className={cn(
              "shrink-0 flex flex-col rounded-xl bg-muted/20 border border-border/30 overflow-hidden",
              showNewBadge && "ring-2 ring-emerald-500/40 shadow-md shadow-emerald-500/10"
            )}
            style={{ minWidth: columnWidth }}
          >
            {renderColumnHeader ? (
              renderColumnHeader(stage, stageItems.length)
            ) : (
              <div className="flex flex-col shrink-0">
                {/* Top color bar */}
                {showBarColor && (
                  <div className="h-1 w-full" style={{ backgroundColor: stage.color }} />
                )}
                <div className="flex items-center justify-between px-3.5 pt-3 pb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h2
                      className="text-[13px] font-semibold text-foreground cursor-pointer hover:text-primary transition-colors truncate"
                      onDoubleClick={() => { setEditingStage(stage.key); setEditingName(stage.name); }}
                    >
                      {isEditing ? (
                        <input
                          className="bg-transparent border-b border-primary outline-none w-full font-semibold text-[13px]"
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
                        stage.name
                      )}
                    </h2>
                    {showCount && (
                      <span
                        className="shrink-0 px-1.5 py-0.5 rounded-md text-[10px] font-semibold leading-none"
                        style={{ backgroundColor: badgeBgFor(stage.color, false), color: stage.color }}
                      >
                        {stageItems.length}
                      </span>
                    )}
                    {showNewBadge && (
                      <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider leading-none text-white bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/30 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        New
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 -mr-1"
                    onClick={() => setInlineNewStage(stage.key)}
                    aria-label="Add task"
                    title="Add task"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <PopoverMenu
                    align="right"
                    trigger={
                      <button
                        type="button"
                        className="shrink-0 text-muted-foreground/50 hover:text-foreground transition-colors p-0.5 -mr-1 inline-flex"
                        aria-label="Column options"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    }
                    items={[
                      {
                        key: "rename",
                        label: "Rename column",
                        icon: <Pencil className="w-3.5 h-3.5" />,
                        onClick: () => {
                          setEditingStage(stage.key);
                          setEditingName(stage.name);
                        },
                      },
                      ...(onAddStage
                        ? [
                            {
                              key: "add-stage",
                              label: "Add new stage",
                              icon: <Plus className="w-3.5 h-3.5" />,
                              onClick: () => onAddStage(),
                            },
                          ]
                        : []),
                      ...(onStageDelete
                        ? [
                            {
                              key: "delete",
                              label: "Delete column",
                              icon: <Trash2 className="w-3.5 h-3.5" />,
                              destructive: true,
                              onClick: () => {
                                if (typeof window !== "undefined" && !window.confirm(`Delete column "${stage.name}"?`)) return;
                                onStageDelete(stage.key);
                              },
                            },
                          ]
                        : []),
                    ]}
                  />
                </div>
                {allowInlineCreate && (
                  inlineNewStage === stage.key ? null : (
                    <button
                      className="mx-3.5 mb-2 py-1.5 rounded-md border border-dashed border-border/60 bg-background/40 flex items-center justify-center gap-1.5 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:border-border hover:bg-muted/40 transition-colors"
                      onClick={() => setInlineNewStage(stage.key)}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add task
                    </button>
                  )
                )}
              </div>
            )}

            <div
              ref={getColumnRef(stage.key)}
              data-stage-key={stage.key}
              className="flex flex-col gap-2.5 px-2 pb-2"
            >
              {stageItems.length === 0 && renderEmpty ? (
                renderEmpty(stage)
              ) : (
                stageItems.map((item) => (
                  <div key={item.id} data-card-id={item.id}>
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
                        onDelete={onCardDelete}
                      />
                    )}
                  </div>
                ))
              )}

              {allowInlineCreate && inlineNewStage === stage.key && (
                <InlineNewCard
                  stageColor={stage.color}
                  primaryPlaceholder={inlineCreatePrimaryPlaceholder}
                  secondaryPlaceholder={inlineCreateSecondaryPlaceholder}
                  primaryLabel={inlineCreatePrimaryLabel}
                  onSave={(data) => { onInlineCreate?.(stage.key, data); setInlineNewStage(null); }}
                  onCancel={() => setInlineNewStage(null)}
                />
              )}

              {renderColumnFooter?.(stage)}
            </div>
          </div>
        );
      })}

      {onAddStage && (
        <div className="shrink-0 flex flex-col" style={{ minWidth: columnWidth }}>
          <div className="flex items-center px-1 mb-3">
            <button
              onClick={onAddStage}
              className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors group"
            >
              <div className="flex items-center justify-center w-[18px] h-[18px] rounded-[5px] bg-muted group-hover:bg-muted-foreground/20 transition-colors">
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              </div>
              Add group
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
