"use client";

import { useState, useMemo } from "react";
import { Plus, CalendarDays, User } from "lucide-react";
import {
  AppPageHeader,
  AppPageShell,
  AppPrimaryButton,
  AppStatsGrid,
} from "@/components/shared";
import { useCalendarStore } from "@/domains/calendar";
import type { CalendarEvent } from "../store/calendar.types";
import { useAccountContext } from "@/domains/auth";
import {
  createCalendarEventRequest,
  deleteCalendarEventRequest,
  updateCalendarEventRequest,
  useCalendarIndexRangeQueryResult,
} from "../api/calendar";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useClientTaskOptionsQuery } from "@/domains/clients/api/client-tasks";
import { useOperationState } from "@/lib/utils/operation-state";
import {
  DeleteRecordDialog,
  HttpQueryState,
  WorkspaceQueryState,
} from "@/components/shared/crud-ui";
import { useTranslations, useLocale } from "next-intl";
import { QentrahCalendarKit } from "./qentrah-calendar-kit";
import { visibleCalendarRange } from "@/domains/calendar/calendar-view-model";
import type { CalendarEvent as CalendarKitEvent } from "calendarkit-basic";
import { format } from "date-fns";

// Import existing dialogs from the original file
// We'll keep these components as they are
import { EventDetailDialog, DayDialog, BusinessScheduleDialog } from "./calendar-dialogs";

