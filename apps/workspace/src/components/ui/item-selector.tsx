"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { forwardRef } from "react";

export interface ItemSelectorOption {
  id: string;
  name: string;
  email?: string;
  disabled?: boolean;
}

interface ItemSelectorProps {
  options: ItemSelectorOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
  allowMultiple?: boolean;
  maxSelections?: number;
}

export const ItemSelector = forwardRef<HTMLDivElement, ItemSelectorProps>(
  ({ options, selectedIds, onChange, className, allowMultiple = true, maxSelections }, ref) => {
    const toggleSelection = (id: string) => {
      if (allowMultiple) {
        if (maxSelections && selectedIds.length >= maxSelections && !selectedIds.includes(id)) {
          return; // Max selections reached
        }
        if (selectedIds.includes(id)) {
          onChange(selectedIds.filter((selectedId) => selectedId !== id));
        } else {
          onChange([...selectedIds, id]);
        }
      } else {
        // Single select
        onChange(selectedIds.includes(id) ? [] : [id]);
      }
    };

    const selectAll = () => {
      if (maxSelections) {
        onChange(options.slice(0, maxSelections).map((opt) => opt.id));
      } else {
        onChange(options.map((opt) => opt.id));
      }
    };

    const deselectAll = () => {
      onChange([]);
    };

    const isAllSelected = selectedIds.length === options.length;
    const isSomeSelected = selectedIds.length > 0 && !isAllSelected;

    return (
      <div ref={ref} className={cn("space-y-2", className)}>
        {allowMultiple && options.length > 1 && (
          <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-surface/50 cursor-pointer">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={(e) => (e.target.checked ? selectAll() : deselectAll())}
              className="h-4 w-4 rounded border-border"
            />
            <span className="text-sm font-medium">Select All</span>
          </label>
        )}
        {options.map((option) => {
          const isSelected = selectedIds.includes(option.id);
          return (
            <label
              key={option.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer",
                isSelected
                  ? "border-text-primary bg-text-primary/5"
                  : "border-border hover:border-border/50 hover:bg-surface/50",
                option.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => !option.disabled && toggleSelection(option.id)}
                disabled={option.disabled}
                className="h-4 w-4 rounded border-border"
              />
              <div className="flex-1">
                <span className="text-sm font-medium">{option.name}</span>
                {option.email && <span className="text-xs text-text-muted ml-2">({option.email})</span>}
              </div>
              {isSelected && <Check className="h-4 w-4 text-text-primary flex-shrink-0" />}
            </label>
          );
        })}
      </div>
    );
  }
);

ItemSelector.displayName = "ItemSelector";
