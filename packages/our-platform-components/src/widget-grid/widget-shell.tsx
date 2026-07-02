"use client";

import { useState, type ReactNode } from "react";
import {
  GripHorizontal,
  MoreHorizontal,
  Trash2,
  Pencil,
  Maximize2,
  Minimize2,
  Expand,
  LayoutGrid,
} from "lucide-react";
import { PopoverMenu, type PopoverMenuItem } from "../popover-menu";
import type { ActiveWidget } from "./widget-grid";

export interface WidgetShellProps {
  widget: ActiveWidget;
  onRemove: () => void;
  onRename: (title: string) => void;
  onResize: (id: string, dw: number, dh: number) => void;
  children: ReactNode;
}

const SIZE_PRESETS: Array<{ label: string; w: number; h: number; icon: ReactNode }> = [
  { label: "Small", w: 3, h: 2, icon: <LayoutGrid className="h-3 w-3" /> },
  { label: "Medium", w: 6, h: 4, icon: <LayoutGrid className="h-3 w-3" /> },
  { label: "Large", w: 12, h: 6, icon: <LayoutGrid className="h-3 w-3" /> },
];

export function WidgetShell({
  widget,
  onRemove,
  onRename,
  onResize,
  children,
}: WidgetShellProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(widget.title);

  const menuItems: PopoverMenuItem[] = [
    ...SIZE_PRESETS.map((preset) => ({
      key: `size-${preset.label.toLowerCase()}`,
      label: preset.label,
      icon: preset.icon,
      onClick: () => onResize(widget.id, preset.w - widget.w, preset.h - widget.h),
    })),
    {
      key: "rename",
      label: "Rename",
      icon: <Pencil className="h-3 w-3" />,
      onClick: () => setIsRenaming(true),
    },
    {
      key: "remove",
      label: "Remove",
      icon: <Trash2 className="h-3 w-3" />,
      destructive: true,
      onClick: () => onRemove(),
    },
  ];

  return (
    <div className="grid-stack-item-content rounded-2xl border border-border/80 bg-card overflow-hidden flex flex-col">
      <div className="drag-handle p-3 border-b border-border/40 bg-muted/20 flex items-center justify-between cursor-move group/hdr">
        <div className="flex items-center gap-2 min-w-0">
          <GripHorizontal className="h-4 w-4 text-muted-foreground/30 group-hover/hdr:text-muted-foreground transition-colors shrink-0" />
          {isRenaming ? (
            <input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => {
                if (renameValue.trim()) onRename(renameValue.trim());
                setIsRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (renameValue.trim()) onRename(renameValue.trim());
                  setIsRenaming(false);
                }
                if (e.key === "Escape") setIsRenaming(false);
              }}
              autoFocus
              className="text-sm font-bold text-foreground bg-transparent border-b border-primary outline-none w-full"
            />
          ) : (
            <span className="text-sm font-bold text-foreground truncate">{widget.title}</span>
          )}
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onResize(widget.id, -1, 0);
            }}
            className="p-1 text-muted-foreground/40 hover:text-foreground rounded hover:bg-muted/50 transition-colors"
            title="Decrease width"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onResize(widget.id, 1, 0);
            }}
            className="p-1 text-muted-foreground/40 hover:text-foreground rounded hover:bg-muted/50 transition-colors"
            title="Increase width"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onResize(widget.id, 0, 1);
            }}
            className="p-1 text-muted-foreground/40 hover:text-foreground rounded hover:bg-muted/50 transition-colors"
            title="Increase height"
          >
            <Expand className="h-3.5 w-3.5" />
          </button>
          <PopoverMenu
            align="right"
            trigger={
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="p-1 text-muted-foreground/40 hover:text-foreground rounded hover:bg-muted/50 transition-colors"
                aria-label="Widget options"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
            items={menuItems}
          />
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-background">{children}</div>
    </div>
  );
}
