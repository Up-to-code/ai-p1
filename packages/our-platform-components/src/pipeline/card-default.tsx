"use client";

import { AtSign, MessageSquare, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { cn } from "@qentrah/platform-core";
import { PopoverMenu, type PopoverMenuItem } from "../popover-menu";
import { CardFooterActions } from "./card-footer-actions";
import { truncateCardTitle, truncateMetaValue } from "./utils";
import type { CardItem, CardAction, CardSlotConfig, StageDefinition } from "./types";

export interface CardDefaultProps {
  item: CardItem;
  stage: StageDefinition;
  actions?: CardAction[];
  cardSlots?: CardSlotConfig[];
  cardClassName?: string | ((item: CardItem, stage: StageDefinition) => string);
  onClick?: (item: CardItem) => void;
  onDelete?: (item: CardItem) => void;
}

/**
 * Default card component for pipeline boards.
 * 
 * Architecture:
 * - Fixed-width design (controlled by parent column)
 * - Title truncated to 60 chars max (single line)
 * - Meta values truncated to 30 chars max
 * - Flex layout with proper shrink/grow constraints
 * - All interactive elements properly accessible
 */
export function CardDefault({
  item,
  stage,
  actions,
  cardSlots,
  cardClassName,
  onClick,
  onDelete,
}: CardDefaultProps) {
  const headerSlots = cardSlots?.filter((s) => s.position === "header") ?? [];
  const bodySlots = cardSlots?.filter((s) => s.position === "body") ?? [];
  const footerSlots = cardSlots?.filter((s) => s.position === "footer") ?? [];

  const className = typeof cardClassName === "function" ? cardClassName(item, stage) : cardClassName;
  const fallback = item.avatarFallback || item.title.charAt(0).toUpperCase() || "?";
  
  // Truncate title to prevent multi-line overflow
  const displayTitle = truncateCardTitle(item.title);

  const menuItems: PopoverMenuItem[] = [
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
  ];

  return (
    <div
      className={cn(
        "group/card relative rounded-lg border border-border/60 bg-card shadow-sm hover:shadow-md hover:border-border transition-all duration-150 cursor-pointer flex flex-col max-h-80",
        className
      )}
      onClick={() => onClick?.(item)}
    >
      {/* Custom header slots */}
      {headerSlots.map((slot) => (
        <div key={slot.position} className="shrink-0">
          {slot.render(item, stage)}
        </div>
      ))}

      {/* Card header: avatar + title + menu */}
      <div className="shrink-0 flex items-center justify-between gap-2 px-3.5 pt-3.5 pb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div
            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white"
            style={{ backgroundColor: stage.color }}
            aria-hidden="true"
            title={item.title}
          >
            {fallback}
          </div>
          <h3 
            className="text-[13px] font-semibold text-foreground leading-tight min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
            title={item.title}
          >
            {displayTitle}
          </h3>
        </div>
        {menuItems.length > 0 && (
          <PopoverMenu
            align="right"
            trigger={
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-muted-foreground/60 hover:text-foreground transition-colors p-0.5 -mr-0.5 inline-flex"
                aria-label="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            }
            items={menuItems}
          />
        )}
      </div>

      {/* Tags / Badges */}
      {(item.tags?.length || item.badge) && (
        <div className="shrink-0 flex flex-wrap gap-1 px-3.5 pb-2">
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

      {/* Meta fields */}
      {item.meta && item.meta.length > 0 && (
        <div className="shrink-0 flex flex-col gap-1.5 px-3.5 pb-2">
          {item.meta.slice(0, 3).map((m, i) => (
            <div key={i} className="flex items-center gap-2 text-[12px] leading-none min-w-0">
              {m.icon && (
                <span className="shrink-0 text-muted-foreground/70 w-3.5 h-3.5 flex items-center justify-center">
                  {m.icon}
                </span>
              )}
              <span className="shrink-0 text-muted-foreground">{m.label}</span>
              {m.value !== undefined && m.value !== "" && (
                <span 
                  className="flex-1 text-foreground font-medium text-right min-w-0 overflow-hidden text-ellipsis whitespace-nowrap"
                  title={String(m.value)}
                >
                  {truncateMetaValue(String(m.value))}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom body slots */}
      {bodySlots.map((slot) => (
        <div key={slot.position} className="shrink-0">
          {slot.render(item, stage)}
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-1 min-h-2" />

      {/* Card footer: avatars + counts */}
      {(item.avatars?.length || item.commentsCount !== undefined || item.mentionsCount !== undefined) && (
        <div className="shrink-0 flex items-center justify-between px-3.5 py-2 border-t border-border/40">
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

      {/* Footer actions */}
      <CardFooterActions actions={actions} item={item} onClick={onClick} />

      {/* Custom footer slots */}
      {footerSlots.map((slot) => (
        <div key={slot.position} className="shrink-0">
          {slot.render(item, stage)}
        </div>
      ))}
    </div>
  );
}
