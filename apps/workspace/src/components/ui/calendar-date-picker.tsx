"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface CalendarDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  endDate?: string;
  onEndDateChange?: (value: string) => void;
  label?: string;
  tooltip?: string;
  error?: string;
  locale?: string;
}

const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function formatDateShort(dateStr: string, locale: string) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  const months = locale === "ar" ? MONTHS_AR : MONTHS_EN;
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export function CalendarDatePicker({
  value,
  onChange,
  endDate,
  onEndDateChange,
  label,
  tooltip,
  error,
  locale = "en",
}: CalendarDatePickerProps) {
  const isAr = locale === "ar";
  const selectedDate = value ? new Date(`${value}T00:00:00`) : undefined;
  const endDateObj = endDate ? new Date(`${endDate}T00:00:00`) : undefined;
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  function formatToISO(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  const calendarContent = (
    <div className="flex flex-col gap-3 p-1">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(day) => {
          if (day) {
            onChange(formatToISO(day));
            setStartOpen(false);
          }
        }}
        defaultMonth={selectedDate}
        locale={isAr ? undefined : undefined}
        classNames={{
          root: "w-fit",
          day: "h-9 w-9 p-0",
        }}
      />
      <div className="flex items-center justify-between border-t border-border px-1 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            const today = new Date();
            onChange(formatToISO(today));
            setStartOpen(false);
          }}
          className="h-7 px-2 text-[10px] font-semibold"
        >
          {isAr ? "اليوم" : "Today"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setStartOpen(false)}
          className="h-7 px-3 text-[10px] font-semibold"
        >
          {isAr ? "تم" : "Done"}
        </Button>
      </div>
    </div>
  );

  const endDateCalendarContent = (
    <div className="flex flex-col gap-3 p-1">
      <Calendar
        mode="single"
        selected={endDateObj}
        onSelect={(day) => {
          if (day) {
            onEndDateChange?.(formatToISO(day));
            setEndOpen(false);
          }
        }}
        defaultMonth={endDateObj ?? selectedDate}
        classNames={{
          root: "w-fit",
          day: "h-9 w-9 p-0",
        }}
      />
      <div className="flex items-center justify-between border-t border-border px-1 pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            onEndDateChange?.("");
            setEndOpen(false);
          }}
          className="h-7 px-2 text-[10px] font-semibold"
        >
          {isAr ? "مسح" : "Clear"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setEndOpen(false)}
          className="h-7 px-3 text-[10px] font-semibold"
        >
          {isAr ? "تم" : "Done"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <Tooltip>
          <TooltipTrigger render={<span className="text-xs font-semibold text-muted-foreground cursor-help" />}>
            {label}
          </TooltipTrigger>
          {tooltip && <TooltipContent side="top">{tooltip}</TooltipContent>}
        </Tooltip>
      )}

      <div className="flex items-center gap-2">
        {/* Start date */}
        <Popover open={startOpen} onOpenChange={setStartOpen}>
          <Tooltip>
            <TooltipTrigger
              render={
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      className={cn(
                        "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors hover:bg-muted/50",
                        startOpen ? "border-foreground/30 bg-card" : value ? "border-border bg-card" : "border-dashed border-border bg-muted/50",
                      )}
                    >
                      <CalendarDays className={cn("h-3.5 w-3.5 shrink-0", value ? "text-muted-foreground" : "text-muted-foreground/60")} />
                      <span className={cn("truncate", value ? "text-foreground" : "text-muted-foreground")}>
                        {value ? formatDateShort(value, locale) : isAr ? "تاريخ البداية" : "Start date"}
                      </span>
                    </button>
                  }
                />
              }
            >
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            </TooltipTrigger>
            <TooltipContent side="top">{isAr ? "اختر تاريخ البداية" : "Select start date"}</TooltipContent>
          </Tooltip>
          <PopoverContent align="start" sideOffset={4} className="w-auto p-0">
            {calendarContent}
          </PopoverContent>
        </Popover>

        {/* Arrow */}
        {onEndDateChange && (
          <span className="text-muted-foreground/40 text-xs">{isAr ? "←" : "→"}</span>
        )}

        {/* End date */}
        {onEndDateChange && (
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        className={cn(
                          "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors hover:bg-muted/50",
                          endOpen ? "border-foreground/30 bg-card" : endDate ? "border-border bg-card" : "border-dashed border-border bg-muted/50",
                        )}
                      >
                        <CalendarDays className={cn("h-3.5 w-3.5 shrink-0", endDate ? "text-muted-foreground" : "text-muted-foreground/60")} />
                        <span className={cn("truncate", endDate ? "text-foreground" : "text-muted-foreground")}>
                          {endDate ? formatDateShort(endDate, locale) : isAr ? "تاريخ النهاية" : "End date"}
                        </span>
                      </button>
                    }
                  />
                }
              >
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="top">{isAr ? "اختر تاريخ النهاية" : "Select end date"}</TooltipContent>
            </Tooltip>
            <PopoverContent align="start" sideOffset={4} className="w-auto p-0">
              {endDateCalendarContent}
            </PopoverContent>
          </Popover>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
