"use client";

import {
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CalendarDays,
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
  CheckCircle2,
  Link2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  Filter,
  Plus,
} from "lucide-react";
import {
  AppPrimaryButton,
} from "@/components/shared";
import { useCalendarStore } from "@/domains/calendar";
import type { CalendarEvent } from "../store/calendar.types";
import {
  calendarEventSchema,
  type CalendarEventFormValues,
} from "../validation/calendar.schema";
import { format, parse, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { QentrahCalendarKit } from "./qentrah-calendar-kit";
import type { CalendarEvent as CalendarKitEvent } from "@qentrah/calendar-kit";
import { useAccountContext } from "@/domains/auth";
import {
  calendarEventTone,
  calendarEventTypeClassName,
  calendarIsoDate,
  calendarLongDayLabel,
  calendarLongDayYearLabel,
  calendarScheduleTitle,
  calendarTasksForClient,
  calendarHeaderLabel,
  customEventTypeValues,
  visibleCalendarRange,
} from "@/domains/calendar/calendar-view-model";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import { useClientTaskOptionsQuery } from "@/domains/clients/api/client-tasks";
import { useCalendarEventMutations } from "../hooks";
import { useCalendarDrawer } from "../hooks/use-calendar-drawer";
import { useCalendarIndexRangeQueryResult } from "../api/calendar";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useOperationState } from "@/lib/utils/operation-state";
import {
  FormErrorSummary,
  HttpQueryState,
  WorkspaceQueryState,
} from "@/components/shared/crud-ui";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { OwnerPicker } from "@/components/ui/owner-picker";
import { CustomSelect } from "@/components/ui/custom-select";
import { EventTypeBadge, EventStatusBadge } from "@/components/ui/event-badge";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
type PickerKind = "client" | "task";
type DrawerView = "read" | "edit";

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
  const projectId = useCurrentProjectId();
  const eventsQuery = useCalendarIndexRangeQueryResult(
    workspaceOrganizationId,
    range.startAt,
    range.endAt,
    projectId,
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
  const deleteOp = useOperationState({ errorMessage: "Delete failed." });

  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const isFiltering = Boolean(filterStartDate && filterEndDate);

  const effectiveRange = useMemo(() => {
    if (isFiltering && filterStartDate && filterEndDate) {
      return {
        startAt: new Date(filterStartDate + "T00:00:00").getTime(),
        endAt: new Date(filterEndDate + "T23:59:59").getTime(),
      };
    }
    return range;
  }, [isFiltering, filterStartDate, filterEndDate, range]);

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
          {/* ── Top Header Bar ── */}
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-card px-5 py-3">
            {/* Left: Title + Navigation */}
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

            {/* Right: View Toggle + Add + Filter */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Filter toggle */}
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

              {/* View toggle */}
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

              {/* Add Event */}
              <AppPrimaryButton onClick={() => drawer.openCreate()} className="h-8 px-3 text-xs">
                <Plus className="me-1.5 h-3.5 w-3.5" />
                {t("add")}
              </AppPrimaryButton>
            </div>
          </div>

          {/* ── Filter Bar (collapsible) ── */}
          {isFilterOpen && (
            <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card/50 px-5 py-2.5">
              <CalendarDatePicker
                value={filterStartDate}
                onChange={setFilterStartDate}
                locale={locale}
              />
              <span className="text-xs text-muted-foreground">{locale === "ar" ? "←" : "→"}</span>
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

/* ── Event Drawer (read / edit / create) ── */
function EventDrawer({
  mode,
  view: drawerView,
  open,
  onClose,
  onEdit,
  event,
  initialDate,
  organizationId,
  clients = [],
  tasks = [],
  clientsLoading,
  tasksLoading,
  onDelete,
  onSave,
}: {
  mode: "create" | "edit";
  view: DrawerView;
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  event?: CalendarEvent;
  initialDate?: Date;
  organizationId?: string;
  clients: Array<{ id: string; name: string }>;
  tasks: Array<{ id: string; title: string; clientId: string }>;
  clientsLoading: boolean;
  tasksLoading: boolean;
  onDelete: () => void;
  onSave: (data: CalendarEventFormValues) => void;
}) {
  const t = useTranslations("Calendar");
  const locale = useLocale();
  const isRead = mode === "edit" && drawerView === "read" && Boolean(event);
  const isEdit = mode === "edit" && drawerView === "edit";
  const isCreate = mode === "create";

  const today = useMemo(() => new Date(), []);
  const defaultDate = initialDate
    ? format(initialDate, "yyyy-MM-dd")
    : `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const defaultTime = initialDate
    ? format(initialDate, "HH:mm")
    : "10:00";

  const defaultValues: CalendarEventFormValues = {
    title: event?.title ?? "",
    owner: event?.owner ?? "Team",
    date: event?.date ?? defaultDate,
    time: event?.time ?? defaultTime,
    endDate: event?.endDate ?? "",
    endTime: event?.endTime ?? "",
    isMultiDay: event?.isMultiDay ?? false,
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
  const [quickTaskTitle, setQuickTaskTitle] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
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

  const selectedClient = clients.find((c) => c.id === form.clientId);
  const selectedTask = tasks.find((tk) => tk.id === form.taskId);
  const filteredTasks = calendarTasksForClient(tasks, form.clientId);

  const pickerConfig = picker
    ? {
        client: {
          title: t("form.chooseClient"),
          empty: t("form.noClients"),
          loading: clientsLoading,
          options: clients.map((c) => ({ id: c.id, label: c.name, icon: <User className="h-4 w-4" /> })),
          selectedId: form.clientId ?? "",
        },
        task: {
          title: t("form.chooseTask"),
          empty: t("form.noTasks"),
          loading: tasksLoading,
          options: filteredTasks.map((tk) => ({ id: tk.id, label: tk.title, icon: <ClipboardList className="h-4 w-4" /> })),
          selectedId: form.taskId ?? "",
        },
      }[picker]
    : null;

  function closeDrawer() {
    reset(defaultValues);
    setPicker(null);
    setPickerSearch("");
    setQuickTaskTitle("");
    setIsCreatingTask(false);
    operation.clearError();
    onClose();
  }

  function updateField<TKey extends keyof CalendarEventFormValues>(key: TKey, value: CalendarEventFormValues[TKey]) {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    operation.clearError();
  }

  function openPicker(kind: PickerKind) { setPicker(kind); setPickerSearch(""); }
  function selectPickerValue(id: string) {
    if (picker === "client") updateField("clientId", id);
    if (picker === "task") {
      const task = tasks.find((i) => i.id === id);
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
      () => onSave(data),
      { successMessage: mode === "create" ? "Event created." : "Event updated.", onSuccess: closeDrawer },
    );
  });

  function submitSchedule() {
    const values = getValues();
    if (!values.title?.trim()) setValue("title", generatedTitle(values), { shouldDirty: true, shouldValidate: false });
    if (!values.owner?.trim()) setValue("owner", "Team", { shouldDirty: true, shouldValidate: false });
    void onSubmit();
  }

  const title = isCreate ? t("scheduleBusiness") : isRead ? event?.title ?? "" : t("editSchedule");

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) closeDrawer(); }}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="z-[100] !w-[min(96vw,860px)] !max-w-[860px] gap-0 border-s border-border bg-background p-0 text-foreground sm:!max-w-[860px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-8 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <SheetTitle className="text-lg font-bold text-foreground truncate">
              {title}
            </SheetTitle>
            {isRead && event && (
              <div className="flex items-center gap-2 shrink-0">
                <EventTypeBadge type={event.type} />
                <EventStatusBadge status={event.status} />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isRead && (
              <button
                onClick={onEdit}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                {t("detail.edit")}
              </button>
            )}
            <button
              onClick={closeDrawer}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Read View ── */}
        {isRead && event && (
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="space-y-5">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">{t("form.titleLabel")}</span>
                <p className="text-sm font-medium text-foreground">{event.title}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">{t("form.dateLabel")}</span>
                  <p className="text-sm font-medium text-foreground">{calendarLongDayYearLabel(new Date(event.date + "T00:00:00"), locale)}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">{t("form.timeLabel")}</span>
                  <p className="text-sm font-medium text-foreground">{event.time}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">{t("form.typeLabel")}</span>
                  <p className="text-sm font-medium text-foreground capitalize">{t(`types.${event.type}`)}</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">{t("table.status")}</span>
                  <p className="text-sm font-medium text-foreground capitalize">{t(`statuses.${event.status}`)}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">{t("form.ownerLabel")}</span>
                <p className="text-sm font-medium text-foreground">{event.owner}</p>
              </div>
              {event.location && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">{t("form.locationLabel")}</span>
                  <p className="text-sm font-medium text-foreground">{event.location}</p>
                </div>
              )}
              {event.notes && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">{t("form.notesLabel")}</span>
                  <div className="text-sm text-foreground prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: event.notes }} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Edit / Create View ── */}
        {!isRead && (
          <div className="flex-1 overflow-y-auto px-8 py-5">
            <FormErrorSummary errors={fieldErrors} />
            <div className="space-y-6">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">{t("form.scheduleName")}</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder={t("form.titlePlaceholder")}
                  className="h-10 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10"
                />
                {fieldErrors.title && <p className="text-xs font-medium text-red-500">{fieldErrors.title}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <CalendarDatePicker
                  value={form.date}
                  onChange={(v) => updateField("date", v)}
                  endDate={form.isMultiDay ? form.endDate : undefined}
                  onEndDateChange={(v) => updateField("endDate", v)}
                  label={t("form.dateLabel")}
                  error={fieldErrors.date}
                />
                <TimePicker
                  value={form.time}
                  onChange={(v) => updateField("time", v)}
                  label={t("form.timeLabel")}
                  error={fieldErrors.time}
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => { updateField("isMultiDay", !form.isMultiDay); if (!form.isMultiDay) updateField("endDate", form.date); }}
                  className={cn("relative h-5 w-9 rounded-full transition-colors", form.isMultiDay ? "bg-foreground" : "bg-border")}
                >
                  <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-background transition-transform", form.isMultiDay ? "left-[18px]" : "left-0.5")} />
                </button>
                <span className="text-xs font-semibold text-muted-foreground">Multi-day event</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <CustomSelect
                  value={form.type}
                  onChange={(v) => updateField("type", v as CalendarEventFormValues["type"])}
                  options={customEventTypeValues.map((ty) => ({ value: ty, label: t(`types.${ty}`) }))}
                  label={t("form.typeLabel")}
                />
                <CustomSelect
                  value={form.status}
                  onChange={(v) => updateField("status", v as CalendarEventFormValues["status"])}
                  options={(["confirmed", "pending", "draft"] as const).map((s) => ({ value: s, label: t(`statuses.${s}`) }))}
                  label={t("table.status")}
                />
              </div>

              <OwnerPicker
                value={form.owner}
                onChange={(v) => updateField("owner", v)}
                options={[{ id: "team", name: "Team" }]}
                label={t("form.ownerLabel")}
                error={fieldErrors.owner}
              />

              <div className="border-t border-border" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">{t("form.clientLabel")}</span>
                  <TicketPickerButton label={t("form.clientLabel")} value={selectedClient?.name} icon={<User className="h-4 w-4" />} onClick={() => openPicker("client")} onClear={form.clientId ? () => clearPickerValue("client") : undefined} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">{t("form.taskLabel")}</span>
                    <button type="button" onClick={() => setIsCreatingTask(true)} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-colors">+ {t("form.quickTask")}</button>
                  </div>
                  {isCreatingTask ? (
                    <div className="flex items-center gap-2">
                      <input type="text" value={quickTaskTitle} onChange={(e) => setQuickTaskTitle(e.target.value)} placeholder={t("form.taskPlaceholder")} autoFocus className="h-10 flex-1 rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-foreground/20" onKeyDown={(e) => { if (e.key === "Enter" && quickTaskTitle.trim()) { setIsCreatingTask(false); setQuickTaskTitle(""); } if (e.key === "Escape") { setIsCreatingTask(false); setQuickTaskTitle(""); } }} />
                      <button type="button" onClick={() => { if (quickTaskTitle.trim()) { setIsCreatingTask(false); setQuickTaskTitle(""); } }} className="h-10 rounded-xl bg-foreground px-3 text-[10px] font-semibold text-background">{t("form.add")}</button>
                    </div>
                  ) : (
                    <TicketPickerButton label={t("form.taskLabel")} value={selectedTask?.title} icon={<ClipboardList className="h-4 w-4" />} onClick={() => openPicker("task")} onClear={form.taskId ? () => clearPickerValue("task") : undefined} />
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">{t("form.locationLabel")}</span>
                <div className="relative">
                  <MapPin className={cn("pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60", locale === "ar" ? "right-3" : "left-3")} />
                  <input type="text" value={form.location ?? ""} onChange={(e) => updateField("location", e.target.value)} placeholder={t("form.locationPlaceholder")} className={cn("h-10 w-full rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10", locale === "ar" ? "pr-9 pl-3" : "pl-9 pr-3")} />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground">{t("form.notesLabel")}</span>
                <RichTextEditor value={form.notes ?? ""} onChange={(v) => updateField("notes", v)} placeholder={t("form.notesPlaceholder")} minHeight="100px" />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between border-t border-border bg-background/95 px-8 py-4 backdrop-blur-sm">
          <div>
            {isRead && (
              <Button
                type="button"
                variant="ghost"
                onClick={onDelete}
                className="h-10 px-4 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("delete.btn")}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={closeDrawer} className="h-10 px-5 text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("form.cancel")}
            </Button>
            {!isRead && (
              <AppPrimaryButton disabled={operation.isRunning || isSubmitting} onClick={submitSchedule}>
                {mode === "create" ? t("form.createBtn") : t("form.saveBtn")}
              </AppPrimaryButton>
            )}
          </div>
        </div>

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

/* ── Ticket Picker Button ── */
function TicketPickerButton({
  label,
  value,
  icon,
  onClick,
  onClear,
}: {
  label: string;
  value?: string;
  icon: ReactNode;
  onClick: () => void;
  onClear?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 w-full items-center gap-2.5 rounded-xl border px-3 text-left text-sm transition-colors hover:bg-muted/50",
        value ? "border-border bg-card" : "border-dashed border-border bg-muted/50",
      )}
    >
      <span className={cn("shrink-0", value ? "text-muted-foreground" : "text-muted-foreground/60")}>{icon}</span>
      <span className={cn("flex-1 truncate", value ? "text-foreground font-medium" : "text-muted-foreground")}>{value || label}</span>
      {onClear && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onClear(); }}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onClear(); } }}
          className="shrink-0 text-muted-foreground/50 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}

/* ── Context Picker Overlay ── */
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
  onSearchChange: (v: string) => void;
  selectedId: string;
  options: Array<{ id: string; label: string; icon?: ReactNode }>;
  loading: boolean;
  emptyLabel: string;
  noResultsLabel: string;
  clearLabel: string;
  closeLabel: string;
  onClear: () => void;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const filtered = options.filter((o) => o.label.toLowerCase().includes(searchValue.toLowerCase()));
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[70vh] w-full max-w-md flex-col overflow-hidden rounded-[24px] border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"><X className="h-4 w-4" /></button>
        </div>
        <div className="border-b border-border px-4 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={searchValue} onChange={(e) => onSearchChange(e.target.value)} placeholder={searchLabel} className="h-10 w-full rounded-xl border border-border bg-muted ps-9 text-sm font-medium text-foreground outline-none focus:border-foreground/20" autoFocus />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm font-medium text-muted-foreground">{searchValue ? noResultsLabel : emptyLabel}</div>
          ) : (
            <div className="grid gap-1.5">
              {selectedId && (
                <button type="button" onClick={onClear} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-3 text-left text-sm font-medium text-muted-foreground hover:bg-muted transition-colors">
                  {clearLabel}
                </button>
              )}
              {filtered.map((option) => {
                const isActive = option.id === selectedId;
                return (
                  <button key={option.id} type="button" onClick={() => onSelect(option.id)} className={cn("flex items-center gap-3 rounded-xl border p-3 text-left text-sm font-medium transition", isActive ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:bg-muted")}>
                    {option.icon && <span className="shrink-0">{option.icon}</span>}
                    <span className="flex-1 truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
