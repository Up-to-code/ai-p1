"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "@qentrah/platform-core";

export interface PopoverMenuItem {
  key: string;
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  onClick: () => void;
}

export interface PopoverMenuProps {
  trigger: ReactNode;
  items: PopoverMenuItem[];
  align?: "left" | "right";
  className?: string;
}

export function PopoverMenu({ trigger, items, align = "right", className }: PopoverMenuProps) {
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
    <div ref={ref} className={cn("relative inline-flex", className)}>
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
