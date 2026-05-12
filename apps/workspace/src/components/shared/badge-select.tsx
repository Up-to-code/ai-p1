"use client";

import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type BadgeTone = "default" | "secondary" | "destructive" | "outline" | "ghost";

export interface BadgeSelectOption<TValue extends string> {
  value: TValue;
  label: string;
  description?: string;
  icon?: LucideIcon;
  badgeVariant?: BadgeTone;
}

export function BadgeSelect<TValue extends string>({
  id,
  label,
  ariaLabel,
  ariaDescribedBy,
  error,
  value,
  options,
  onChange,
  placeholder = "Select",
  className,
  triggerClassName,
  contentClassName,
  disabled,
}: {
  id?: string;
  label?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  error?: string;
  value: TValue;
  options: BadgeSelectOption<TValue>[];
  onChange: (value: TValue) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
}) {
  const selected = options.find((option) => option.value === value);
  const SelectedIcon = selected?.icon;
  const labelId = id && label ? `${id}-label` : undefined;
  const errorId = id && error ? `${id}-error` : undefined;
  const describedBy =
    [ariaDescribedBy, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("block", className)}>
      {label && (
        <span
          id={labelId}
          className="mb-2 block text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-300"
        >
          {label}
        </span>
      )}
      <Select
        value={value}
        onValueChange={(next) => onChange(next as TValue)}
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-label={label ? undefined : ariaLabel}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-11 rounded-xl border-zinc-200 bg-zinc-50/80 px-3 text-xs font-bold shadow-none transition-colors focus:border-zinc-400 focus:bg-white focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:border-white/15 dark:bg-white/7 dark:focus:border-white/30 dark:focus:bg-white/10 dark:focus-visible:ring-white/25",
            error &&
              "border-red-300 focus:border-red-400 dark:border-red-500/60 dark:focus:border-red-400",
            triggerClassName,
          )}
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            {selected ? (
              <Badge
                variant={selected.badgeVariant ?? "outline"}
                className="max-w-full"
              >
                {SelectedIcon && <SelectedIcon className="h-3 w-3" />}
                <span className="truncate">{selected.label}</span>
              </Badge>
            ) : (
              <span className="truncate text-zinc-400">{placeholder}</span>
            )}
          </span>
        </SelectTrigger>
        <SelectContent
          align="start"
          className={cn(
            "rounded-2xl border-zinc-100 p-1 dark:border-white/10",
            contentClassName,
          )}
        >
          {options.map((option) => {
            const Icon = option.icon;
            return (
              <SelectItem
                key={option.value}
                value={option.value}
                className="rounded-xl px-3 py-2.5"
              >
                <div className="flex w-full min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge
                      variant={option.badgeVariant ?? "outline"}
                      className="max-w-[220px]"
                    >
                      {Icon && <Icon className="h-3 w-3" />}
                      <span className="truncate">{option.label}</span>
                    </Badge>
                    {option.description && (
                      <span className="truncate text-[10px] font-bold text-zinc-400">
                        {option.description}
                      </span>
                    )}
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {error && (
        <p
          id={errorId}
          className="mt-2 text-[10px] font-bold text-red-600 dark:text-red-300"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
