"use client";

import { useMemo, useState, type ReactNode } from "react";
import { addDays, format, isSameDay, nextSaturday } from "date-fns";
import { CalendarDays, Check, ChevronRight, X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export type WorkspaceDateField = "start" | "due";

export type WorkspaceDatePickerProps = {
  startDate?: Date;
  dueDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onDueDateChange?: (date: Date | undefined) => void;
  fields?: WorkspaceDateField[];
  defaultField?: WorkspaceDateField;
  onSetRecurring?: () => void;
  className?: string;
  disabled?: boolean;
  triggerLabel?: ReactNode;
  includeTime?: boolean;
};

type DatePreset = {
  label: string;
  date: Date;
  hint: string;
};

function buildDatePresets(today: Date): DatePreset[] {
  const weekend = nextSaturday(today);
  return [
    { label: "Today", date: today, hint: format(today, "EEE") },
    { label: "Later", date: today, hint: "Today" },
    {
      label: "Tomorrow",
      date: addDays(today, 1),
      hint: format(addDays(today, 1), "EEE"),
    },
    {
      label: "Next week",
      date: addDays(today, 7),
      hint: format(addDays(today, 7), "EEE"),
    },
    { label: "Next weekend", date: weekend, hint: format(weekend, "EEE") },
    {
      label: "2 weeks",
      date: addDays(today, 14),
      hint: format(addDays(today, 14), "d MMM"),
    },
    {
      label: "4 weeks",
      date: addDays(today, 28),
      hint: format(addDays(today, 28), "d MMM"),
    },
    {
      label: "8 weeks",
      date: addDays(today, 56),
      hint: format(addDays(today, 56), "d MMM"),
    },
  ];
}

export function WorkspaceDatePicker({
  startDate,
  dueDate,
  onStartDateChange,
  onDueDateChange,
  fields = ["start", "due"],
  defaultField = "due",
  onSetRecurring,
  className,
  disabled = false,
  triggerLabel,
  includeTime = false,
}: WorkspaceDatePickerProps) {
  const [activeField, setActiveField] =
    useState<WorkspaceDateField>(defaultField);
  const today = useMemo(() => new Date(), []);
  const presets = useMemo(() => buildDatePresets(today), [today]);
  const selectedDate = activeField === "start" ? startDate : dueDate;

  const selectDate = (date: Date | undefined) => {
    if (activeField === "start") {
      onStartDateChange?.(date);
      if (date && dueDate && date > dueDate) onDueDateChange?.(date);
    } else {
      onDueDateChange?.(date);
      if (date && startDate && date < startDate) onStartDateChange?.(date);
    }
  };

  const visibleFields = fields.length > 0 ? fields : [defaultField];

  const updateTime = (field: WorkspaceDateField, value: string) => {
    const current = field === "start" ? startDate : dueDate;
    const next = current ? new Date(current) : new Date();
    const [hours, minutes] = value.split(":").map(Number);
    next.setHours(hours || 0, minutes || 0, 0, 0);
    if (field === "start") onStartDateChange?.(next);
    else onDueDateChange?.(next);
  };

  return (
    <Popover>
      <PopoverTrigger
        disabled={disabled}
        render={
          <button
            type="button"
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-lg bg-[var(--q-sidebar)] px-3 text-xs font-medium text-foreground transition-colors hover:bg-[var(--q-sidebar-accent)] disabled:pointer-events-none disabled:opacity-50",
              className,
            )}
          >
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            {triggerLabel ??
              (selectedDate ? format(selectedDate, "d MMM yyyy") : "Set date")}
          </button>
        }
      />
      <PopoverContent
        align="start"
        className="w-[620px] max-w-[calc(100vw-24px)] gap-0 overflow-hidden rounded-xl bg-background p-0 shadow-xl ring-1 ring-border/70"
      >
        <div
          className={cn(
            "grid gap-1 bg-[var(--q-sidebar)] p-2",
            visibleFields.length > 1 ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {visibleFields.map((field) => {
            const value = field === "start" ? startDate : dueDate;
            return (
              <button
                key={field}
                type="button"
                onClick={() => setActiveField(field)}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md px-2.5 text-left text-xs transition-colors",
                  activeField === field
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:bg-background/70",
                )}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span className="flex-1">
                  {value
                    ? format(value, "M/d/yy")
                    : field === "start"
                      ? "Start date"
                      : "Due date"}
                </span>
                {includeTime ? (
                  <input
                    type="time"
                    aria-label={`${field === "start" ? "Start" : "Due"} time`}
                    value={value ? format(value, "HH:mm") : ""}
                    onClick={(event) => event.stopPropagation()}
                    onChange={(event) => updateTime(field, event.target.value)}
                    className="h-7 w-20 rounded border-0 bg-transparent px-1 text-[10px] text-muted-foreground outline-none hover:bg-muted"
                  />
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    Add time
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-[1fr_1.35fr]">
          <div className="border-b border-border/60 p-2 md:border-b-0 md:border-r">
            <div className="space-y-0.5">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => selectDate(preset.date)}
                  className="flex h-8 w-full items-center rounded-md px-2 text-left text-xs transition-colors hover:bg-[var(--q-sidebar-accent)]"
                >
                  <span className="flex-1 text-foreground">{preset.label}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {preset.hint}
                  </span>
                  {selectedDate && isSameDay(selectedDate, preset.date) ? (
                    <Check className="ml-2 h-3.5 w-3.5" />
                  ) : null}
                </button>
              ))}
              <button
                type="button"
                onClick={() => selectDate(undefined)}
                className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-xs text-muted-foreground transition-colors hover:bg-[var(--q-sidebar-accent)] hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                No date
              </button>
            </div>
            {onSetRecurring ? (
              <button
                type="button"
                onClick={onSetRecurring}
                className="mt-2 flex h-9 w-full items-center border-t border-border/60 px-2 pt-2 text-left text-xs font-medium text-foreground"
              >
                <span className="flex-1">Set recurring</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            ) : null}
          </div>

          {visibleFields.length > 1 ? (
            <Calendar
              mode="range"
              selected={{ from: startDate, to: dueDate }}
              onDayClick={(date) => selectDate(date)}
              defaultMonth={selectedDate ?? startDate ?? dueDate ?? today}
              className="w-full bg-transparent p-3 [--cell-size:--spacing(8)]"
              classNames={{ root: "w-full", month: "w-full" }}
              buttonVariant="ghost"
            />
          ) : (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={selectDate}
              defaultMonth={selectedDate ?? today}
              className="w-full bg-transparent p-3 [--cell-size:--spacing(8)]"
              classNames={{ root: "w-full", month: "w-full" }}
              buttonVariant="ghost"
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
