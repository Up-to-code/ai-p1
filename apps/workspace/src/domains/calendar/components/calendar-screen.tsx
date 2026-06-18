"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button as AriaButton } from "react-aria-components";
import { LocationPicker } from "@qentrah/location-map/react";
import type { LocationValue } from "@qentrah/location-map";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Plus,
  Trash2,
  User,
  Clock,
  X,
  Eye,
  Phone,
  MapPin,
  Building2,
  ClipboardList,
  Loader2,
  Search,
  AlignLeft,
  Mail,
  DollarSign,
  BedDouble,
  Ruler,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import {
  AppPageHeader,
  AppPageShell,
  AppPrimaryButton,
  AppStatsGrid,
} from "@/components/shared";
import { useCalendarStore } from "@/domains/calendar";
import type { CalendarEvent } from "../store/calendar.types";
import {
  calendarEventSchema,
  type CalendarEventFormValues,
} from "../validation/calendar.schema";
import { format, parse } from 'date-fns';
import { QentrahCalendarKit } from "./qentrah-calendar-kit";
import type { CalendarEvent as CalendarKitEvent } from "calendarkit-basic";

import { useAccountContext } from "@/domains/auth";
import {
  calendarDateOptions,
  calendarDayMonthLabel,
  calendarEventsByDate,
  calendarEventsForTimeSlot,
  calendarEventTone,
  calendarEventTypeClassName,
  calendarHeaderLabel,
  calendarIsoOptionLabel,
  calendarIsoDate,
  calendarLongDayLabel,
  calendarLongDayYearLabel,
  calendarLocationValueFromString,
  calendarScheduleTitle,
  calendarShortMonthLabel,
  calendarTasksForClient,
  calendarTimeOptions,
  customEventTypeValues,
  formatCalendarTimeLabel,
  generateCalendarTimeSlots,
  getCalendarMonthDays,
  getCalendarWeekDays,
  nextCalendarDate,
  orderedCalendarEvents,
  serializeCalendarLocation,
  visibleCalendarPickerOptions,
  visibleCalendarRange,
  type CalendarView,
} from "@/domains/calendar/calendar-view-model";
import { useClientOptionsQuery, useClientQuery } from "@/domains/clients/api/clients";
import { useClientTaskOptionsQuery } from "@/domains/clients/api/client-tasks";
import {
  createCalendarEventRequest,
  deleteCalendarEventRequest,
  updateCalendarEventRequest,
  useCalendarIndexRangeQueryResult,
} from "../api/calendar";
import { useOperationState } from "@/lib/utils/operation-state";
import {
  DeleteRecordDialog,
  FormErrorSummary,
  HttpQueryState,
  StatusPill,
  TextInput,
  WorkspaceQueryState,
} from "@/components/shared/crud-ui";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

type PickerKind = "client" | "task";

/* ── Main ── */
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
  const range = useMemo(
    () => visibleCalendarRange(currentDate, view),
    [currentDate, view],
  );
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
  const [deleting, setDeleting] = useState<CalendarEvent | null>(null);
  const [drawerDate, setDrawerDate] = useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const shouldLoadPickerOptions = isCreateOpen || Boolean(editingEvent);
  const clientsQuery = useClientOptionsQuery(workspaceOrganizationId, { enabled: shouldLoadPickerOptions });
    const tasksQuery = useClientTaskOptionsQuery(workspaceOrganizationId, { enabled: shouldLoadPickerOptions });
  const clients = clientsQuery ?? [];
  const tasks = tasksQuery ?? [];
  const isContextLoading = shouldLoadPickerOptions && Boolean(workspaceOrganizationId) && (!clientsQuery || !tasksQuery);
  const deleteOperation = useOperationState({
    errorMessage: "Event delete failed.",
  });

  const eventsByDate = useMemo(() => {
    return calendarEventsByDate(events);
  }, [events]);

  const eventsForDate = (d: Date) => eventsByDate[calendarIsoDate(d)] || [];

  const navigate = (dir: 1 | -1) => {
    setCurrentDate(nextCalendarDate(currentDate, view, dir));
  };

  const headerLabel = calendarHeaderLabel(currentDate, view, locale);

  const weekDayLabels = [
    t("weekDays.sun"),
    t("weekDays.mon"),
    t("weekDays.tue"),
    t("weekDays.wed"),
    t("weekDays.thu"),
    t("weekDays.fri"),
    t("weekDays.sat"),
  ];

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
              onEventCreate={async (calendarKitEvent) => {
                if (!account.organization.id || !calendarKitEvent.start || !calendarKitEvent.title) return;
                
                const newEvent: Partial<CalendarEvent> = {
                  title: calendarKitEvent.title,
                  owner: account.user.name,
                  date: format(calendarKitEvent.start, "yyyy-MM-dd"),
                  time: format(calendarKitEvent.start, "HH:mm"),
                  type: "meeting",
                  status: "draft",
                  notes: calendarKitEvent.description,
                };

                if (calendarKitEvent.start && calendarKitEvent.end) {
                  newEvent.startAt = calendarKitEvent.start.getTime();
                  newEvent.endAt = calendarKitEvent.end.getTime();
                }

                await createCalendarEventRequest(account.organization.id, newEvent);
              }}
              onEventUpdate={async (calendarKitEvent) => {
                if (!account.organization.id) return;
                
                const existingEvent = events.find((e) => e.id === calendarKitEvent.id);
                if (!existingEvent) return;

                const updatedEvent: Partial<CalendarEvent> = {
                  ...existingEvent,
                  title: calendarKitEvent.title,
                  date: format(calendarKitEvent.start, "yyyy-MM-dd"),
                  time: format(calendarKitEvent.start, "HH:mm"),
                  startAt: calendarKitEvent.start.getTime(),
                  endAt: calendarKitEvent.end.getTime(),
                  notes: calendarKitEvent.description,
                };

                await updateCalendarEventRequest(account.organization.id, calendarKitEvent.id, updatedEvent);
              }}
              onEventDelete={async (eventId) => {
                if (!account.organization.id) return;
                await deleteCalendarEventRequest(account.organization.id, eventId);
              }}
              onEventClick={(calendarKitEvent) => {
                const fullEvent = events.find((e) => e.id === calendarKitEvent.id);
                if (fullEvent) {
                  setSelectedEvent(fullEvent);
                }
              }}
              isLoading={isLoading}
              locale={locale}
            />
          </div>

          {/* ── Day Dialog ── */}
          {drawerDate && (
            <DayDialog
              date={drawerDate}
              events={eventsForDate(drawerDate)}
              onClose={() => setDrawerDate(null)}
              onEventClick={setSelectedEvent}
              onDelete={(id) => {
                if (!account.organization.id) return;
                void deleteCalendarEventRequest(account.organization.id, id);
              }}
            />
          )}

          {/* ── Event Detail ── */}
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