/* ── Main Calendar Screen ── */
export function CalendarScreen() {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  const account = useAccountContext();
  const workspaceStatus = account.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady
    ? (account.workspace.organizationId ?? undefined)
    : undefined;
  
  const { currentDate, view, setCurrentDate, setView } = useCalendarStore();
  
  // Calculate visible range for querying events
  const range = useMemo(
    () => visibleCalendarRange(currentDate, view),
    [currentDate, view],
  );
  
  // Query events
  const eventsQuery = useCalendarIndexRangeQueryResult(
    workspaceOrganizationId,
    range.startAt,
    range.endAt,
  );
  
  const stats = eventsQuery.data?.stats;
  const events = useMemo(
    () => (eventsQuery.data?.events ?? []) as CalendarEvent[],
    [eventsQuery.data],
  );
  
  const isLoading = isWorkspaceReady && eventsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || eventsQuery.queryStatus === "error";

  // Dialog states
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [drawerDate, setDrawerDate] = useState<Date | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [deleting, setDeleting] = useState<CalendarEvent | null>(null);

  // Load picker options when dialogs are open
  const shouldLoadPickerOptions = isCreateOpen || Boolean(editingEvent);
  const clientsQuery = useClientOptionsQuery(workspaceOrganizationId, { enabled: shouldLoadPickerOptions });
  const tasksQuery = useClientTaskOptionsQuery(workspaceOrganizationId, { enabled: shouldLoadPickerOptions });
  const clients = clientsQuery ?? [];
  const tasks = tasksQuery ?? [];
  const isContextLoading = shouldLoadPickerOptions && Boolean(workspaceOrganizationId) && (!clientsQuery || !tasksQuery);

  const deleteOperation = useOperationState({
    errorMessage: "Event delete failed.",
  });

  // Event handlers for CalendarKit
  const handleEventCreate = async (event: Partial<CalendarKitEvent>) => {
    if (!workspaceOrganizationId || !event.start || !event.title) return;
    
    const newEvent: Partial<CalendarEvent> = {
      title: event.title,
      owner: account.user.name,
      date: format(event.start, "yyyy-MM-dd"),
      time: format(event.start, "HH:mm"),
      type: "meeting",
      status: "draft",
      notes: event.description,
    };

    if (event.start && event.end) {
      newEvent.startAt = event.start.getTime();
      newEvent.endAt = event.end.getTime();
    }

    await createCalendarEventRequest(workspaceOrganizationId, newEvent);
  };

  const handleEventUpdate = async (event: CalendarKitEvent) => {
    if (!workspaceOrganizationId) return;
    
    const existingEvent = events.find((e) => e.id === event.id);
    if (!existingEvent) return;

    const updatedEvent: Partial<CalendarEvent> = {
      ...existingEvent,
      title: event.title,
      date: format(event.start, "yyyy-MM-dd"),
      time: format(event.start, "HH:mm"),
      startAt: event.start.getTime(),
      endAt: event.end.getTime(),
      notes: event.description,
    };

    await updateCalendarEventRequest(
      workspaceOrganizationId,
      event.id,
      updatedEvent,
    );
  };

  const handleEventDelete = async (eventId: string) => {
    if (!workspaceOrganizationId) return;
    await deleteCalendarEventRequest(workspaceOrganizationId, eventId);
  };

  const handleEventClick = (calendarKitEvent: CalendarKitEvent) => {
    // Find the full Qentrah event from the ID
    const fullEvent = events.find((e) => e.id === calendarKitEvent.id);
    if (fullEvent) {
      setSelectedEvent(fullEvent);
    }
  };

  return (
    <AppPageShell>
      <AppPageHeader
        eyebrow={t("eyebrow")}
        title={t("title") + "."}
        actions={
          <AppPrimaryButton onClick={() => setIsCreateOpen(true)}>
            <Plus className="me-2 h-3.5 w-3.5" />
            {t("add")}
          </AppPrimaryButton>
        }
      />

      <AppStatsGrid
        stats={[
          {
            label: t("stats.events"),
            value: stats?.total ?? "...",
            icon: CalendarDays,
          },
          {
            label: t("stats.confirmed"),
            value: stats?.confirmed ?? "...",
            dotClassName: "bg-emerald-500",
          },
          {
            label: t("stats.pending"),
            value: stats?.pending ?? "...",
            dotClassName: "bg-amber-500",
          },
          {
            label: t("stats.owners"),
            value: stats?.owners ?? "...",
            icon: User,
          },
        ]}
      />

      {workspaceStatus !== "ready" ? (
        <WorkspaceQueryState status={workspaceStatus} variant="calendar" />
      ) : isQueryBlocked ? (
        <HttpQueryState query={eventsQuery} variant="calendar" />
      ) : (
        <>
          <div style={{ height: "700px" }}>
            <QentrahCalendarKit
              events={events}
              view={view}
              onViewChange={setView}
              date={currentDate}
              onDateChange={setCurrentDate}
              onEventCreate={handleEventCreate}
              onEventUpdate={handleEventUpdate}
              onEventDelete={handleEventDelete}
              onEventClick={handleEventClick}
              isLoading={isLoading}
              locale={locale}
            />
          </div>

          {/* ── Day Dialog ── */}
          {drawerDate && (
            <DayDialog
              date={drawerDate}
              events={events.filter((e) => e.date === format(drawerDate, "yyyy-MM-dd"))}
              onClose={() => setDrawerDate(null)}
              onEventClick={setSelectedEvent}
              onDelete={(id) => {
                if (!account.organization.id) return;
                void deleteCalendarEventRequest(account.organization.id, id);
              }}
            />
          )}

          {/* ── Event Detail Dialog ── */}
          {selectedEvent && (
            <EventDetailDialog
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onDelete={(id) => {
                if (!account.organization.id) return;
                void deleteCalendarEventRequest(account.organization.id, id);
                setSelectedEvent(null);
              }}
              onEditClick={(event) => {
                setSelectedEvent(null);
                setEditingEvent(event);
              }}
            />
          )}

          {/* ── Delete Confirmation Dialog ── */}
          <DeleteRecordDialog
            open={Boolean(deleting)}
            onOpenChange={(open) => {
              if (!open) {
                deleteOperation.clearError();
                setDeleting(null);
              }
            }}
            title={t("delete.title")}
            description={t("delete.desc", { name: deleting?.title ?? "..." })}
            isDeleting={deleteOperation.isRunning}
            error={deleteOperation.error}
            onConfirm={() =>
              deleteOperation.run(
                () => {
                  if (!deleting) throw new Error("No event");
                  if (!account.organization.id)
                    throw new Error("Select an organization first.");
                  return deleteCalendarEventRequest(
                    account.organization.id,
                    deleting.id,
                  );
                },
                {
                  successMessage: "Event deleted.",
                  onSuccess: () => setDeleting(null),
                },
              )
            }
          />

          {/* ── Create Event Dialog ── */}
          <BusinessScheduleDialog
            mode="create"
            open={isCreateOpen}
            onOpenChange={setIsCreateOpen}
            organizationId={workspaceOrganizationId}
            clients={clients}
            tasks={tasks}
            clientsLoading={isContextLoading && !clientsQuery}
            tasksLoading={isContextLoading && !tasksQuery}
          />

          {/* ── Edit Event Dialog ── */}
          {editingEvent && (
            <BusinessScheduleDialog
              mode="edit"
              open={Boolean(editingEvent)}
              onOpenChange={(open) => {
                if (!open) setEditingEvent(null);
              }}
              event={editingEvent}
              organizationId={workspaceOrganizationId}
              clients={clients}
              tasks={tasks}
              clientsLoading={isContextLoading && !clientsQuery}
              tasksLoading={isContextLoading && !tasksQuery}
            />
          )}
        </>
      )}
    </AppPageShell>
  );
}
