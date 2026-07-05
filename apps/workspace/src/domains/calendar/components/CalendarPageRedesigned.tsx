"use client";

import { useMemo, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { useCalendarStore } from "../store/calendar.store";
import type { CalendarEvent } from "../store/calendar.types";
import { useAuthSession } from "@/domains/auth";
import { calendarHeaderLabel, visibleCalendarRange } from "../calendar-view-model";
import type { CalendarView } from "../calendar-view-model";
import { useCalendarIndexRangeQueryResult } from "../api/calendar";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useNavigation } from "@/domains/navigation";
import { HttpQueryState, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { DomainHeader, type HeaderAction } from "@/components/shared/domain/DomainHeader";
import { type ViewMode } from "@/components/shared/view-system/ViewSwitcher";
import { ViewLoading } from "@/components/shared/loading/ViewLoading";

const EVENT_COLORS: Record<CalendarEvent["type"], string> = {
  meeting: "#007AFF",
  deadline: "#FF3B30",
  reminder: "#FF9500",
  milestone: "#34C759",
  focusBlock: "#AF52DE",
};

function getEventColor(type: CalendarEvent["type"], status: CalendarEvent["status"]): string {
  if (status === "draft") return "#8e8e93";
  return EVENT_COLORS[type] ?? "#007AFF";
}

export function CalendarPageRedesigned() {
  const t = useTranslations("Calendar");
  const common = useTranslations("Common");
  const locale = useLocale();
  const session = useAuthSession();
  const [activeView, setActiveView] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const workspaceStatus = session.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady && session.workspace.organizationId
    ? session.workspace.organizationId
    : undefined;

  const { currentDate, view, setCurrentDate, setView } = useCalendarStore();

  const range = useMemo(
    () => visibleCalendarRange(currentDate, view),
    [currentDate, view],
  );

  const projectId = useCurrentProjectId();
  const { spaceId } = useNavigation();

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

  const isLoading = isWorkspaceReady && eventsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || eventsQuery.queryStatus === "error";

  // Transform CalendarEvent for display
  const displayEvents = useMemo(() => {
    return events.map((ev) => ({
      id: ev.id,
      title: ev.title,
      date: ev.date,
      time: ev.time,
      endTime: ev.endTime,
      color: getEventColor(ev.type, ev.status),
      type: ev.type,
      status: ev.status,
      location: ev.location,
    }));
  }, [events]);

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

  const actions = [
    {
      label: t("add"),
      icon: <Plus className="w-4 h-4" />,
      onClick: () => {},
      variant: "primary" as const,
    },
  ];

  const availableViews: ViewMode[] = ['calendar', 'table', 'board', 'timeline', 'dashboard', 'widgets'];

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader
          domain="Calendar"
          currentSection="Schedule"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <WorkspaceQueryState status={workspaceStatus} variant="calendar" />
        </div>
      </div>
    );
  }

  if (isQueryBlocked) {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader
          domain="Calendar"
          currentSection="Schedule"
          actions={actions}
          availableViews={availableViews}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <div className="flex-1 flex items-center justify-center">
          <HttpQueryState query={eventsQuery} variant="calendar" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <DomainHeader
        domain="Calendar"
        currentSection={headerLabel}
        actions={actions}
        availableViews={availableViews}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Calendar navigation controls */}
      <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="h-8 rounded-lg bg-muted px-4 text-xs font-semibold text-foreground hover:bg-muted/80 transition-colors"
          >
            {t("today")}
          </button>
          <button
            onClick={() => navigate(1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center rounded-lg bg-muted p-0.5">
          {(["month", "week", "day"] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-all",
                view === v
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* View content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'calendar' && (
          <div className="h-full p-6">
            {isLoading ? (
              <ViewLoading style="calendar" message="Loading calendar..." />
            ) : (
              <div className="h-full rounded-xl border border-border bg-card overflow-hidden p-6">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const date = new Date(currentDate);
                    date.setDate(date.getDate() - date.getDay() + i);
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
                    const dayEvents = displayEvents.filter((ev) => ev.date === dateStr);
                    return (
                      <div
                        key={i}
                        className="min-h-[80px] border border-border/50 rounded-lg p-1 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="text-xs font-medium text-foreground mb-1">
                          {date.getDate()}
                        </div>
                        {dayEvents.slice(0, 3).map((ev) => (
                          <div
                            key={ev.id}
                            className="text-[10px] truncate px-1 py-0.5 rounded mb-0.5"
                            style={{ backgroundColor: `${ev.color}20`, color: ev.color }}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[9px] text-muted-foreground">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'table' && (
          <div className="h-full p-6">
            <ViewLoading style="table" message="Table view coming soon" />
          </div>
        )}

        {activeView === 'board' && (
          <div className="h-full p-6">
            <ViewLoading style="board" message="Board view coming soon" />
          </div>
        )}

        {activeView === 'timeline' && (
          <div className="h-full p-6">
            <ViewLoading style="table" message="Timeline view coming soon" />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Dashboard view coming soon" />
          </div>
        )}

        {activeView === 'widgets' && (
          <div className="h-full p-6">
            <ViewLoading style="skeleton" message="Widgets view coming soon" />
          </div>
        )}
      </div>
    </div>
  );
}