function UntitledCalendarSurface({
  currentDate,
  eventsForDate,
  headerLabel,
  locale,
  onDateClick,
  onEventClick,
  onNavigate,
  onToday,
  onViewChange,
  moreLabel,
  statusLabels,
  todayLabel,
  view,
  viewLabels,
  weekDayLabels,
}: {
  currentDate: Date;
  eventsForDate: (date: Date) => CalendarEvent[];
  headerLabel: string;
  locale: string;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onNavigate: (direction: 1 | -1) => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  moreLabel: string;
  statusLabels: Record<CalendarEvent["status"], string>;
  todayLabel: string;
  view: CalendarView;
  viewLabels: Record<CalendarView, string>;
  weekDayLabels: string[];
}) {
  const selectedDayEvents = eventsForDate(currentDate);
  const selectedDayLabel = calendarDayMonthLabel(currentDate, locale);

  return (
    <section className="overflow-hidden rounded-[24px] border border-border bg-card text-foreground">
      <div className="flex flex-col gap-5 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-muted text-center sm:flex">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {calendarShortMonthLabel(currentDate, locale)}
            </span>
            <span className="text-xl font-black leading-none text-foreground">
              {currentDate.getDate()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {viewLabels[view]}
            </p>
            <h2 className="truncate text-lg font-black uppercase tracking-normal text-foreground">
              {headerLabel}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-border bg-muted p-1">
            <AriaButton
              aria-label="Previous calendar period"
              onPress={() => onNavigate(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rtl:rotate-180"
            >
              <ChevronLeft className="h-4 w-4" />
            </AriaButton>
            <AriaButton
              onPress={onToday}
              className="h-8 rounded-lg bg-primary px-3 text-[10px] font-black uppercase tracking-widest text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              {todayLabel}
            </AriaButton>
            <AriaButton
              aria-label="Next calendar period"
              onPress={() => onNavigate(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rtl:rotate-180"
            >
              <ChevronRight className="h-4 w-4" />
            </AriaButton>
          </div>

          <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-border bg-muted p-1 sm:w-auto">
            {(["month", "week", "day"] as const).map((nextView) => (
              <AriaButton
                key={nextView}
                onPress={() => onViewChange(nextView)}
                className={cn(
                  "h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  view === nextView
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {viewLabels[nextView]}
              </AriaButton>
            ))}
          </div>
        </div>
      </div>

      {view === "month" && (
        <CalendarMonthView
          currentDate={currentDate}
          eventsForDate={eventsForDate}
          moreLabel={moreLabel}
          onDateClick={onDateClick}
          onEventClick={onEventClick}
          weekDayLabels={weekDayLabels}
        />
      )}

      {view === "week" && (
        <CalendarWeekView
          currentDate={currentDate}
          eventsForDate={eventsForDate}
          locale={locale}
          onDateClick={onDateClick}
          onEventClick={onEventClick}
          weekDayLabels={weekDayLabels}
        />
      )}

      {view === "day" && (
        <CalendarDayView
          dateLabel={selectedDayLabel}
          events={selectedDayEvents}
          onEventClick={onEventClick}
          statusLabels={statusLabels}
        />
      )}
    </section>
  );
}

function CalendarMonthView({
  currentDate,
  eventsForDate,
  moreLabel,
  onDateClick,
  onEventClick,
  weekDayLabels,
}: {
  currentDate: Date;
  eventsForDate: (date: Date) => CalendarEvent[];
  moreLabel: string;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  weekDayLabels: string[];
}) {
  const todayIso = calendarIsoDate(new Date());

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-7 border-b border-border">
          {weekDayLabels.map((day) => (
            <div
              key={day}
              className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {getCalendarMonthDays(currentDate).map((date) => {
            const dayEvents = eventsForDate(date);
            const dateIso = calendarIsoDate(date);
            const isCurrentMonth = date.getMonth() === currentDate.getMonth();
            const isToday = dateIso === todayIso;

            return (
              <div
                key={dateIso}
                className={cn(
                  "group relative min-h-[132px] border-b border-e border-border bg-card p-2 text-start transition hover:bg-muted",
                  !isCurrentMonth && "bg-muted/60 text-muted-foreground",
                )}
              >
                <AriaButton
                  aria-label={`Open schedules for ${dateIso}`}
                  onPress={() => onDateClick(date)}
                  className="absolute inset-0 z-0 cursor-pointer rounded-none focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                />
                <AriaButton
                  onPress={() => onDateClick(date)}
                  className={cn(
                    "relative z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    isToday
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground group-hover:bg-muted dark:text-muted-foreground/40 dark:group-hover:bg-white/10",
                  )}
                >
                  {date.getDate()}
                </AriaButton>
                <div className="relative z-10 mt-2 space-y-1.5">
                  {dayEvents.slice(0, 3).map((event) => (
                    <CalendarEventChip
                      event={event}
                      key={event.id}
                      onClick={(clickedEvent) => onEventClick(clickedEvent)}
                      variant="compact"
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <AriaButton
                      onPress={() => onDateClick(date)}
                      className="w-full rounded-lg border border-dashed border-border bg-muted px-2 py-1 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground transition hover:border-border hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      +{dayEvents.length - 3} {moreLabel}
                    </AriaButton>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CalendarWeekView({
  currentDate,
  eventsForDate,
  locale,
  onDateClick,
  onEventClick,
  weekDayLabels,
}: {
  currentDate: Date;
  eventsForDate: (date: Date) => CalendarEvent[];
  locale: string;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  weekDayLabels: string[];
}) {
  const todayIso = calendarIsoDate(new Date());

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[860px] grid-cols-7 divide-x divide-border rtl:divide-x-reverse">
        {getCalendarWeekDays(currentDate).map((date) => {
          const dayEvents = eventsForDate(date);
          const isToday = calendarIsoDate(date) === todayIso;

          return (
            <div key={calendarIsoDate(date)} className="min-h-[560px] bg-background">
              <AriaButton
                onPress={() => onDateClick(date)}
                className={cn(
                  "flex w-full items-center justify-between border-b border-border px-3 py-3 text-start transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  isToday && "bg-primary text-primary-foreground hover:bg-primary/90",
                )}
              >
                <span>
                  <span className="block text-[10px] font-black uppercase tracking-widest opacity-70">
                    {weekDayLabels[date.getDay()]}
                  </span>
                  <span className="mt-0.5 block text-lg font-black">
                    {date.getDate()}
                  </span>
                </span>
                <span className="text-[10px] font-bold opacity-50">
                  {calendarShortMonthLabel(date, locale)}
                </span>
              </AriaButton>
              <div className="space-y-2 p-2">
                {dayEvents.map((event) => (
                  <CalendarEventChip
                    event={event}
                    key={event.id}
                    onClick={onEventClick}
                    variant="stacked"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarDayView({
  dateLabel,
  events,
  onEventClick,
  statusLabels,
}: {
  dateLabel: string;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  statusLabels: Record<CalendarEvent["status"], string>;
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-5 sm:px-6">
      <div className="space-y-1">
        {generateCalendarTimeSlots().map((time) => {
          const slotEvents = calendarEventsForTimeSlot(events, time);

          return (
            <div key={time} className="group grid grid-cols-[64px_minmax(0,1fr)] gap-4 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-6">
              <div className="pt-4 text-end text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 transition group-hover:text-muted-foreground rtl:text-start">
                {time}
              </div>
              <div
                className={cn(
                  "min-h-[44px] border-t border-border",
                  slotEvents.length > 0 && "space-y-2 py-2",
                )}
              >
                {slotEvents.map((event) => (
                  <AriaButton
                    key={event.id}
                    onPress={() => onEventClick(event)}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-3 text-start transition hover:border-border hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black uppercase tracking-normal text-foreground">
                        {event.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {event.owner}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {dateLabel}, {event.time}
                        </span>
                      </span>
                    </span>
                    <StatusPill
                      label={statusLabels[event.status]}
                      tone={calendarEventTone(event.status)}
                    />
                  </AriaButton>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarEventChip({
  event,
  onClick,
  variant,
}: {
  event: CalendarEvent;
  onClick: (event: CalendarEvent) => void;
  variant: "compact" | "stacked";
}) {
  return (
    <AriaButton
      onPress={() => onClick(event)}
      className={cn(
        "block w-full rounded-xl border text-start shadow-sm transition hover:brightness-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        calendarEventTypeClassName(event.type),
        variant === "compact"
          ? "min-h-8 px-2.5 py-1.5 text-xs font-black leading-4"
          : "px-3 py-3",
      )}
    >
      {variant === "compact" ? (
        <span className="block truncate">
          {event.time} {event.title}
        </span>
      ) : (
        <span className="block min-w-0">
          <span className="block text-[10px] font-black opacity-80">
            {event.time}
          </span>
          <span className="mt-1 block truncate text-sm font-black">
            {event.title}
          </span>
          <span className="mt-1 block truncate text-xs font-bold opacity-70">
            {event.owner}
          </span>
        </span>
      )}
    </AriaButton>
  );
}

/* ── Day Dialog ── */
function DayDialog({
  date,
  events,
  onClose,
  onEventClick,
  onDelete,
}: {
  date: Date;
  events: CalendarEvent[];
  onClose: () => void;
  onEventClick: (e: CalendarEvent) => void;
  onDelete: (id: string) => void;
}) {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent showCloseButton={false} className="max-w-md p-0 overflow-hidden bg-card border-border rounded-[32px] shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              {t("drawer.title")}
            </p>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-foreground mt-1">
              {calendarLongDayLabel(date, locale)}
            </DialogTitle>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted transition-all"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-40">
              <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
              <p className="mt-4 text-[10px] font-black uppercase tracking-widest">
                {t("drawer.noEvents")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {orderedCalendarEvents(events)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-2xl border border-border p-4 hover:border-border cursor-pointer transition-all"
                    onClick={() => {
                      onClose();
                      onEventClick(ev);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-black uppercase text-foreground">
                          {ev.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {ev.time}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                            <User className="h-3 w-3" />
                            {ev.owner}
                          </span>
                        </div>
                      </div>
                      <StatusPill
                        label={t(`statuses.${ev.status}`)}
                        tone={calendarEventTone(ev.status)}
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                      <span
                        className={cn(
                          "rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest",
                          calendarEventTypeClassName(ev.type),
                        )}
                      >
                        {t(`types.${ev.type}`)}
                      </span>
                      <div className="flex-1" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(ev.id);
                        }}
                        className="p-1.5 text-muted-foreground/40 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Event Detail Dialog ── */
function EventDetailDialog({
  event,
  onClose,
  onDelete,
  onEditClick,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
  onEditClick: (event: CalendarEvent) => void;
}) {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  const eventDate = new Date(event.date + "T00:00:00");
  const [quickViewEntity, setQuickViewEntity] = useState<{ id: string; type: "client" | "task"; title: string } | null>(null);
  const closeEventDialog = () => {
    setQuickViewEntity(null);
    onClose();
  };

  return (
    <>
    <Dialog open onOpenChange={(open) => { if (!open) closeEventDialog(); }}>
      <DialogContent showCloseButton={false} className="max-w-2xl w-[94vw] p-0 overflow-hidden bg-card border-border rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]">
        <div
          aria-hidden={Boolean(quickViewEntity)}
          className={cn(
            "flex min-h-0 flex-1 flex-col transition duration-150",
            quickViewEntity && "pointer-events-none select-none opacity-35 blur-[1px]",
          )}
        >
        <div className="p-5 border-b border-border">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              {t("detail.eyebrow")}
            </p>
            <button
              onClick={closeEventDialog}
              disabled={Boolean(quickViewEntity)}
              className="p-2 rounded-xl hover:bg-muted transition-all"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-foreground mt-3">
            {event.title}
          </DialogTitle>
          <div className="flex items-center gap-2 mt-3">
            <StatusPill
              label={t(`statuses.${event.status}`)}
              tone={calendarEventTone(event.status)}
            />
            <span
              className={cn(
                "rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest",
                calendarEventTypeClassName(event.type),
              )}
            >
              {t(`types.${event.type}`)}
            </span>
          </div>
        </div>

        <div className="px-5 py-2 max-h-[60vh] overflow-y-auto">
          <PropertyRow icon={<User className="h-4 w-4" />} label={t("detail.owner")}>
            <p className="text-xs font-black uppercase text-foreground sm:mt-1.5">
              {event.owner}
            </p>
          </PropertyRow>
          
          <PropertyRow icon={<CalendarDays className="h-4 w-4" />} label={t("detail.date")}>
            <p className="text-xs font-black uppercase text-foreground sm:mt-1.5">
              {calendarLongDayYearLabel(eventDate, locale)}
            </p>
          </PropertyRow>
          
          <PropertyRow icon={<Clock className="h-4 w-4" />} label={t("detail.time")}>
            <p className="text-xs font-black uppercase text-foreground sm:mt-1.5">
              {event.time}
            </p>
          </PropertyRow>

          {(event.clientName || event.clientId) && (
            <PropertyRow icon={<User className="h-4 w-4" />} label={t("form.clientLabel")}>
              <button 
                type="button"
                onClick={() => setQuickViewEntity({ id: event.clientId || "", type: "client", title: event.clientName || event.clientId || "" })}
                className="flex w-full items-start gap-3 rounded-2xl border border-border bg-muted p-3 text-foreground hover:bg-muted transition-colors text-start"
              >
                <span className="flex-1 whitespace-pre-wrap break-words text-xs font-black uppercase tracking-widest leading-relaxed">
                  {event.clientName ?? event.clientId}
                </span>
                <Eye className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
              </button>
            </PropertyRow>
          )}

          

          {event.taskId && (
            <PropertyRow icon={<ClipboardList className="h-4 w-4" />} label={t("form.taskLabel")}>
              <button 
                type="button"
                onClick={() => setQuickViewEntity({ id: event.taskId || "", type: "task", title: event.taskId || "" })}
                className="flex w-full items-start gap-3 rounded-2xl border border-border bg-muted p-3 text-foreground hover:bg-muted transition-colors text-start"
              >
                <span className="flex-1 whitespace-pre-wrap break-words text-xs font-black uppercase tracking-widest leading-relaxed">
                  {event.taskId}
                </span>
                <Eye className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
              </button>
            </PropertyRow>
          )}

          {event.location && (
            <PropertyRow icon={<MapPin className="h-4 w-4" />} label={t("form.locationLabel")}>
              <p className="whitespace-pre-wrap break-words text-xs font-bold leading-5 text-foreground sm:mt-1">
                {event.location}
              </p>
            </PropertyRow>
          )}

          {event.notes && (
            <PropertyRow icon={<AlignLeft className="h-4 w-4" />} label={t("form.notesLabel")}>
              <p className="whitespace-pre-wrap break-words text-xs font-bold leading-5 text-foreground sm:mt-1">
                {event.notes}
              </p>
            </PropertyRow>
          )}
        </div>

        <div className="p-5 border-t border-border space-y-3">
            <Button
              variant="outline"
              onClick={() => onEditClick(event)}
              disabled={Boolean(quickViewEntity)}
              className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-border"
            >
            <Eye className="me-2 h-3.5 w-3.5" />
            {t("detail.edit") || "Edit"}
          </Button>
          <button
            onClick={() => onDelete(event.id)}
            disabled={Boolean(quickViewEntity)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-600 text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all dark:border-red-900 dark:bg-red-900/20 dark:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {t("delete.title")}
          </button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
    {quickViewEntity && (
      <EntityQuickViewDialog
        entity={quickViewEntity}
        onClose={() => setQuickViewEntity(null)}
      />
    )}
    </>
  );
}

function BusinessScheduleDialog({
  mode,
  open,
  onOpenChange,
  event,
  organizationId,
  clients = [],
  tasks = [],
  clientsLoading,
  tasksLoading,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent;
  organizationId?: string;
  clients: Array<{ id: string; name: string }>;
  tasks: Array<{ id: string; title: string; clientId: string }>;
  clientsLoading: boolean;
  tasksLoading: boolean;
}) {
  const t = useTranslations("Calendar");
  const today = useMemo(() => new Date(), []);
  const defaultDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const defaultValues: CalendarEventFormValues = {
    title: event?.title ?? "",
    owner: event?.owner ?? "Team",
    date: event?.date ?? defaultDate,
    time: event?.time ?? "10:00",
    type: event?.type ?? "meeting",
    status: event?.status ?? "confirmed",
    clientId: event?.clientId ?? "",
    assetId: event?.assetId ?? "",
    taskId: event?.taskId ?? "",
    location: event?.location ?? "",
    notes: event?.notes ?? "",
    customFields: [],
  };
  const [picker, setPicker] = useState<PickerKind | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  
  const operation = useOperationState({
    errorMessage: mode === "create" ? "Event creation failed." : "Event update failed.",
  });
  
  const {
    control,
    handleSubmit,
    getValues,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventSchema as any),
    defaultValues,
  });
  const form = useWatch({ control }) as CalendarEventFormValues;
  const fieldErrors = Object.fromEntries(
    Object.entries(errors).map(([key, error]) => [key, error?.message]),
  ) as Record<keyof CalendarEventFormValues, string | undefined>;

  const selectedClient = clients.find((client) => client.id === form.clientId);
  const selectedTask = tasks.find((task) => task.id === form.taskId);
  const filteredTasks = calendarTasksForClient(tasks, form.clientId);
  const dateOptions = useMemo(() => {
    return calendarDateOptions(today, form.date);
  }, [form.date, today]);
  const timeOptions = useMemo(() => {
    return calendarTimeOptions(form.time);
  }, [form.time]);
  
  const pickerConfig = picker
    ? {
        client: {
          title: t("form.chooseClient"),
          empty: t("form.noClients"),
          loading: clientsLoading,
          options: clients.map((client) => ({ id: client.id, label: client.name, icon: <User className="h-4 w-4" /> })),
          selectedId: form.clientId ?? "",
        },
        task: {
          title: t("form.chooseTask"),
          empty: t("form.noTasks"),
          loading: tasksLoading,
          options: filteredTasks.map((task) => ({ id: task.id, label: task.title, icon: <ClipboardList className="h-4 w-4" /> })),
          selectedId: form.taskId ?? "",
        },
      }[picker]
    : null;

  function closeDrawer() {
    onOpenChange(false);
    reset(defaultValues);
    setPicker(null);
    setPickerSearch("");
    setIsLocationPickerOpen(false);
    operation.clearError();
  }

  function updateField<TKey extends keyof CalendarEventFormValues>(
    key: TKey,
    value: CalendarEventFormValues[TKey],
  ) {
    setValue(key, value as never, {
      shouldDirty: true,
      shouldValidate: Boolean(fieldErrors[key]),
    });
    operation.clearError();
  }

  function openPicker(kind: PickerKind) {
    setPicker(kind);
    setPickerSearch("");
  }

  function selectPickerValue(id: string) {
    if (picker === "client") {
      updateField("clientId", id);
    }
    if (picker === "task") {
      const task = tasks.find((item) => item.id === id);
      updateField("taskId", id);
      if (task?.clientId && !form.clientId) updateField("clientId", task.clientId);
    }
    setPicker(null);
  }

  function clearPickerValue(kind: PickerKind) {
    if (kind === "client") updateField("clientId", "");
    if (kind === "task") updateField("taskId", "");
  }

  function generatedTitle(values: CalendarEventFormValues) {
    const typeLabel = t(`types.${values.type || "meeting"}`);
    const context = selectedClient?.name || values.location?.trim();
    return calendarScheduleTitle(typeLabel, context);
  }

  const onSubmit = handleSubmit((data) => {
    void operation.run(
      () => {
        if (!organizationId) throw new Error("Select an organization first.");
        if (mode === "create") {
          return createCalendarEventRequest(organizationId, data);
        }
        return updateCalendarEventRequest(organizationId, event!.id, data);
      },
      {
        successMessage: mode === "create" ? "Event created." : "Event updated.",
        onSuccess: () => closeDrawer(),
      },
    );
  });

  function submitSchedule() {
    const values = getValues();
    if (!values.title?.trim()) {
      setValue("title", generatedTitle(values), { shouldDirty: true, shouldValidate: false });
    }
    if (!values.owner?.trim()) {
      setValue("owner", "Team", { shouldDirty: true, shouldValidate: false });
    }
    void onSubmit();
  }

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => nextOpen ? onOpenChange(true) : closeDrawer()}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="z-[100] !w-[min(94vw,760px)] !max-w-[760px] gap-0 border-s border-border bg-card p-0 text-foreground sm:!max-w-[760px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {t("form.basics")}
            </p>
            <SheetTitle className="mt-1 text-2xl font-black leading-tight tracking-tight text-foreground">
              {mode === "create" ? t("scheduleBusiness") : t("editSchedule")}
            </SheetTitle>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-xl hover:bg-muted transition-all"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <FormErrorSummary errors={fieldErrors} />
          
          <div className="grid gap-6">
            <section className="space-y-4">
              <ScheduleSectionTitle icon={<CalendarDays className="h-4 w-4" />} title={t("form.scheduledTime")} />

              <TextInput
                label={t("form.scheduleName")}
                name="title"
                value={form.title}
                onChange={(value) => updateField("title", value)}
                error={fieldErrors.title}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <ScheduleSelect
                  label={t("form.dateLabel")}
                  value={form.date}
                  onValueChange={(value) => updateField("date", value)}
                  options={dateOptions.map((value) => ({
                    label: calendarIsoOptionLabel(value),
                    value,
                  }))}
                />
                <ScheduleSelect
                  label={t("form.timeLabel")}
                  value={form.time}
                  onValueChange={(value) => updateField("time", value)}
                  options={timeOptions.map((value) => ({
                    label: formatCalendarTimeLabel(value),
                    value,
                  }))}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <ScheduleSelect
                  label={t("form.typeLabel")}
                  value={form.type}
                  onValueChange={(value) => updateField("type", value as CalendarEventFormValues["type"])}
                  options={customEventTypeValues.map((type) => ({
                    label: t(`types.${type}`),
                    value: type,
                  }))}
                />
                <ScheduleSelect
                  label={t("table.status")}
                  value={form.status}
                  onValueChange={(value) => updateField("status", value as CalendarEventFormValues["status"])}
                  options={(["confirmed", "pending", "draft"] as const).map((status) => ({
                    label: t(`statuses.${status}`),
                    value: status,
                  }))}
                />
                <TextInput
                  label={t("form.ownerLabel")}
                  name="owner"
                  value={form.owner}
                  onChange={(value) => updateField("owner", value)}
                  error={fieldErrors.owner}
                />
              </div>
            </section>

            <section className="border-t border-border pt-5">
              <ContextActionCard ariaLabel={t("form.showAdvancedDetails")}>
                <PropertyRow icon={<User className="h-4 w-4" />} label={t("form.clientLabel")}>
                  <TicketPickerButton
                    label={t("form.clientLabel")}
                    value={selectedClient?.name}
                    icon={<User className="h-4 w-4" />}
                    onClick={() => openPicker("client")}
                    onClear={form.clientId ? () => clearPickerValue("client") : undefined}
                  />
                </PropertyRow>

                <PropertyRow icon={<ClipboardList className="h-4 w-4" />} label={t("form.taskLabel")}>
                  <TicketPickerButton
                    label={t("form.taskLabel")}
                    value={selectedTask?.title}
                    icon={<ClipboardList className="h-4 w-4" />}
                    onClick={() => openPicker("task")}
                    onClear={form.taskId ? () => clearPickerValue("task") : undefined}
                  />
                </PropertyRow>

                <PropertyRow icon={<MapPin className="h-4 w-4" />} label={t("form.locationLabel")}>
                  <TicketPickerButton
                    label={t("form.pickLocation")}
                    value={form.location}
                    icon={<MapPin className="h-4 w-4" />}
                    onClick={() => setIsLocationPickerOpen(true)}
                    onClear={form.location ? () => updateField("location", "") : undefined}
                  />
                </PropertyRow>

                <PropertyRow icon={<AlignLeft className="h-4 w-4" />} label={t("form.notesLabel")}>
                  <Textarea
                    id="calendar-notes"
                    value={form.notes ?? ""}
                    onChange={(event) => updateField("notes", event.target.value)}
                    className="min-h-[100px] w-full rounded-2xl border border-border bg-card transition-colors hover:border-border focus:border-border focus:ring-2 focus:ring-ring dark:focus:ring-white/10"
                  />
                </PropertyRow>
              </ContextActionCard>
            </section>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-border bg-muted/95 p-5 backdrop-blur">
          <Button
            type="button"
            variant="outline"
            onClick={closeDrawer}
            className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest"
          >
            {t("form.cancel")}
          </Button>
          <AppPrimaryButton disabled={operation.isRunning || isSubmitting} onClick={submitSchedule}>
            {mode === "create" ? t("form.createBtn") : t("form.saveBtn")}
          </AppPrimaryButton>
        </div>

        {isLocationPickerOpen && (
          <LocationPickerModal
            closeLabel={t("form.closePicker")}
            confirmLabel={t("form.confirmLocation")}
            currentLocation={form.location ?? ""}
            onClose={() => setIsLocationPickerOpen(false)}
            onSelect={(location) => {
              updateField("location", location);
              setIsLocationPickerOpen(false);
            }}
            searchLabel={t("form.mapSearch")}
            title={t("form.pickLocation")}
          />
        )}

        {picker && pickerConfig && (
          <ContextPickerOverlay
            title={pickerConfig.title}
            searchLabel={t("form.search")}
            searchValue={pickerSearch}
            onSearchChange={setPickerSearch}
            selectedId={pickerConfig.selectedId}
            options={pickerConfig.options}
            loading={pickerConfig.loading}
            emptyLabel={pickerConfig.empty}
            noResultsLabel={t("form.noPickerResults")}
            clearLabel={t("form.clearSelection")}
            closeLabel={t("form.closePicker")}
            onClear={() => clearPickerValue(picker)}
            onSelect={selectPickerValue}
            onClose={() => setPicker(null)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function ScheduleSectionTitle({
  icon,
  title,
}: {
  icon: ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 text-foreground">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {icon}
      </span>
      <p className="text-[10px] font-black uppercase tracking-[0.25em]">
        {title}
      </p>
    </div>
  );
}

function ScheduleSelect({
  label,
  onValueChange,
  options,
  value,
}: {
  label: string;
  onValueChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[9px] font-black uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <Select value={value} onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}>
        <SelectTrigger className="h-12 rounded-2xl border-border bg-muted px-4 text-xs font-black shadow-none transition focus:border-border focus:bg-card">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent align="start" className="rounded-2xl border-border">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="rounded-xl px-3 py-2.5 text-xs font-bold">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

function ContextActionCard({ ariaLabel, children }: { ariaLabel: string; children: ReactNode }) {
  return (
    <div
      aria-label={ariaLabel}
      className="divide-y divide-border"
    >
      {children}
    </div>
  );
}

function PropertyRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          {icon}
        </span>
        <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}

function TicketPickerButton({ label, value, icon, onClick, onClear }: { label: string, value?: string, icon: ReactNode, onClick: () => void, onClear?: () => void }) {
  const active = Boolean(value);
  if (active) {
    return (
      <div className="flex w-full items-start gap-3 rounded-2xl border border-primary bg-primary p-3 text-primary-foreground shadow-sm transition-all hover:bg-primary/90" role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
        <span className="mt-0.5 flex-shrink-0 opacity-70">{icon}</span>
        <span className="flex-1 whitespace-pre-wrap break-words text-xs font-black uppercase tracking-widest leading-relaxed text-start">
          {value}
        </span>
        {onClear && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-red-500 hover:text-white dark:bg-foreground/10 dark:hover:bg-red-500"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-[44px] w-full max-w-sm items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/50 px-3.5 text-left transition-colors hover:border-border hover:bg-muted"
    >
      <span className="flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground dark:group-hover:text-muted-foreground/40">{icon}</span>
      <span className="flex-1 truncate text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-colors group-hover:text-foreground dark:group-hover:text-muted-foreground/40">
        {label}
      </span>
      <Plus className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-foreground dark:group-hover:text-muted-foreground/40" />
    </button>
  );
}




/* ── Entity Quick View Dialog ── */
function EntityQuickViewDialog({
  entity,
  onClose,
}: {
  entity: { id: string; type: "client" | "task"; title: string };
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[70] bg-black/55 supports-backdrop-filter:backdrop-blur-sm"
        containerClassName="z-[80] p-3 sm:p-4"
        className="z-[80] flex max-h-[min(86vh,720px)] w-[min(94vw,560px)] max-w-none flex-col overflow-hidden rounded-[22px] border-border bg-muted p-0 text-foreground shadow-none"
      >
        {entity.type === "client" && <ClientQuickView clientId={entity.id} onClose={onClose} />}
        
        {entity.type === "task" && (
          <div className="p-5 text-center">
            <button onClick={onClose} className="mb-5 flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
            <ClipboardList className="mx-auto mb-4 h-10 w-10 text-muted-foreground/40 dark:text-muted-foreground" />
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Task</p>
            <h2 className="mb-6 text-xl font-black text-foreground">{entity.title}</h2>
            <button onClick={onClose} className="h-11 w-full rounded-2xl border border-border bg-card text-xs font-black uppercase tracking-widest text-muted-foreground transition-colors hover:bg-muted">Close</button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ── Client Quick View ── */
function ClientQuickView({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const account = useAccountContext();
  const organizationId = (account.workspace.status === "ready" && account.workspace.organizationId) || undefined;
  const locale = useLocale();
  const router = useRouter();
  const client = useClientQuery(organizationId, clientId);

  if (!client) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/40" />
      </div>
    );
  }

  const stageColors: Record<string, string> = {
    new: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    qualified: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    review: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    negotiation: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
                    closed: "bg-muted text-muted-foreground border-border",
  };

  return (
    <>
      <div className="flex items-start gap-4 border-b border-border bg-card p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground">Client Profile</p>
          <h2 className="truncate text-base font-black leading-tight text-foreground">{client.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest", stageColors[client.pipelineStage] || stageColors.new)}>
              {client.pipelineStage}
            </span>
            <span className="rounded-lg border border-border bg-muted px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              {client.type}
            </span>
            {client.priority !== "normal" && (
              <span className={cn("rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest", client.priority === "urgent" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800")}>
                {client.priority}
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 border-b border-border bg-card sm:grid-cols-4">
        <div className="min-w-0 border-e border-b border-border px-4 py-3 sm:border-b-0">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground">Phone</p>
          <p className="mt-1 truncate text-xs font-bold text-foreground" dir="ltr">{client.phone || "—"}</p>
        </div>
        <div className="min-w-0 border-b border-border px-4 py-3 sm:border-e sm:border-b-0">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground">Email</p>
          <p className="mt-1 truncate text-xs font-bold text-foreground">{client.contact || "—"}</p>
        </div>
        <div className="min-w-0 border-e border-border px-4 py-3">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground">Budget</p>
          <p className="mt-1 truncate text-xs font-bold text-foreground">{client.budget || "—"}</p>
        </div>
        <div className="min-w-0 px-4 py-3">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground">Interest</p>
          <p className="mt-1 truncate text-xs font-bold text-foreground">{client.assetInterest || "—"}</p>
        </div>
      </div>



      <div className="border-t border-border bg-card p-4">
        <AppPrimaryButton
          className="h-12 w-full rounded-2xl text-xs font-black uppercase tracking-widest shadow-none"
          onClick={() => { onClose(); router.push(`/${locale}/clients/${clientId}`); }}
        >
          <ExternalLink className="me-2 h-4 w-4" />
          Open Full Profile
        </AppPrimaryButton>
      </div>
    </>
  );
}

/* ── Linked Asset Mini Card ── */
function LocationPickerModal({
  closeLabel,
  confirmLabel,
  currentLocation,
  onClose,
  onSelect,
  searchLabel,
  title,
}: {
  closeLabel: string;
  confirmLabel: string;
  currentLocation: string;
  onClose: () => void;
  onSelect: (location: string) => void;
  searchLabel: string;
  title: string;
}) {
  const [selectedLocation, setSelectedLocation] = useState<LocationValue | null>(() =>
    calendarLocationValueFromString(currentLocation),
  );

  return (
    <div className="fixed inset-0 z-[320] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex max-h-[88vh] w-[min(94vw,720px)] flex-col overflow-hidden rounded-[28px] border border-border bg-card text-foreground">
        <div className="flex min-h-0 flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{searchLabel}</p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-foreground">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 overflow-y-auto p-4 [--workspace-border:#27272a] [--workspace-elevated:#18181b] [--workspace-muted:#a1a1aa] [--workspace-panel:#111113]">
            <LocationPicker
              value={selectedLocation}
              onChange={setSelectedLocation}
              label={title}
              placeholder={searchLabel}
            />
          </div>
          <div className="mt-auto flex items-center justify-end gap-2 border-t border-border p-4">
            <Button type="button" variant="outline" onClick={onClose} className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest">
              {closeLabel}
            </Button>
            <Button
              type="button"
              disabled={!selectedLocation}
              onClick={() => {
                if (!selectedLocation) return;
                onSelect(serializeCalendarLocation(selectedLocation));
              }}
              className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContextPickerOverlay({
  title,
  searchLabel,
  searchValue,
  onSearchChange,
  selectedId,
  options,
  loading,
  emptyLabel,
  noResultsLabel,
  clearLabel,
  closeLabel,
  onClear,
  onSelect,
  onClose,
}: {
  title: string;
  searchLabel: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedId: string;
  options: Array<{ id: string; label: string; icon: ReactNode }>;
  loading: boolean;
  emptyLabel: string;
  noResultsLabel: string;
  clearLabel: string;
  closeLabel: string;
  onClear: () => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const visibleOptions = visibleCalendarPickerOptions(options, searchValue);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-border bg-card shadow-none">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{searchLabel}</p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-foreground">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="border-b border-border p-4">
          <label className="relative block">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchLabel}
              className="h-12 w-full rounded-2xl border border-border bg-muted px-10 text-sm font-bold text-foreground outline-none transition focus:border-border focus:bg-card focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </label>
        </div>
        <div className="min-h-48 flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm font-bold text-muted-foreground">
              <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {emptyLabel}
            </div>
          ) : visibleOptions.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-border text-sm font-bold text-muted-foreground">
              {options.length === 0 ? emptyLabel : noResultsLabel}
            </div>
          ) : (
            <div className="grid gap-2">
              {visibleOptions.map((option) => {
                const active = option.id === selectedId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelect(option.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl border p-3 text-start transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:focus-visible:ring-white/25",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-border hover:bg-muted",
                    )}
                  >
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", active ? "bg-primary/15" : "bg-muted text-muted-foreground")}>
                      {option.icon}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-black">{option.label}</span>
                    {active && <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button type="button" variant="outline" onClick={onClear} className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest">
            {clearLabel}
          </Button>
          <Button type="button" onClick={onClose} className="h-10 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest">
            {closeLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}


function BigCalendarSurface({
  currentDate,
  events,
  locale,
  onDateClick,
  onEventClick,
  onNavigate,
  onToday,
  onViewChange,
  view,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  locale: string;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
  onNavigate: (direction: 1 | -1) => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
  view: CalendarView;
}) {
  const mappedEvents = events.map(e => ({
    ...e,
    start: new Date(e.startAt ?? Date.now()),
    end: new Date(e.endAt ?? Date.now()),
  }));

  const viewMap: Record<CalendarView, any> = {
    month: 'month',
    week: 'week',
    day: 'day',
  };

  return (
    <section className="h-[calc(100vh-12rem)] min-h-[600px] overflow-hidden rounded-[24px] border border-border bg-card text-foreground">
      <Calendar
        localizer={localizer}
        events={mappedEvents}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        view={viewMap[view]}
        culture={locale === 'ar' ? 'ar' : 'en'}
        onNavigate={(newDate) => {
           // We'll use our custom toolbar
        }}
        onView={() => {}}
        onSelectEvent={(e) => onEventClick(e as any)}
        onSelectSlot={(slotInfo) => onDateClick(slotInfo.start)}
        selectable
        components={{
          event: ({ event }) => (
            <CalendarEventChip
              event={event as any}
              onClick={() => onEventClick(event as any)}
              variant="compact"
            />
          ),
          toolbar: (toolbarProps) => {
            const { onNavigate: rbcNavigate, onView: rbcView, label, view: currentView } = toolbarProps;
            return (
              <div className="flex flex-col gap-5 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between lg:p-5">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="hidden h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-border bg-muted text-center sm:flex">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {calendarShortMonthLabel(currentDate, locale)}
                    </span>
                    <span className="text-xl font-black leading-none text-foreground">
                      {currentDate.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black uppercase tracking-normal text-foreground">
                      {label}
                    </h2>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
                  <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-border bg-muted p-1">
                    <AriaButton
                      aria-label="Previous calendar period"
                      onPress={() => { rbcNavigate('PREV'); onNavigate(-1); }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rtl:rotate-180"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </AriaButton>
                    <AriaButton
                      onPress={() => { rbcNavigate('TODAY'); onToday(); }}
                      className="h-8 rounded-lg bg-primary px-3 text-[10px] font-black uppercase tracking-widest text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      Today
                    </AriaButton>
                    <AriaButton
                      aria-label="Next calendar period"
                      onPress={() => { rbcNavigate('NEXT'); onNavigate(1); }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rtl:rotate-180"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </AriaButton>
                  </div>

                  <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-border bg-muted p-1 sm:w-auto">
                    {(["month", "week", "day"] as const).map((nextView) => (
                      <AriaButton
                        key={nextView}
                        onPress={() => { rbcView(nextView); onViewChange(nextView); }}
                        className={cn(
                          "h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                          currentView === nextView
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {nextView}
                      </AriaButton>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
        }}
      />
    </section>
  );
}
