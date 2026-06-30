"use client";

import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Calendar, Editor } from "@svar-ui/react-calendar";
import "@svar-ui/react-calendar/all.css";
import type { CalendarEvent as SvarEvent, CalendarInstanceApi } from "@svar-ui/react-calendar";
import { useCalendarStore } from "../store/calendar.store";
import type { CalendarEvent } from "../store/calendar.types";
import { useAccountContext } from "@/domains/auth";
import { calendarHeaderLabel, visibleCalendarRange } from "../calendar-view-model";
import type { CalendarView } from "../calendar-view-model";
import { useCalendarIndexRangeQueryResult } from "../api/calendar";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useCurrentSpace } from "@/domains/projects/hooks/use-current-space";
import { HttpQueryState, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";

const EVENT_COLORS: Record<CalendarEvent["type"], string> = {
  meeting: "var(--q-calendar-meeting, #007aff)",
  deadline: "var(--q-calendar-deadline, #ff3b30)",
  reminder: "var(--q-calendar-reminder, #ff9500)",
  milestone: "var(--q-calendar-milestone, #34c759)",
  focusBlock: "var(--q-calendar-focus-block, #af52de)",
};

function getEventColor(type: CalendarEvent["type"], status: CalendarEvent["status"]): string {
  if (status === "draft") return "var(--q-calendar-draft, #8e8e93)";
  return EVENT_COLORS[type] ?? "var(--q-calendar-meeting, #007aff)";
}

function toSvarEvents(events: CalendarEvent[]): SvarEvent[] {
  return events
    .filter((ev) => ev.date && ev.time)
    .map((ev) => {
      const [h, m] = ev.time.split(":").map(Number);
      const start = new Date(`${ev.date}T00:00:00`);
      start.setHours(h || 9, m || 0, 0, 0);
      const end = new Date(start.getTime() + 3600000);
      return {
        id: ev.id,
        text: ev.title,
        start,
        end,
        color: getEventColor(ev.type, ev.status),
      };
    });
}

const VIEWS: CalendarView[] = ["month", "week", "day"];

export function CalendarScreen() {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady && account.workspace.organizationId
    ? account.workspace.organizationId
    : undefined;

  const { currentDate, view, setCurrentDate, setView } = useCalendarStore();
  const [svarApi, setSvarApi] = useState<CalendarInstanceApi | null>(null);

  const range = useMemo(
    () => visibleCalendarRange(currentDate, view),
    [currentDate, view],
  );

  const projectId = useCurrentProjectId();
  const currentSpace = useCurrentSpace();
  const spaceId = currentSpace?.spaceId ?? null;

  const eventsQuery = useCalendarIndexRangeQueryResult(
    workspaceOrganizationId,
    range.startAt,
    range.endAt,
    projectId,
    spaceId,
  );

  const events = useMemo(
    () => (eventsQuery.data?.events ?? []) as CalendarEvent[],
    [eventsQuery.data],
  );

  const svarEvents = useMemo(() => toSvarEvents(events), [events]);

  const isLoading = isWorkspaceReady && eventsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || eventsQuery.queryStatus === "error";

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const selectedDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    return events.filter((ev) => ev.date === dateStr);
  }, [events, selectedDate]);

  const handleDateSelect = useCallback((date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
  }, [setCurrentDate]);

  const navigate = useCallback((dir: 1 | -1) => {
    const d = new Date(currentDate);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else if (view === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  }, [currentDate, view, setCurrentDate]);

  const headerLabel = useMemo(
    () => calendarHeaderLabel(currentDate, view, locale),
    [currentDate, view, locale],
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="calendar" />
      ) : isQueryBlocked ? (
        <HttpQueryState query={eventsQuery} variant="calendar" />
      ) : (
        <>
          {/* Apple-style header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border/50 bg-card/80 px-5 py-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <h1 className="text-[22px] font-semibold text-foreground tracking-tight">{headerLabel}</h1>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => navigate(-1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="h-7 rounded-md bg-muted px-3 text-[11px] font-semibold text-foreground hover:bg-muted/80 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigate(1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-full bg-muted p-0.5">
                {VIEWS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold transition-all",
                      view === v
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              <button className="flex h-7 items-center gap-1.5 rounded-full bg-foreground px-3 text-[11px] font-semibold text-background hover:opacity-90 transition-opacity">
                <Plus className="h-3 w-3" />
                <span>Event</span>
              </button>
            </div>
          </div>

          {/* Main content: Calendar + detail panel */}
          <div className="flex min-h-0 flex-1">
            {/* Calendar grid */}
            <div className="q-calendar-view flex-1 min-w-0">
              <Calendar
                init={setSvarApi}
                events={svarEvents}
                date={currentDate}
                view={view}
                toolbar={null}
                eventContent={({ event }: { event: SvarEvent }) => (
                  <div className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium leading-tight truncate">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <span className="truncate">{event.text}</span>
                  </div>
                )}
              />
            </div>

            {/* Apple-style detail panel */}
            <div className="w-72 shrink-0 border-l border-border/50 bg-card/50">
              <div className="flex flex-col h-full">
                {/* Mini month */}
                <div className="p-4">
                  <MiniMonth
                    date={currentDate}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    events={events}
                  />
                </div>

                {/* Selected day events */}
                <div className="flex-1 overflow-y-auto border-t border-border/50 px-4 py-3">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {selectedDate
                      ? selectedDate.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })
                      : currentDate.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })}
                  </h3>
                  <div className="space-y-1.5">
                    {selectedDayEvents.length === 0 && (
                      <p className="text-xs text-muted-foreground">No events</p>
                    )}
                    {selectedDayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded-lg border border-border/50 bg-card px-3 py-2 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: getEventColor(ev.type, ev.status) }}
                          />
                          <span className="text-xs font-medium text-foreground truncate">{ev.title}</span>
                        </div>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {ev.time}
                          {ev.notes && ` · ${ev.notes}`}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {svarApi && <Editor api={svarApi} />}
        </>
      )}
    </div>
  );
}

function MiniMonth({
  date,
  selectedDate,
  onDateSelect,
  events,
}: {
  date: Date;
  selectedDate: Date | null;
  onDateSelect: (d: Date) => void;
  events: CalendarEvent[];
}) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const eventDates = useMemo(() => {
    const s = new Set<string>();
    events.forEach((ev) => s.add(ev.date));
    return s;
  }, [events]);

  return (
    <div>
      <div className="text-center mb-3">
        <span className="text-[11px] font-semibold text-foreground">
          {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </span>
      </div>
      <div className="grid grid-cols-7 gap-0">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="text-center text-[9px] font-semibold text-muted-foreground/60 pb-1">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = ds === todayStr;
          const isSelected = selectedDate
            ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}` === ds
            : false;
          const hasEvents = eventDates.has(ds);
          return (
            <button
              key={day}
              onClick={() => onDateSelect(new Date(year, month, day))}
              className={cn(
                "relative flex items-center justify-center text-[11px] h-7 w-full rounded-full transition-colors",
                isSelected && "bg-foreground text-background",
                !isSelected && isToday && "text-[var(--q-calendar-today,#ff3b30)] font-semibold",
                !isSelected && !isToday && "text-muted-foreground hover:bg-muted",
              )}
            >
              {day}
              {hasEvents && (
                <span
                  className={cn(
                    "absolute bottom-1 h-1 w-1 rounded-full",
                    isSelected ? "bg-background" : "bg-foreground/40",
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
