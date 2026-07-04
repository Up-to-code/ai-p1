"use client";

import type { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface AddMenuItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  className?: string;
}

interface AddMenuProps {
  items: AddMenuItem[];
  triggerLabel?: string;
  className?: string;
  align?: "start" | "end";
}

export function AddMenu({
  items,
  triggerLabel = "Add",
  className,
  align = "end",
}: AddMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className={className ?? "h-9 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm"}>
            {triggerLabel}
          </Button>
        }
      />
      <DropdownMenuContent align={align} className="w-48 rounded-xl border border-border bg-card shadow-xl p-1.5">
        {items.map((item, i) => (
          <DropdownMenuItem
            key={i}
            onClick={item.onClick}
            className={item.className ?? "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer"}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
