"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SpaceNavItemProps {
  name: string;
  icon?: string;
  color?: string;
  isSelected: boolean;
  onClick: () => void;
}

export function SpaceNavItem({ name, icon, color, isSelected, onClick }: SpaceNavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-all",
        isSelected
          ? "bg-accent text-accent-foreground font-semibold"
          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
      )}
    >
      {icon ? (
        <span className="text-base">{icon}</span>
      ) : color ? (
        <span
          className="h-3 w-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
      ) : (
        <span className="h-3 w-3 rounded-full bg-muted shrink-0" />
      )}
      <span className="truncate">{name}</span>
    </button>
  );
}
