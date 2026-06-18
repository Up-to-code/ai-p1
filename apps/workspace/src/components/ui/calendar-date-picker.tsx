"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  endDate?: string;
  onEndDateChange?: (value: string) => void;
  label?: string;
  error?: string;
  locale?: string;
}

const WEEKDAYS_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const WEEKDAYS_AR = ["اث", "ثل", "ار", "خم", "جم", "سب", "حـ"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const MONTHS_FULL_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const MONTHS_FULL_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function formatDateShort(dateStr: string, locale: string) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  const months = locale === "ar" ? MONTHS_AR : MONTHS_EN;
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function formatDateFull(dateStr: string, locale: string) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  const months = locale === "ar" ? MONTHS_FULL_AR : MONTHS_FULL_EN;
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export function CalendarDatePicker({
  value,
  onChange,
  endDate,
  onEndDateChange,
  label,
  error,
  locale = "en",
}: CalendarDatePickerProps) {
  const isAr = locale === "ar";
  const weekdays = isAr ? WEEKDAYS_AR : WEEKDAYS_EN;
  const months = isAr ? MONTHS_FULL_AR : MONTHS_FULL_EN;

  const selectedDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const [viewDate, setViewDate] = useState(selectedDate);
  const [isOpen, setIsOpen] = useState(false);
  const [selectingEnd, setSelectingEnd] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSelectingEnd(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = useMemo(() => {
    const result: Array<{ date: string; day: number; isCurrentMonth: boolean }> = [];
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevDaysInMonth = getDaysInMonth(prevYear, prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevDaysInMonth - i;
      const m = String(prevMonth + 1).padStart(2, "0");
      result.push({ date: `${prevYear}-${m}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const m = String(month + 1).padStart(2, "0");
      result.push({ date: `${year}-${m}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: true });
    }
    const remaining = 42 - result.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    for (let d = 1; d <= remaining; d++) {
      const m = String(nextMonth + 1).padStart(2, "0");
      result.push({ date: `${nextYear}-${m}-${String(d).padStart(2, "0")}`, day: d, isCurrentMonth: false });
    }
    return result;
  }, [year, month, firstDay, daysInMonth]);

  function handleDateClick(date: string) {
    if (selectingEnd && onEndDateChange) {
      onEndDateChange(date);
      setSelectingEnd(false);
      setIsOpen(false);
    } else {
      onChange(date);
      if (!onEndDateChange) {
        setIsOpen(false);
      }
    }
  }

  function isInRange(date: string) {
    if (!value || !endDate) return false;
    return date > value && date < endDate;
  }

  function isRangeStart(date: string) {
    return date === value;
  }

  function isRangeEnd(date: string) {
    return date === endDate;
  }

  return (
    <div className="space-y-1.5" ref={ref}>
      {label && (
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex h-10 w-full items-center gap-2.5 rounded-xl border px-3 text-left text-sm transition-colors hover:bg-muted/50",
            isOpen ? "border-foreground/30 bg-card" : value ? "border-border bg-card" : "border-dashed border-border bg-muted/50",
          )}
        >
          <CalendarDays className={cn("h-4 w-4 shrink-0", value ? "text-muted-foreground" : "text-muted-foreground/60")} />
          <span className={cn("flex-1 truncate", value ? "text-foreground font-medium" : "text-muted-foreground")}>
            {value ? formatDateShort(value, locale) : "Start date"}
          </span>
          {onEndDateChange && (
            <>
              <span className="text-muted-foreground/40">→</span>
              <span className={cn("flex-1 truncate", endDate ? "text-foreground font-medium" : "text-muted-foreground")}>
                {endDate ? formatDateShort(endDate, locale) : "End date"}
              </span>
            </>
          )}
        </button>

        {isOpen && (
          <div className="absolute inset-x-0 top-full z-[200] mt-2 w-[320px] overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            {/* Mode tabs for range selection */}
            {onEndDateChange && (
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setSelectingEnd(false)}
                  className={cn(
                    "flex-1 px-3 py-2.5 text-xs font-semibold transition-colors",
                    !selectingEnd ? "text-foreground bg-muted/50" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  Start
                </button>
                <button
                  type="button"
                  onClick={() => setSelectingEnd(true)}
                  className={cn(
                    "flex-1 px-3 py-2.5 text-xs font-semibold transition-colors",
                    selectingEnd ? "text-foreground bg-muted/50" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  End
                </button>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between px-4 py-2.5">
              <button
                type="button"
                onClick={() => setViewDate(new Date(year, month - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {isAr ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
              </button>
              <span className="text-xs font-semibold text-foreground">
                {months[month]} {year}
              </span>
              <button
                type="button"
                onClick={() => setViewDate(new Date(year, month + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {isAr ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-border/50">
              {weekdays.map((day) => (
                <div key={day} className="py-1.5 text-center text-[10px] font-semibold text-muted-foreground/60">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 p-2">
              {days.map(({ date, day, isCurrentMonth }) => {
                const isSelected = date === value;
                const isEnd = date === endDate;
                const inRange = isInRange(date);
                const isToday = date === todayStr;

                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      "relative flex h-9 w-full items-center justify-center rounded-lg text-sm font-medium transition-all",
                      !isCurrentMonth && "text-muted-foreground/25",
                      isCurrentMonth && !isSelected && !isEnd && !inRange && "text-foreground hover:bg-muted",
                      isSelected && "bg-foreground text-background font-semibold rounded-r-none",
                      isEnd && "bg-foreground text-background font-semibold rounded-l-none",
                      inRange && "bg-foreground/10 text-foreground rounded-none",
                      isToday && !isSelected && !isEnd && "ring-1 ring-foreground/20",
                    )}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2">
              <button
                type="button"
                onClick={() => {
                  const d = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                  onChange(d);
                  setViewDate(today);
                }}
                className="rounded-lg px-2.5 py-1.5 text-[10px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setSelectingEnd(false);
                }}
                className="rounded-lg bg-foreground px-3 py-1.5 text-[10px] font-semibold text-background hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}
