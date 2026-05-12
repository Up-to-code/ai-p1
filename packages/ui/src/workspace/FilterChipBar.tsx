"use client";

import { memo } from "react";
import { cn } from "@anan/platform-core/classnames";

export type FilterChip = {
  key: string;
  label: string;
};

/**
 * WHY:   Projects, offers, and clients all need lightweight visual filtering without falling back to form-heavy controls.
 * WHAT:  Renders a horizontal row of selectable filter chips.
 * HOW:   Delegates the active state to the parent and only emits the selected chip key on click.
 */
const FilterChipBarComponent = function FilterChipBar({
  chips,
  activeKey,
  onChange,
}: {
  chips: FilterChip[];
  activeKey: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => onChange(chip.key)}
          className={cn(
            "relative flex items-center justify-center rounded-xl border border-border bg-card px-5 py-2 text-[11px] font-bold tracking-wide transition-all",
            activeKey === chip.key
              ? "border-foreground bg-foreground text-background shadow-sm"
              : "text-muted-foreground hover:border-foreground/30 hover:bg-muted/20 hover:text-foreground",
          )}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}

export default memo(FilterChipBarComponent);
