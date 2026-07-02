"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { forwardRef, type ComponentType } from "react";

export interface SelectorOption<T = string> {
  value: T;
  label: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  disabled?: boolean;
}

interface SelectorProps<T = string> {
  options: SelectorOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

export const Selector = forwardRef<HTMLDivElement, SelectorProps>(
  ({ options, value, onChange, className, orientation = "vertical" }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "grid gap-1",
          orientation === "horizontal" ? "grid-cols-2" : "grid-cols-1",
          className
        )}
      >
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          return (
            <button
              key={String(option.value)}
              type="button"
              onClick={() => !option.disabled && onChange(option.value)}
              disabled={option.disabled}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-border/50 hover:bg-muted/50",
                option.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {Icon && (
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                )}
              </div>
              {isSelected && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  }
);

Selector.displayName = "Selector";
