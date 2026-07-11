"use client";

import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { EventTypeDot } from "@/components/ui/event-badge";
import { cn } from "@/lib/utils";
import {
  calendarEventsForDate,
  calendarEventsForTimeSlot,
  calendarIsoDate,
  calendarWeekdayLabels,
  formatCalendarTimeLabel,
  generateCalendarTimeSlots,
  getCalendarMonthDays,
  getCalendarWeekDays,
  type CalendarView,
} from "../calendar-view-model";
import type { CalendarEvent } from "../store/calendar.types";

type CalendarGridProps = {
  currentDate: Date;
  events: CalendarEvent[];
  locale: string;
  view: CalendarView;
  onCreate: (start: Date, end: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
};

const visibleTimeSlots = generateCalendarTimeSlots();

export function CalendarGrid({
  currentDate,
  events,
  locale,
  view,
  onCreate,
  onEventClick,
}: CalendarGridProps) {
  if (view === "month") {
    return (
      <MonthCalendarGrid
        currentDate={currentDate}
        events={events}
        locale={locale}
        onCreate={onCreate}
        onEventClick={onEventClick}
      />
    );
  }

  const days = view === "day" ? [currentDate] : getCalendarWeekDays(currentDate);
  return (
    <TimeCalendarGrid
      days={days}
      events={events}
      locale={locale}
      onCreate={onCreate}
      onEventClick={onEventClick}
    />
  );
}

function MonthCalendarGrid({
  currentDate,
  events,
  locale,
  onCreate,
  onEventClick,
}: Omit<CalendarGridProps, "view">) {
  const days = getCalendarMonthDays(currentDate);
  const today = calendarIsoDate(new Date());

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-background">
      <div className="sticky top-0 z-10 grid grid-cols-7 border-b border-border bg-background">
        {calendarWeekdayLabels(locale).map((label) => (
          <div key={label} className="px-2 py-2 text-center text-xs font-medium text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      <div className="grid min-h-[720px] flex-1 grid-cols-7 auto-rows-fr">
        {days.map((day) => {
          const dayEvents = calendarEventsForDate(events, day);
          const dayKey = calendarIsoDate(day);
          const outsideMonth = day.getMonth() !== currentDate.getMonth();
          return (
            <div
              key={dayKey}
              className={cn(
                "group min-h-28 border-b border-e border-border p-1.5 last:border-e-0",
                outsideMonth && "bg-muted/20",
              )}
              onClick={() => onCreate(atHour(day, 9), atHour(day, 10))}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onCreate(atHour(day, 9), atHour(day, 10));
                }
              }}
              aria-label={`Create event on ${day.toLocaleDateString(locale)}`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex size-7 items-center justify-center rounded-full text-xs font-medium",
                    outsideMonth && "text-muted-foreground/60",
                    dayKey === today && "bg-primary text-primary-foreground",
                  )}
                >
                  {day.getDate()}
                </span>
                <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">+</span>
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 4).map((event) => (
                  <CalendarEventButton key={event.id} event={event} compact onClick={onEventClick} />
                ))}
                {dayEvents.length > 4 ? (
                  <p className="px-1 text-[11px] text-muted-foreground">+{dayEvents.length - 4} more</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TimeCalendarGrid({
  days,
  events,
  locale,
  onCreate,
  onEventClick,
}: {
  days: Date[];
  events: CalendarEvent[];
  locale: string;
  onCreate: CalendarGridProps["onCreate"];
  onEventClick: CalendarGridProps["onEventClick"];
}) {
  const columns = `72px repeat(${days.length}, minmax(160px, 1fr))`;
  const [selectionStart, setSelectionStart] = useState<Date | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<Date | null>(null);

  function completeSelection() {
    if (!selectionStart || !selectionEnd) return;
    const start = selectionStart.getTime() <= selectionEnd.getTime() ? selectionStart : selectionEnd;
    const end = selectionStart.getTime() <= selectionEnd.getTime() ? selectionEnd : selectionStart;
    onCreate(start, new Date(end.getTime() + 30 * 60_000));
    setSelectionStart(null);
    setSelectionEnd(null);
  }

  return (
    <div className="min-h-0 flex-1 overflow-auto bg-background">
      <div className="min-w-max" style={{ display: "grid", gridTemplateColumns: columns }}>
        <div className="sticky left-0 top-0 z-30 border-b border-e border-border bg-background" />
        {days.map((day) => (
          <div key={calendarIsoDate(day)} className="sticky top-0 z-20 border-b border-e border-border bg-background px-3 py-2 text-center last:border-e-0">
            <div className="text-xs font-medium text-muted-foreground">{day.toLocaleDateString(locale, { weekday: "short" })}</div>
            <div className="text-sm font-semibold text-foreground">{day.toLocaleDateString(locale, { month: "short", day: "numeric" })}</div>
          </div>
        ))}

        {visibleTimeSlots.flatMap((slot) => {
          const cells = [
            <div key={`${slot}-label`} className="sticky left-0 z-10 h-14 border-b border-e border-border bg-background px-2 pt-1 text-end text-[11px] text-muted-foreground">
              {slot.endsWith(":00") ? formatCalendarTimeLabel(slot) : ""}
            </div>,
          ];

          for (const day of days) {
            const dayEvents = calendarEventsForDate(events, day);
            const slotEvents = calendarEventsForTimeSlot(dayEvents, slot);
            const start = dateAtTime(day, slot);
            const selectionLow = selectionStart && selectionEnd && Math.min(selectionStart.getTime(), selectionEnd.getTime());
            const selectionHigh = selectionStart && selectionEnd && Math.max(selectionStart.getTime(), selectionEnd.getTime());
            const isSelected = selectionLow !== null && selectionHigh !== null && start.getTime() >= selectionLow && start.getTime() <= selectionHigh;
            cells.push(
              <div
                key={`${calendarIsoDate(day)}-${slot}`}
                className={cn("group h-14 border-b border-e border-border p-1 last:border-e-0 hover:bg-muted/30", isSelected && "bg-primary/10")}
                onPointerDown={(event) => {
                  if (event.button !== 0) return;
                  setSelectionStart(start);
                  setSelectionEnd(start);
                }}
                onPointerEnter={(event) => {
                  if (event.buttons === 1 && selectionStart) setSelectionEnd(start);
                }}
                onPointerUp={completeSelection}
                onPointerCancel={() => { setSelectionStart(null); setSelectionEnd(null); }}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onCreate(start, new Date(start.getTime() + 30 * 60_000));
                  }
                }}
                aria-label={`Select time at ${formatCalendarTimeLabel(slot)} on ${day.toLocaleDateString(locale)}`}
              >
                {slotEvents.length ? (
                  <div className="space-y-1">
                    {slotEvents.map((event) => (
                      <CalendarEventButton key={event.id} event={event} onClick={onEventClick} />
                    ))}
                  </div>
                ) : (
                  <span className="px-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100">+</span>
                )}
              </div>,
            );
          }
          return cells;
        })}
      </div>
    </div>
  );
}

function CalendarEventButton({
  event,
  compact = false,
  onClick,
}: {
  event: CalendarEvent;
  compact?: boolean;
  onClick: (event: CalendarEvent) => void;
}) {
  return (
    <button
      type="button"
      className="flex w-full min-w-0 items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-start text-xs text-card-foreground shadow-sm transition-colors hover:bg-accent"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation();
        onClick(event);
      }}
      title={`${event.time} ${event.title}`}
    >
      <EventTypeDot type={event.type} />
      {!compact ? <span className="shrink-0 text-[10px] text-muted-foreground">{event.time}</span> : null}
      <span className="truncate font-medium">{event.title}</span>
    </button>
  );
}

function atHour(date: Date, hour: number) {
  const next = new Date(date);
  next.setHours(hour, 0, 0, 0);
  return next;
}

function dateAtTime(date: Date, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hour, minute, 0, 0);
  return next;
}

export function CalendarEmptyState() {
  return (
    <div className="flex h-full min-h-72 flex-col items-center justify-center gap-2 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CalendarDays className="size-5" />
      </span>
      <p className="text-sm font-medium text-foreground">No events in this period</p>
      <p className="max-w-sm text-xs text-muted-foreground">Choose a day or time slot to schedule your first event.</p>
    </div>
  );
}
