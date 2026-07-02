"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from "lucide-react";
import { useCalendarStore } from "../store/calendar.store";
import type { CalendarEvent } from "../store/calendar.types";
import { useAuthSession } from "@/domains/auth";
import { calendarHeaderLabel, visibleCalendarRange } from "../calendar-view-model";
import type { CalendarView } from "../calendar-view-model";
import { useCalendarIndexRangeQueryResult } from "../api/calendar";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useActiveSpace } from "@/domains/spaces/hooks/use-active-space";
import { HttpQueryState, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/shared/page-header";
import { Calendar } from "@/components/ui/calendar";

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

const VIEWS: CalendarView[] = ["month", "week", "day"];

export function CalendarScreen() {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  const session = useAuthSession();
  const workspaceStatus = session.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady && session.workspace.organizationId
    ? session.workspace.organizationId
    : undefined;

  const { currentDate, view, setCurrentDate, setView } = useCalendarStore();

  useEffect(() => {
    if (view === "month") {
      setView("week");
    }
  }, [view, setView]);

  const range = useMemo(
    () => visibleCalendarRange(currentDate, view),
    [currentDate, view],
  );

  const projectId = useCurrentProjectId();
  const { spaceId } = useActiveSpace();

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

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

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
          <PageHeader
            title={headerLabel}
            actions={[
              {
                label: t("actions.new"),
                icon: Plus,
                variant: "primary",
                onClick: () => {},
              },
            ]}
          />

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
              {VIEWS.map((v) => (
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

          <div className="flex-1 overflow-auto p-6">
            <div className="h-full min-h-[500px] rounded-xl border border-border bg-card p-6">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(date) => date && handleDateSelect(date)}
                className="rounded-md"
              />
            </div>
          </div>

          {selectedDate && (
            <div className="h-48 shrink-0 border-t border-border bg-card">
              <div className="flex h-full">
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    {selectedDate.toLocaleDateString(locale, { weekday: "long", month: "long", day: "numeric" })}
                  </h3>
                  <div className="space-y-2">
                    {selectedDayEvents.length === 0 && (
                      <p className="text-sm text-muted-foreground">{t("noEvents")}</p>
                    )}
                    {selectedDayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2"
                      >
                        <div
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: getEventColor(ev.type, ev.status) }}
                        />
                        <span className="text-sm font-medium text-foreground">{ev.title}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{ev.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
