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
import { useClientOptionsQuery, useClientQuery, useClientUnitLinksQuery } from "@/domains/clients/api/clients";
import { useClientTaskOptionsQuery } from "@/domains/clients/api/client-tasks";
import { usePropertyOptionsQuery, usePropertyQuery } from "@/domains/properties/api/properties";
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

type PickerKind = "client" | "unit" | "task";

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
  const unitsQuery = usePropertyOptionsQuery(workspaceOrganizationId, { enabled: shouldLoadPickerOptions });
  const tasksQuery = useClientTaskOptionsQuery(workspaceOrganizationId, { enabled: shouldLoadPickerOptions });
  const clients = clientsQuery ?? [];
  const units = unitsQuery ?? [];
  const tasks = tasksQuery ?? [];
  const isContextLoading = shouldLoadPickerOptions && Boolean(workspaceOrganizationId) && (!clientsQuery || !unitsQuery || !tasksQuery);
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
          <UntitledCalendarSurface
            currentDate={currentDate}
            eventsForDate={eventsForDate}
            headerLabel={headerLabel}
            locale={locale}
            onDateClick={setDrawerDate}
            onEventClick={setSelectedEvent}
            onNavigate={navigate}
            onToday={() => setCurrentDate(new Date())}
            onViewChange={setView}
            moreLabel={t("more")}
            statusLabels={{
              confirmed: t("statuses.confirmed"),
              draft: t("statuses.draft"),
              pending: t("statuses.pending"),
            }}
            todayLabel={t("today")}
            view={view}
            viewLabels={{
              day: t("day"),
              month: t("month"),
              week: t("week"),
            }}
            weekDayLabels={weekDayLabels}
          />

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
            units={units}
            tasks={tasks}
            clientsLoading={isContextLoading && !clientsQuery}
            unitsLoading={isContextLoading && !unitsQuery}
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
              units={units}
              tasks={tasks}
              clientsLoading={isContextLoading && !clientsQuery}
              unitsLoading={isContextLoading && !unitsQuery}
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
    <section className="overflow-hidden rounded-[24px] border border-zinc-200/80 bg-white text-zinc-950 dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white">
      <div className="flex flex-col gap-5 border-b border-zinc-100 p-4 dark:border-white/5 lg:flex-row lg:items-center lg:justify-between lg:p-5">
        <div className="flex min-w-0 items-center gap-4">
          <div className="hidden h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-50 text-center dark:border-white/10 dark:bg-white/[0.03] sm:flex">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {calendarShortMonthLabel(currentDate, locale)}
            </span>
            <span className="text-xl font-black leading-none text-zinc-950 dark:text-white">
              {currentDate.getDate()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {viewLabels[view]}
            </p>
            <h2 className="truncate text-lg font-black uppercase tracking-normal text-zinc-950 dark:text-white">
              {headerLabel}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
          <div className="inline-flex w-fit items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-white/10 dark:bg-white/[0.03]">
            <AriaButton
              aria-label="Previous calendar period"
              onPress={() => onNavigate(-1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/10 dark:hover:text-white rtl:rotate-180"
            >
              <ChevronLeft className="h-4 w-4" />
            </AriaButton>
            <AriaButton
              onPress={onToday}
              className="h-8 rounded-lg bg-zinc-950 px-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {todayLabel}
            </AriaButton>
            <AriaButton
              aria-label="Next calendar period"
              onPress={() => onNavigate(1)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white hover:text-zinc-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-white/10 dark:hover:text-white rtl:rotate-180"
            >
              <ChevronRight className="h-4 w-4" />
            </AriaButton>
          </div>

          <div className="grid w-full grid-cols-3 gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 dark:border-white/10 dark:bg-white/[0.03] sm:w-auto">
            {(["month", "week", "day"] as const).map((nextView) => (
              <AriaButton
                key={nextView}
                onPress={() => onViewChange(nextView)}
                className={cn(
                  "h-8 rounded-lg px-3 text-[10px] font-black uppercase tracking-widest transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  view === nextView
                    ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-950 dark:hover:text-white",
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
        <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-white/5">
          {weekDayLabels.map((day) => (
            <div
              key={day}
              className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400"
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
                  "group relative min-h-[132px] border-b border-e border-zinc-100 bg-white p-2 text-start transition hover:bg-zinc-50 dark:border-white/[0.04] dark:bg-[#0A0A0A] dark:hover:bg-white/[0.03]",
                  !isCurrentMonth && "bg-zinc-50/60 text-zinc-400 dark:bg-white/[0.01] dark:text-zinc-600",
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
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                      : "text-zinc-700 group-hover:bg-zinc-100 dark:text-zinc-300 dark:group-hover:bg-white/10",
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
                      className="w-full rounded-lg border border-dashed border-zinc-200 bg-zinc-100 px-2 py-1 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500 transition hover:border-zinc-300 hover:text-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-zinc-400 dark:hover:border-white/20 dark:hover:text-white"
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
      <div className="grid min-w-[860px] grid-cols-7 divide-x divide-zinc-100 rtl:divide-x-reverse dark:divide-white/[0.05]">
        {getCalendarWeekDays(currentDate).map((date) => {
          const dayEvents = eventsForDate(date);
          const isToday = calendarIsoDate(date) === todayIso;

          return (
            <div key={calendarIsoDate(date)} className="min-h-[560px] bg-white dark:bg-[#0A0A0A]">
              <AriaButton
                onPress={() => onDateClick(date)}
                className={cn(
                  "flex w-full items-center justify-between border-b border-zinc-100 px-3 py-3 text-start transition hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/[0.05] dark:hover:bg-white/[0.03]",
                  isToday && "bg-zinc-950 text-white hover:bg-zinc-900 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200",
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
              <div className="pt-4 text-end text-[10px] font-black uppercase tracking-widest text-zinc-300 transition group-hover:text-zinc-500 rtl:text-start">
                {time}
              </div>
              <div
                className={cn(
                  "min-h-[44px] border-t border-zinc-100 dark:border-white/[0.05]",
                  slotEvents.length > 0 && "space-y-2 py-2",
                )}
              >
                {slotEvents.map((event) => (
                  <AriaButton
                    key={event.id}
                    onPress={() => onEventClick(event)}
                    className="flex w-full items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-3 text-start transition hover:border-zinc-300 hover:bg-zinc-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/20 dark:hover:bg-zinc-800"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black uppercase tracking-normal text-zinc-950 dark:text-white">
                        {event.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-zinc-400">
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
        "block w-full rounded-xl border text-start transition hover:brightness-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        calendarEventTypeClassName(event.type),
        variant === "compact"
          ? "px-2 py-1 text-[10px] font-bold"
          : "px-3 py-2.5",
      )}
    >
      {variant === "compact" ? (
        <span className="block truncate">
          {event.time} {event.title}
        </span>
      ) : (
        <span className="block min-w-0">
          <span className="block text-[10px] font-black uppercase tracking-widest opacity-80">
            {event.time}
          </span>
          <span className="mt-1 block truncate text-xs font-bold">
            {event.title}
          </span>
          <span className="mt-1 block truncate text-[10px] font-bold opacity-60">
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
      <DialogContent showCloseButton={false} className="max-w-md p-0 overflow-hidden bg-white dark:bg-[#0A0A0A] border-zinc-100 dark:border-white/5 rounded-[32px] shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-white/5">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              {t("drawer.title")}
            </p>
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white mt-1">
              {calendarLongDayLabel(date, locale)}
            </DialogTitle>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto">
          {events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-40">
              <CalendarDays className="h-8 w-8 text-zinc-300" />
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
                    className="rounded-2xl border border-zinc-100 p-4 hover:border-zinc-300 cursor-pointer transition-all dark:border-white/5 dark:hover:border-white/10"
                    onClick={() => {
                      onClose();
                      onEventClick(ev);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-black uppercase text-zinc-900 dark:text-white">
                          {ev.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400">
                            <Clock className="h-3 w-3" />
                            {ev.time}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] font-bold text-zinc-400">
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
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-50 dark:border-white/5">
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
                        className="p-1.5 text-zinc-300 hover:text-red-500 transition-colors"
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
  const [quickViewEntity, setQuickViewEntity] = useState<{ id: string; type: "client" | "unit" | "task"; title: string } | null>(null);
  const closeEventDialog = () => {
    setQuickViewEntity(null);
    onClose();
  };

  return (
    <>
    <Dialog open onOpenChange={(open) => { if (!open) closeEventDialog(); }}>
      <DialogContent showCloseButton={false} className="max-w-2xl w-[94vw] p-0 overflow-hidden bg-white dark:bg-[#0A0A0A] border-zinc-100 dark:border-white/5 rounded-[32px] shadow-2xl flex flex-col max-h-[90vh]">
        <div
          aria-hidden={Boolean(quickViewEntity)}
          className={cn(
            "flex min-h-0 flex-1 flex-col transition duration-150",
            quickViewEntity && "pointer-events-none select-none opacity-35 blur-[1px]",
          )}
        >
        <div className="p-5 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">
              {t("detail.eyebrow")}
            </p>
            <button
              onClick={closeEventDialog}
              disabled={Boolean(quickViewEntity)}
              className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"
            >
              <X className="h-5 w-5 text-zinc-400" />
            </button>
          </div>
          <DialogTitle className="text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white mt-3">
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
            <p className="text-xs font-black uppercase text-zinc-900 dark:text-white sm:mt-1.5">
              {event.owner}
            </p>
          </PropertyRow>
          
          <PropertyRow icon={<CalendarDays className="h-4 w-4" />} label={t("detail.date")}>
            <p className="text-xs font-black uppercase text-zinc-900 dark:text-white sm:mt-1.5">
              {calendarLongDayYearLabel(eventDate, locale)}
            </p>
          </PropertyRow>
          
          <PropertyRow icon={<Clock className="h-4 w-4" />} label={t("detail.time")}>
            <p className="text-xs font-black uppercase text-zinc-900 dark:text-white sm:mt-1.5">
              {event.time}
            </p>
          </PropertyRow>

          {(event.clientName || event.clientId) && (
            <PropertyRow icon={<User className="h-4 w-4" />} label={t("form.clientLabel")}>
              <button 
                type="button"
                onClick={() => setQuickViewEntity({ id: event.clientId || "", type: "client", title: event.clientName || event.clientId || "" })}
                className="flex w-full items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors text-start"
              >
                <span className="flex-1 whitespace-pre-wrap break-words text-xs font-black uppercase tracking-widest leading-relaxed">
                  {event.clientName ?? event.clientId}
                </span>
                <Eye className="h-3.5 w-3.5 text-zinc-400 mt-0.5" />
              </button>
            </PropertyRow>
          )}

          {(event.unitTitle || event.unitId) && (
            <PropertyRow icon={<Building2 className="h-4 w-4" />} label={t("form.unitLabel")}>
              <button 
                type="button"
                onClick={() => setQuickViewEntity({ id: event.unitId || event.propertyId || "", type: "unit", title: event.unitTitle || event.unitId || "" })}
                className="flex w-full items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors text-start"
              >
                <span className="flex-1 whitespace-pre-wrap break-words text-xs font-black uppercase tracking-widest leading-relaxed">
                  {event.unitTitle ?? event.unitId}
                </span>
                <Eye className="h-3.5 w-3.5 text-zinc-400 mt-0.5" />
              </button>
            </PropertyRow>
          )}

          {event.taskId && (
            <PropertyRow icon={<ClipboardList className="h-4 w-4" />} label={t("form.taskLabel")}>
              <button 
                type="button"
                onClick={() => setQuickViewEntity({ id: event.taskId || "", type: "task", title: event.taskId || "" })}
                className="flex w-full items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-zinc-900 dark:border-white/10 dark:bg-white/[0.02] dark:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors text-start"
              >
                <span className="flex-1 whitespace-pre-wrap break-words text-xs font-black uppercase tracking-widest leading-relaxed">
                  {event.taskId}
                </span>
                <Eye className="h-3.5 w-3.5 text-zinc-400 mt-0.5" />
              </button>
            </PropertyRow>
          )}

          {event.location && (
            <PropertyRow icon={<MapPin className="h-4 w-4" />} label={t("form.locationLabel")}>
              <p className="whitespace-pre-wrap break-words text-xs font-bold leading-5 text-zinc-900 dark:text-white sm:mt-1">
                {event.location}
              </p>
            </PropertyRow>
          )}

          {event.notes && (
            <PropertyRow icon={<AlignLeft className="h-4 w-4" />} label={t("form.notesLabel")}>
              <p className="whitespace-pre-wrap break-words text-xs font-bold leading-5 text-zinc-900 dark:text-white sm:mt-1">
                {event.notes}
              </p>
            </PropertyRow>
          )}
        </div>

        <div className="p-5 border-t border-zinc-100 dark:border-white/5 space-y-3">
            <Button
              variant="outline"
              onClick={() => onEditClick(event)}
              disabled={Boolean(quickViewEntity)}
              className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-100 dark:border-white/10"
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
  clients,
  units,
  tasks,
  clientsLoading,
  unitsLoading,
  tasksLoading,
}: {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: CalendarEvent;
  organizationId?: string;
  clients: Array<{ id: string; name: string }>;
  units: Array<{ id: string; title: string }>;
  tasks: Array<{ id: string; title: string; clientId: string }>;
  clientsLoading: boolean;
  unitsLoading: boolean;
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
    type: event?.type ?? "visit",
    status: event?.status ?? "confirmed",
    clientId: event?.clientId ?? "",
    unitId: event?.unitId ?? event?.propertyId ?? "",
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
    resolver: zodResolver(calendarEventSchema),
    defaultValues,
  });
  const form = useWatch({ control }) as CalendarEventFormValues;
  const fieldErrors = Object.fromEntries(
    Object.entries(errors).map(([key, error]) => [key, error?.message]),
  ) as Record<keyof CalendarEventFormValues, string | undefined>;

  const selectedClient = clients.find((client) => client.id === form.clientId);
  const selectedUnit = units.find((unit) => unit.id === (form.unitId || form.propertyId));
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
        unit: {
          title: t("form.chooseUnit"),
          empty: t("form.noUnits"),
          loading: unitsLoading,
          options: units.map((unit) => ({ id: unit.id, label: unit.title, icon: <Building2 className="h-4 w-4" /> })),
          selectedId: form.unitId || form.propertyId || "",
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
    if (picker === "unit") {
      updateField("unitId", id);
      updateField("propertyId", id);
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
    if (kind === "unit") {
      updateField("unitId", "");
      updateField("propertyId", "");
    }
    if (kind === "task") updateField("taskId", "");
  }

  function generatedTitle(values: CalendarEventFormValues) {
    const typeLabel = t(`types.${values.type || "visit"}`);
    const context = selectedClient?.name || selectedUnit?.title || values.location?.trim();
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
        className="z-[100] !w-[min(94vw,760px)] !max-w-[760px] gap-0 border-s border-zinc-200 bg-white p-0 text-zinc-950 dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white sm:!max-w-[760px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5 dark:border-white/5">
          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              {t("form.basics")}
            </p>
            <SheetTitle className="mt-1 text-2xl font-black leading-tight tracking-tight text-zinc-900 dark:text-white">
              {mode === "create" ? t("scheduleBusiness") : t("editSchedule")}
            </SheetTitle>
          </div>
          <button
            onClick={closeDrawer}
            className="p-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"
          >
            <X className="h-5 w-5 text-zinc-400" />
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

            <section className="border-t border-zinc-100 pt-5 dark:border-white/5">
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

                <PropertyRow icon={<Building2 className="h-4 w-4" />} label={t("form.unitLabel")}>
                  <TicketPickerButton
                    label={t("form.unitLabel")}
                    value={selectedUnit?.title}
                    icon={<Building2 className="h-4 w-4" />}
                    onClick={() => openPicker("unit")}
                    onClear={form.unitId || form.propertyId ? () => clearPickerValue("unit") : undefined}
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
                    className="min-h-[100px] w-full rounded-2xl border-zinc-200 bg-white transition-colors hover:border-zinc-300 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-[#0A0A0A] dark:hover:border-white/20 dark:focus:border-white/30 dark:focus:ring-white/10"
                  />
                </PropertyRow>
              </ContextActionCard>
            </section>
          </div>
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-zinc-100 bg-zinc-50/95 p-5 backdrop-blur dark:border-white/5 dark:bg-[#0A0A0A]/95">
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
    <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-50 text-zinc-400 dark:bg-white/5">
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
      <span className="mb-2 block text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-300">
        {label}
      </span>
      <Select value={value} onValueChange={(nextValue) => nextValue && onValueChange(nextValue)}>
        <SelectTrigger className="h-12 rounded-2xl border-zinc-200 bg-zinc-50 px-4 text-xs font-black shadow-none transition focus:border-zinc-300 focus:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:focus:border-white/20 dark:focus:bg-white/[0.07]">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent align="start" className="rounded-2xl border-zinc-200 dark:border-white/10">
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
      className="divide-y divide-zinc-100 dark:divide-white/5"
    >
      {children}
    </div>
  );
}

function PropertyRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center">
      <div className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-50 text-zinc-500 dark:bg-white/5 dark:text-zinc-300">
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
      <div className="flex w-full items-start gap-3 rounded-2xl border border-zinc-900 bg-zinc-900 p-3 text-white shadow-sm transition-all hover:bg-zinc-800 dark:border-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100" role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
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
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-red-500 hover:text-white dark:bg-zinc-900/10 dark:hover:bg-red-500"
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
      className="group flex min-h-[44px] w-full max-w-sm items-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 px-3.5 text-left transition-colors hover:border-zinc-400 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20 dark:hover:bg-white/[0.04]"
    >
      <span className="flex-shrink-0 text-zinc-400 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300">{icon}</span>
      <span className="flex-1 truncate text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-colors group-hover:text-zinc-700 dark:group-hover:text-zinc-300">
        {label}
      </span>
      <Plus className="ml-auto h-3.5 w-3.5 text-zinc-400 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
    </button>
  );
}




/* ── Entity Quick View Dialog ── */
function EntityQuickViewDialog({
  entity,
  onClose,
}: {
  entity: { id: string; type: "client" | "unit" | "task"; title: string };
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        showCloseButton={false}
        overlayClassName="z-[70] bg-black/55 supports-backdrop-filter:backdrop-blur-sm"
        containerClassName="z-[80] p-3 sm:p-4"
        className="z-[80] flex max-h-[min(86vh,720px)] w-[min(94vw,560px)] max-w-none flex-col overflow-hidden rounded-[22px] border-zinc-200 bg-zinc-50 p-0 text-zinc-950 shadow-none dark:border-white/10 dark:bg-[#111111] dark:text-white"
      >
        {entity.type === "client" && <ClientQuickView clientId={entity.id} onClose={onClose} />}
        {entity.type === "unit" && <UnitQuickView propertyId={entity.id} onClose={onClose} />}
        {entity.type === "task" && (
          <div className="p-5 text-center">
            <button onClick={onClose} className="mb-5 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition hover:bg-white hover:text-zinc-900 dark:border-white/10 dark:hover:bg-white/5 dark:hover:text-white">
              <X className="h-4 w-4" />
            </button>
            <ClipboardList className="mx-auto mb-4 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Task</p>
            <h2 className="mb-6 text-xl font-black text-zinc-900 dark:text-white">{entity.title}</h2>
            <button onClick={onClose} className="h-11 w-full rounded-2xl border border-zinc-200 bg-white text-xs font-black uppercase tracking-widest text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-400 dark:hover:bg-white/5">Close</button>
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
  const unitLinks = useClientUnitLinksQuery(organizationId, clientId);

  if (!client) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
      </div>
    );
  }

  const stageColors: Record<string, string> = {
    new: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    qualified: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    viewing: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    negotiation: "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
    closed: "bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10",
  };

  return (
    <>
      <div className="flex items-start gap-4 border-b border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-[#111111]">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-lg font-black text-white dark:bg-white dark:text-zinc-950">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">Client Profile</p>
          <h2 className="truncate text-base font-black leading-tight text-zinc-950 dark:text-white">{client.name}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest", stageColors[client.pipelineStage] || stageColors.new)}>
              {client.pipelineStage}
            </span>
            <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              {client.type}
            </span>
            {client.priority !== "normal" && (
              <span className={cn("rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest", client.priority === "urgent" ? "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" : "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800")}>
                {client.priority}
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/10 dark:hover:bg-white/5 dark:hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 border-b border-zinc-200 bg-white dark:border-white/10 dark:bg-[#111111] sm:grid-cols-4">
        <div className="min-w-0 border-e border-b border-zinc-100 px-4 py-3 dark:border-white/5 sm:border-b-0">
          <Phone className="h-4 w-4 text-zinc-400" />
          <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-zinc-400">Phone</p>
          <p className="mt-1 truncate text-xs font-bold text-zinc-950 dark:text-white" dir="ltr">{client.phone || "—"}</p>
        </div>
        <div className="min-w-0 border-b border-zinc-100 px-4 py-3 dark:border-white/5 sm:border-e sm:border-b-0">
          <Mail className="h-4 w-4 text-zinc-400" />
          <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-zinc-400">Email</p>
          <p className="mt-1 truncate text-xs font-bold text-zinc-950 dark:text-white">{client.contact || "—"}</p>
        </div>
        <div className="min-w-0 border-e border-zinc-100 px-4 py-3 dark:border-white/5">
          <DollarSign className="h-4 w-4 text-zinc-400" />
          <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-zinc-400">Budget</p>
          <p className="mt-1 truncate text-xs font-bold text-zinc-950 dark:text-white">{client.budget || "—"}</p>
        </div>
        <div className="min-w-0 px-4 py-3">
          <Building2 className="h-4 w-4 text-zinc-400" />
          <p className="mt-2 text-[8px] font-black uppercase tracking-widest text-zinc-400">Interest</p>
          <p className="mt-1 truncate text-xs font-bold text-zinc-950 dark:text-white">{client.propertyInterest || "—"}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">Linked Properties</p>
        {!unitLinks || unitLinks.length === 0 ? (
          <div className="flex h-20 items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white text-xs font-bold text-zinc-400 dark:border-white/10 dark:bg-white/[0.02]">
            No linked properties
          </div>
        ) : (
          <div className="space-y-2">
            {unitLinks.map((entry) => (
              <LinkedUnitCard key={entry.link._id || entry.link.propertyId} propertyId={entry.link.propertyId} status={entry.link.status} locale={locale} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#111111]">
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

/* ── Linked Unit Mini Card ── */
function LinkedUnitCard({ propertyId, status, locale }: { propertyId: string; status: string; locale: string }) {
  const account = useAccountContext();
  const organizationId = (account.workspace.status === "ready" && account.workspace.organizationId) || undefined;
  const property = usePropertyQuery(organizationId, propertyId);

  if (!property) {
    return (
      <div className="flex h-16 items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50/50 dark:border-white/5 dark:bg-white/[0.02]">
        <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    interested: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    shortlisted: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    viewing: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    offer: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    rejected: "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <Link
      href={`/${locale}/properties/${property.reference || propertyId}`}
      className="group flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 transition-colors hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/15"
    >
      <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-white/5">
        {property.coverImageUrl ? (
          <img src={property.coverImageUrl} alt={property.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black text-zinc-900 dark:text-white truncate">{property.title}</p>
        <p className="text-[10px] font-bold text-zinc-400 truncate mt-0.5">{property.project} · {property.city}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className={cn("rounded-md px-1.5 py-px text-[8px] font-black uppercase tracking-widest", statusColors[status] || statusColors.interested)}>
            {status}
          </span>
          {property.price && (
            <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">EGP {property.price}</span>
          )}
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-300 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
    </Link>
  );
}

/* ── Unit/Property Quick View ── */
function UnitQuickView({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const account = useAccountContext();
  const organizationId = (account.workspace.status === "ready" && account.workspace.organizationId) || undefined;
  const locale = useLocale();
  const router = useRouter();
  const property = usePropertyQuery(organizationId, propertyId);

  if (!property) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    available: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    sold: "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    reserved: "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    pending: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    draft: "bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-white/5 dark:text-zinc-400 dark:border-white/10",
  };

  return (
    <>
      <div className="flex items-start gap-4 border-b border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-[#111111]">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-100 dark:bg-white/5">
          {property.coverImageUrl ? (
            <img src={property.coverImageUrl} alt={property.title} className="h-full w-full object-cover" />
          ) : (
            <Building2 className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400">Property</p>
          <h2 className="text-base font-black leading-tight text-zinc-950 dark:text-white">{property.title}</h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={cn("rounded-lg border px-2 py-0.5 text-[9px] font-black uppercase tracking-widest", statusColors[property.status] || statusColors.draft)}>
              {property.status}
            </span>
            <span className="rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400">
              {property.purpose}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-400 transition hover:bg-zinc-50 hover:text-zinc-950 dark:border-white/10 dark:hover:bg-white/5 dark:hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 border-b border-zinc-200 bg-white dark:border-white/10 dark:bg-[#111111] sm:grid-cols-4">
        <div className="min-w-0 border-e border-b border-zinc-100 px-4 py-3 dark:border-white/5 sm:border-b-0">
          <DollarSign className="h-4 w-4 text-zinc-400 mb-1" />
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Price</p>
          <p className="mt-1 truncate text-xs font-black text-zinc-950 dark:text-white">{property.price || "—"}</p>
        </div>
        <div className="min-w-0 border-b border-zinc-100 px-4 py-3 dark:border-white/5 sm:border-e sm:border-b-0">
          <Ruler className="h-4 w-4 text-zinc-400 mb-1" />
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Area</p>
          <p className="mt-1 truncate text-xs font-black text-zinc-950 dark:text-white">{property.area || "—"}</p>
        </div>
        <div className="min-w-0 border-e border-zinc-100 px-4 py-3 dark:border-white/5">
          <BedDouble className="h-4 w-4 text-zinc-400 mb-1" />
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Beds</p>
          <p className="mt-1 truncate text-xs font-black text-zinc-950 dark:text-white">{property.bedrooms || "—"}</p>
        </div>
        <div className="min-w-0 px-4 py-3">
          <MapPin className="h-4 w-4 text-zinc-400 mb-1" />
          <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">City</p>
          <p className="mt-1 truncate text-xs font-black text-zinc-950 dark:text-white">{property.city || "—"}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02]">
          <Building2 className="h-4 w-4 text-zinc-400" />
          <div className="min-w-0">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Project</p>
            <p className="truncate text-xs font-bold text-zinc-950 dark:text-white">{property.project || "—"}</p>
          </div>
        </div>
        {property.description && (
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 mb-2">Description</p>
            <p className="whitespace-pre-wrap text-xs font-bold leading-5 text-zinc-600 dark:text-zinc-300">{property.description}</p>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-[#111111]">
        <AppPrimaryButton
          className="h-12 w-full rounded-2xl text-xs font-black uppercase tracking-widest shadow-none"
          onClick={() => { onClose(); router.push(`/${locale}/properties/${property.reference || propertyId}`); }}
        >
          <ExternalLink className="me-2 h-4 w-4" />
          Open Full Property
        </AppPrimaryButton>
      </div>
    </>
  );
}

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
      <div className="flex max-h-[88vh] w-[min(94vw,720px)] flex-col overflow-hidden rounded-[28px] border border-zinc-200 bg-white text-zinc-950 dark:border-white/10 dark:bg-[#0A0A0A] dark:text-white">
        <div className="flex min-h-0 flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5 dark:border-white/10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{searchLabel}</p>
              <h3 className="mt-2 text-xl font-black tracking-tight text-zinc-900 dark:text-white">{title}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
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
          <div className="mt-auto flex items-center justify-end gap-2 border-t border-zinc-100 p-4 dark:border-white/10">
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
      <div className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] border border-zinc-200 bg-white shadow-none dark:border-white/10 dark:bg-[#0A0A0A]">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 p-5 dark:border-white/10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{searchLabel}</p>
            <h3 className="mt-2 text-xl font-black tracking-tight text-zinc-900 dark:text-white">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="border-b border-zinc-100 p-4 dark:border-white/10">
          <label className="relative block">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" aria-hidden="true" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchLabel}
              className="h-12 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-10 text-sm font-bold text-zinc-900 outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-900/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-white/30 dark:focus:bg-white/[0.07] dark:focus:ring-white/10"
              autoFocus
            />
          </label>
        </div>
        <div className="min-h-48 flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm font-bold text-zinc-400">
              <Loader2 className="me-2 h-4 w-4 animate-spin" aria-hidden="true" />
              {emptyLabel}
            </div>
          ) : visibleOptions.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-zinc-200 text-sm font-bold text-zinc-400 dark:border-white/10">
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
                      "flex items-center gap-3 rounded-2xl border p-3 text-start transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 dark:focus-visible:ring-white/25",
                      active
                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                        : "border-zinc-100 bg-white text-zinc-900 hover:border-zinc-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:bg-white/[0.06]",
                    )}
                  >
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", active ? "bg-white/15 dark:bg-zinc-900/10" : "bg-zinc-100 text-zinc-500 dark:bg-white/10 dark:text-zinc-300")}>
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
        <div className="flex items-center justify-end gap-2 border-t border-zinc-100 p-4 dark:border-white/10">
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
