"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Filter, Plus, X } from "lucide-react";
import { AppPrimaryButton } from "@/components/shared";
import { useCalendarStore } from "@/domains/calendar";
import type { CalendarEvent } from "../store/calendar.types";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { QentrahCalendarKit } from "./qentrah-calendar-kit";
import { EventDrawer } from "./event-drawer";
import { useAccountContext } from "@/domains/auth";
import { calendarHeaderLabel, visibleCalendarRange } from "@/domains/calendar/calendar-view-model";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useClientTaskOptionsQuery } from "@/domains/clients/api/client-tasks";
import { useCalendarEventMutations } from "../hooks";
import { useCalendarDrawer } from "../hooks/use-calendar-drawer";
import { useCalendarIndexRangeQueryResult } from "../api/calendar";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useCurrentSpace } from "@/domains/projects/hooks/use-current-space";
import { HttpQueryState, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useTranslations, useLocale } from "next-intl";
import { isRtlLocale } from "@/lib/i18n/locale";
import { cn } from "@/lib/utils";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";

export function CalendarScreen() {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  const isRtl = isRtlLocale(locale);
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady
    ? (account.workspace.organizationId ?? undefined)
    : undefined;
  const { currentDate, view, setCurrentDate, setView } = useCalendarStore();
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
  const isLoading = isWorkspaceReady && eventsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || eventsQuery.queryStatus === "error";
  const drawer = useCalendarDrawer();
  const shouldLoadPickerOptions = drawer.isOpen;
  const clientsQuery = useClientOptionsQuery(workspaceOrganizationId, { enabled: shouldLoadPickerOptions });
  const tasksQuery = useClientTaskOptionsQuery(workspaceOrganizationId, { enabled: shouldLoadPickerOptions });
  const clients = clientsQuery ?? [];
  const tasks = tasksQuery ?? [];
  const isContextLoading = shouldLoadPickerOptions && Boolean(workspaceOrganizationId) && (!clientsQuery || !tasksQuery);
  const calendarQueryKey = useMemo(
    () => workspaceOrganizationId ? ["calendar", "index", { organizationId: workspaceOrganizationId, startAt: range.startAt, endAt: range.endAt, projectId: projectId ?? undefined }] : ["calendar", "index", "skip"],
    [workspaceOrganizationId, range.startAt, range.endAt, projectId],
  );
  const { createEvent, updateEvent, deleteEvent } = useCalendarEventMutations(calendarQueryKey);

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isFiltering = Boolean(filterStartDate && filterEndDate);

  const filteredEvents = useMemo(() => {
    if (!isFiltering) return events;
    return events.filter((ev) => {
      const evDate = ev.date;
      return evDate >= filterStartDate && evDate <= filterEndDate;
    });
  }, [events, isFiltering, filterStartDate, filterEndDate]);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="calendar" />
      ) : isQueryBlocked ? (
        <HttpQueryState query={eventsQuery} variant="calendar" />
      ) : (
        <>
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-5 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg font-bold text-foreground truncate">{t("title")}</h1>
              <div className="h-5 w-px bg-border shrink-0" />
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    if (view === "month") setCurrentDate(subMonths(currentDate, 1));
                    else if (view === "week") setCurrentDate(subWeeks(currentDate, 1));
                    else setCurrentDate(subDays(currentDate, 1));
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="h-7 rounded-lg border border-border px-2.5 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {t("today")}
                </button>
                <button
                  onClick={() => {
                    if (view === "month") setCurrentDate(addMonths(currentDate, 1));
                    else if (view === "week") setCurrentDate(addWeeks(currentDate, 1));
                    else setCurrentDate(addDays(currentDate, 1));
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                {calendarHeaderLabel(currentDate, view, locale)}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsFilterOpen((v) => !v)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors",
                  isFilterOpen
                    ? "border-foreground/20 bg-muted text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Filter className="h-3.5 w-3.5" />
                {t("filter")}
              </button>

              <div className="flex items-center rounded-lg bg-muted p-0.5 gap-0.5">
                {(["month", "week", "day"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      "h-7 rounded-md px-3 text-[11px] font-bold uppercase tracking-wide transition-all",
                      view === v
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {t(v)}
                  </button>
                ))}
              </div>

              <AppPrimaryButton onClick={() => drawer.openCreate()} className="h-8 px-3 text-xs">
                <Plus className="me-1.5 h-3.5 w-3.5" />
                {t("add")}
              </AppPrimaryButton>
            </div>
          </div>

          {isFilterOpen && (
            <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card/50 px-5 py-2.5">
              <CalendarDatePicker
                value={filterStartDate}
                onChange={setFilterStartDate}
                locale={locale}
              />
              <span className="text-xs text-muted-foreground">{isRtl ? "←" : "→"}</span>
              <CalendarDatePicker
                value={filterEndDate}
                onChange={setFilterEndDate}
                locale={locale}
              />
              {isFiltering && (
                <button
                  onClick={() => { setFilterStartDate(""); setFilterEndDate(""); }}
                  className="flex h-7 items-center gap-1 rounded-lg bg-muted px-2 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  {t("clear")}
                </button>
              )}
            </div>
          )}

          <div className="min-h-0 flex-1">
            <QentrahCalendarKit
              events={filteredEvents}
              view={view}
              onViewChange={setView}
              date={currentDate}
              onDateChange={setCurrentDate}
              onEventCreate={async (calEvent) => {
                if (!account.organization.id || !calEvent.start || !calEvent.title) return;
                await createEvent({
                  title: calEvent.title,
                  owner: account.user.name,
                  date: format(calEvent.start, "yyyy-MM-dd"),
                  time: format(calEvent.start, "HH:mm"),
                  type: "meeting",
                  status: "draft",
                  notes: calEvent.description || "",
                });
              }}
              onEventUpdate={async (calEvent) => {
                if (!account.organization.id) return;
                const existing = events.find((e) => e.id === calEvent.id);
                if (!existing) return;
                await updateEvent(calEvent.id, {
                  ...existing,
                  title: calEvent.title,
                  date: format(calEvent.start, "yyyy-MM-dd"),
                  time: format(calEvent.start, "HH:mm"),
                  notes: calEvent.description || existing.notes,
                });
              }}
              onEventClick={(calEvent) => {
                const full = events.find((e) => e.id === calEvent.id);
                if (full) drawer.openRead(full);
              }}
              onTimeSlotClick={(date) => {
                drawer.openCreate(date);
              }}
              isLoading={isLoading}
              locale={locale}
            />
          </div>

          {drawer.isOpen && drawer.mode && (
            <EventDrawer
              mode={drawer.mode}
              view={drawer.view}
              open={drawer.isOpen}
              onClose={() => drawer.close()}
              onEdit={() => drawer.setView("edit")}
              event={drawer.event ?? undefined}
              initialDate={drawer.initialDate ?? undefined}
              organizationId={workspaceOrganizationId}
              clients={clients}
              tasks={tasks}
              clientsLoading={isContextLoading && !clientsQuery}
              tasksLoading={isContextLoading && !tasksQuery}
              onDelete={async () => {
                if (!drawer.event) return;
                await deleteEvent(drawer.event.id);
                drawer.close();
              }}
              onSave={async (data) => {
                if (!workspaceOrganizationId) return;
                if (drawer.mode === "create") {
                  await createEvent(data);
                } else if (drawer.event) {
                  await updateEvent(drawer.event.id, data);
                }
                drawer.close();
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
