"use client";

import { Eye } from "lucide-react";
import { cn } from "@qentrah/platform-core";
import type { CardAction } from "./types";

export interface CardFooterActionsProps {
  actions: CardAction[] | undefined;
  item: import("./types").CardItem;
  onClick?: (item: import("./types").CardItem) => void;
}

export function CardFooterActions({ actions, item, onClick }: CardFooterActionsProps) {
  const visibleActions = actions?.filter((a) => !a.show || a.show(item)) ?? [];

  if (visibleActions.length > 0) {
    return (
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
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        className="flex items-center justify-center gap-1.5 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors border-t border-border/50"
        onClick={(e) => { e.stopPropagation(); onClick(item); }}
      >
        <Eye className="w-3.5 h-3.5" />
        <span>View</span>
      </button>
    );
  }

  return null;
}
