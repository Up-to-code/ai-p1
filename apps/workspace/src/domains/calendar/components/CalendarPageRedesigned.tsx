"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Calendar, Willow, WillowDark } from "@svar-ui/react-calendar";
import type { CalendarEvent as SvarCalendarEvent, EventContentMode } from "@svar-ui/react-calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import gsap from "gsap";
import { AlignLeft, BellOff, BriefcaseBusiness, CalendarDays, CalendarPlus, ChevronDown, ChevronLeft, ChevronRight, Clock3, Columns3, Link2, MapPin, Plus, Sparkles, Trash2, UserPlus, Users, Video, X } from "lucide-react";
import { useLocale } from "next-intl";
import { useQuickChat } from "@/components/layout/quick-chat-context";
import { HttpQueryState } from "@/components/shared/crud-ui";
import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { useAuthSession } from "@/domains/auth";
import {
  createCalendarEventRequest,
  deleteCalendarEventRequest,
  useCalendarIndexRangeQueryResult,
} from "../api/calendar";
import { calendarHeaderLabel, calendarIsoDate, nextCalendarDate, visibleCalendarRange } from "../calendar-view-model";
import { useCalendarStore } from "../store/calendar.store";
import type { CalendarEvent } from "../store/calendar.types";
import type { CalendarEventFormValues } from "../validation/calendar.schema";

type CalendarView = "day" | "week" | "month";
type SelectedCalendarSlot = {
  start: Date;
  end: Date;
};
type CalendarEventType = CalendarEvent["type"];

const calendarViewOptions: Array<{
  value: CalendarView;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { value: "day", label: "Day", icon: Clock3 },
  { value: "week", label: "Week", icon: Columns3 },
  { value: "month", label: "Month", icon: CalendarDays },
];

const eventTypeColor: Record<CalendarEvent["type"], string> = {
  meeting: "#6F00C2",
  deadline: "#A71E0F",
  reminder: "#ED8E00",
  milestone: "#00753E",
  focusBlock: "#31574B",
};

const calendarCreateTypes: Array<{ value: CalendarEventType; label: string }> = [
  { value: "meeting", label: "Event" },
  { value: "deadline", label: "Task" },
  { value: "focusBlock", label: "Focus time" },
  { value: "reminder", label: "OOO" },
];

export function CalendarPageRedesigned() {
  const locale = useLocale();
  const { isDark } = useTheme();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { open: openQuickChat, setDomainContext, clearDomainContext } = useQuickChat();
  const session = useAuthSession();
  const organizationId = session.workspace.isReady ? session.workspace.organizationId ?? undefined : undefined;
  const { currentDate, setCurrentDate } = useCalendarStore();
  const [view, setView] = useState<CalendarView>("week");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedCalendarSlot | null>(null);
  const [actionTitle, setActionTitle] = useState("");
  const [actionType, setActionType] = useState<CalendarEventType>("meeting");

  const range = useMemo(() => visibleCalendarRange(currentDate, view), [currentDate, view]);
  const calendarResult = useCalendarIndexRangeQueryResult(
    organizationId,
    range.startAt,
    range.endAt,
  );

  const queryStatus = calendarResult.queryStatus;
  const events = useMemo(() => calendarResult.data?.events ?? [], [calendarResult.data?.events]);
  const svarEvents = useMemo(() => events.map(toSvarEvent), [events]);
  const SvarTheme = isDark ? WillowDark : Willow;

  useEffect(() => {
    const rangeStartIso = new Date(range.startAt).toISOString();
    const rangeEndIso = new Date(range.endAt).toISOString();

    setDomainContext({
      domain: "calendar",
      title: "Calendar",
      route: "/calendar",
      summary: `Calendar ${view} view from ${rangeStartIso} to ${rangeEndIso}.`,
      metadata: {
        view,
        currentDate: calendarIsoDate(currentDate),
        rangeStartAt: range.startAt,
        rangeEndAt: range.endAt,
        rangeStartIso,
        rangeEndIso,
        visibleEventCount: events.length,
        selectedEventId: selectedEvent?.id ?? null,
        selectedEventTitle: selectedEvent?.title ?? null,
        selectedSlotStartIso: selectedSlot?.start.toISOString() ?? null,
        selectedSlotEndIso: selectedSlot?.end.toISOString() ?? null,
        selectedSlotLabel: selectedSlot ? `${formatEventTime(selectedSlot.start)} - ${formatEventTime(selectedSlot.end)}` : null,
      },
      updatedAt: Date.now(),
    });

    return () => clearDomainContext("calendar");
  }, [
    clearDomainContext,
    currentDate,
    events.length,
    range.endAt,
    range.startAt,
    selectedEvent?.id,
    selectedEvent?.title,
    selectedSlot,
    setDomainContext,
    view,
  ]);

  function handleCalendarAdd(event: { event?: Partial<SvarCalendarEvent> }) {
    const start = toDateOrFallback(event.event?.start, currentDate);
    const end = toDateOrFallback(event.event?.end, new Date(start.getTime() + 60 * 60 * 1000));
    setSelectedSlot({ start, end });
  }

  function handleHeaderAdd() {
    const start = new Date(currentDate);
    const now = new Date();
    start.setHours(now.getHours() + 1, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    setSelectedSlot({ start, end });
  }

  function handleAskAi() {
    const slotText = selectedSlot
      ? `Use the selected calendar time ${calendarIsoDate(selectedSlot.start)} ${formatEventTime(selectedSlot.start)} - ${formatEventTime(selectedSlot.end)}.`
      : "Use the current calendar context.";
    if (typeof window !== "undefined") {
      sessionStorage.setItem("qentrah:quick-chat-prefill", actionTitle.trim() ? `${actionTitle.trim()}\n\n${slotText}` : slotText);
    }
    openQuickChat();
  }

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => {
      if (!organizationId) throw new Error("Organization is required.");
      return deleteCalendarEventRequest(organizationId, eventId);
    },
    onSuccess: () => {
      setSelectedEvent(null);
      void queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast({ title: "Event deleted", description: "The calendar event was removed.", type: "success" });
    },
    onError: (error) => toast({ title: "Calendar action failed", description: error.message, type: "error" }),
  });

  const createMutation = useMutation({
    mutationFn: (values: CalendarEventFormValues) => {
      if (!organizationId) throw new Error("Organization is required.");
      return createCalendarEventRequest(organizationId, values);
    },
    onSuccess: () => {
      setActionTitle("");
      setActionType("meeting");
      setSelectedSlot(null);
      void queryClient.invalidateQueries({ queryKey: ["calendar"] });
      toast({ title: "Event created", description: "The selected time was added to the calendar.", type: "success" });
    },
    onError: (error) => toast({ title: "Calendar action failed", description: error.message, type: "error" }),
  });

  function handleCreateEvent() {
    if (!selectedSlot || !actionTitle.trim()) return;
    createMutation.mutate({
      title: actionTitle.trim(),
      ownerUserId: session.user.id,
      date: calendarIsoDate(selectedSlot.start),
      time: calendarClockValue(selectedSlot.start),
      durationMinutes: calendarDurationMinutes(selectedSlot.start, selectedSlot.end),
      type: actionType,
      status: "confirmed",
    });
  }

  if (session.workspace.status === "loadingSession" || queryStatus === "loading") {
    return <CalendarPageSkeleton />;
  }

  if (queryStatus === "error") {
    return <HttpQueryState query={calendarResult} variant="calendar" />;
  }

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background text-foreground">
      <main className="qentrah-svar-calendar relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <CalendarHeader
          currentDate={currentDate}
          locale={locale}
          view={view}
          onAdd={handleHeaderAdd}
          onMove={(direction) => setCurrentDate(nextCalendarDate(currentDate, view, direction))}
          onToday={() => setCurrentDate(new Date())}
          onViewChange={setView}
        />
        <SvarTheme fonts={false}>
          <Calendar
            events={svarEvents}
            view={view}
            views={["day", "week", "month"]}
            toolbar={null}
            date={currentDate}
            onSetDate={(event) => setCurrentDate(new Date(event.value))}
            onSetView={(event) => setView(event.value as CalendarView)}
            onClickEvent={(event) => {
              const id = String(event.event?.id ?? "");
              const source = events.find((item) => item.id === id);
              if (source) {
                setSelectedSlot(null);
                setSelectedEvent(source);
              }
            }}
            onAddEvent={handleCalendarAdd}
            eventContent={CalendarEventContent}
          />
        </SvarTheme>
        <CalendarActionPanel
          title={actionTitle}
          type={actionType}
          selectedSlot={selectedSlot}
          isCreating={createMutation.isPending}
          onAskAi={handleAskAi}
          onChangeTitle={setActionTitle}
          onChangeType={setActionType}
          onClearSlot={() => setSelectedSlot(null)}
          onCreateEvent={handleCreateEvent}
        />
      </main>

      <EventDetailsDialog
        event={selectedEvent}
        isDeleting={deleteMutation.isPending}
        onClose={() => setSelectedEvent(null)}
        onDelete={(eventId) => deleteMutation.mutate(eventId)}
      />
    </div>
  );
}

function CalendarHeader({
  currentDate,
  locale,
  view,
  onAdd,
  onMove,
  onToday,
  onViewChange,
}: {
  currentDate: Date;
  locale: string;
  view: CalendarView;
  onAdd: () => void;
  onMove: (direction: 1 | -1) => void;
  onToday: () => void;
  onViewChange: (view: CalendarView) => void;
}) {
  return (
    <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md border border-border bg-card" onClick={() => onMove(-1)} aria-label="Previous calendar period">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 rounded-md border border-border bg-card" onClick={() => onMove(1)} aria-label="Next calendar period">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" className="ms-2 h-8 rounded-md border border-border bg-card px-3 text-xs font-medium" onClick={onToday}>
          Today
        </Button>
      </div>

      <div className="min-w-0 flex-1 text-center text-sm font-medium text-foreground">
        {calendarHeaderLabel(currentDate, view, locale)}
      </div>

      <div className="flex items-center gap-2">
        <CalendarViewDropdown value={view} onValueChange={onViewChange} />
        <Button type="button" size="icon" className="h-8 w-8 rounded-md" onClick={onAdd} aria-label="Create calendar event">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function CalendarViewDropdown({
  value,
  onValueChange,
}: {
  value: CalendarView;
  onValueChange: (view: CalendarView) => void;
}) {
  const selected = calendarViewOptions.find((option) => option.value === value) ?? calendarViewOptions[1];
  const SelectedIcon = selected.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            className="h-8 min-w-[104px] justify-between rounded-md border border-border bg-card px-2 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <SelectedIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate">{selected.label}</span>
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={6} className="w-36 min-w-36 bg-popover text-popover-foreground">
        <DropdownMenuRadioGroup
          value={value}
          onValueChange={(nextValue: string) => onValueChange(nextValue as CalendarView)}
        >
          {calendarViewOptions.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value} className="text-xs">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                {option.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CalendarPageSkeleton() {
  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background text-foreground" aria-hidden="true">
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="ms-2 h-8 w-16 rounded-md" />
          </div>
          <div className="flex min-w-0 flex-1 justify-center">
            <Skeleton className="h-4 w-40 rounded-full" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col bg-card">
          <div className="grid h-8 shrink-0 grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b border-border">
            <div className="border-e border-border" />
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="flex items-center justify-center border-e border-border last:border-e-0">
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[60px_repeat(7,minmax(0,1fr))] overflow-hidden">
            <div className="border-e border-border">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="flex h-20 items-start justify-center border-b border-border pt-2">
                  <Skeleton className="h-2.5 w-8 rounded-full" />
                </div>
              ))}
            </div>
            {Array.from({ length: 7 }).map((_, day) => (
              <div key={day} className="border-e border-border last:border-e-0">
                {Array.from({ length: 10 }).map((_, row) => (
                  <div key={row} className="relative h-20 border-b border-border p-2">
                    {(day + row) % 5 === 0 ? (
                      <Skeleton className="absolute inset-x-2 top-2 h-12 rounded-md" />
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function CalendarActionPanel({
  title,
  type,
  selectedSlot,
  isCreating,
  onAskAi,
  onChangeTitle,
  onChangeType,
  onClearSlot,
  onCreateEvent,
}: {
  title: string;
  type: CalendarEventType;
  selectedSlot: SelectedCalendarSlot | null;
  isCreating: boolean;
  onAskAi: () => void;
  onChangeTitle: (title: string) => void;
  onChangeType: (type: CalendarEventType) => void;
  onClearSlot: () => void;
  onCreateEvent: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!selectedSlot) {
      setIsExpanded(false);
      return;
    }
    setIsExpanded(true);
    const panel = panelRef.current;
    if (!panel) return;
    gsap.fromTo(
      panel,
      { xPercent: -50, y: 18, opacity: 0, scale: 0.98 },
      { xPercent: -50, y: 0, opacity: 1, scale: 1, duration: 0.24, ease: "power3.out" },
    );
  }, [selectedSlot]);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || !selectedSlot) return;
    gsap.to(panel, {
      xPercent: -50,
      width: isExpanded ? 520 : 420,
      height: isExpanded ? "auto" : 40,
      duration: 0.22,
      ease: "power3.out",
    });
  }, [isExpanded, selectedSlot]);

  if (!selectedSlot) return null;

  const accentColor = eventTypeColor[type];

  return (
    <div
      ref={panelRef}
      className="absolute bottom-5 left-1/2 z-20 w-[520px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-xl"
      style={{ transformOrigin: "50% 100%" }}
    >
      {isExpanded ? (
        <div className="p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1">
              {calendarCreateTypes.map((item) => {
                const selected = item.value === type;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onChangeType(item.value)}
                    className="h-7 rounded-md px-2.5 text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: selected ? `${eventTypeColor[item.value]}1A` : "transparent",
                      color: selected ? eventTypeColor[item.value] : "var(--muted-foreground)",
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => setIsExpanded(false)} aria-label="Collapse event editor">
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Input
            value={title}
            onChange={(event) => onChangeTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") onCreateEvent();
              if (event.key === "Escape") setIsExpanded(false);
            }}
            placeholder={calendarComposerPlaceholder(type)}
            className="mt-3 h-9 rounded-md border-border bg-background px-2.5 text-sm shadow-none focus-visible:ring-1"
            autoFocus
          />

          <div className="mt-2 flex flex-wrap items-center gap-2 px-1 text-xs text-foreground">
            <span>{calendarDayMonthLabel(selectedSlot.start)}</span>
            <span>{formatEventTime(selectedSlot.start)}</span>
            <span className="text-muted-foreground">→</span>
            <span>{formatEventTime(selectedSlot.end)}</span>
            <span className="text-muted-foreground">{calendarDurationLabel(selectedSlot.start, selectedSlot.end)}</span>
          </div>

          <div className="mt-1 px-1 text-[10px] text-muted-foreground">All day · Timezone · Repeat</div>

          <CalendarComposerFields type={type} accentColor={accentColor} />

          <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5" style={{ color: accentColor }} />
              <Clock3 className="h-3.5 w-3.5" />
              <span className="inline-flex items-center gap-1 text-[11px]">
                <BriefcaseBusiness className="h-3.5 w-3.5" />
                Default
              </span>
              <span className="inline-flex items-center gap-1 text-[11px]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accentColor }} />
                Busy
              </span>
              <BellOff className="h-3.5 w-3.5" />
            </div>
            <Button type="button" size="sm" className="h-7 rounded-md px-3 text-xs" disabled={isCreating || !title.trim()} onClick={onCreateEvent}>
              Create
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex h-10 items-center gap-2 p-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md" style={{ backgroundColor: `${accentColor}14`, color: accentColor }}>
            <CalendarPlus className="h-3.5 w-3.5" />
          </div>
          <Input
            value={title}
            onFocus={() => setIsExpanded(true)}
            onChange={(event) => {
              onChangeTitle(event.target.value);
              if (event.target.value) setIsExpanded(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") onCreateEvent();
              if (event.key === "Escape") onClearSlot();
            }}
            placeholder="Search events, teammates, commands..."
            className="h-7 min-w-0 flex-1 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0"
          />
          <button
            type="button"
            onClick={onAskAi}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-accent"
            aria-label="Ask AI about this time"
          >
            <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
          </button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={onClearSlot} aria-label="Cancel event creation">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}

function CalendarComposerFields({
  type,
  accentColor,
}: {
  type: CalendarEventType;
  accentColor: string;
}) {
  if (type === "deadline") {
    return (
      <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 px-1 pb-2 text-xs text-muted-foreground">
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ backgroundColor: `${accentColor}1A`, color: accentColor }}>TO DO</span>
          Status
        </button>
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <UserPlus className="h-3.5 w-3.5" />
          Assign owner
        </button>
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <BellOff className="h-3.5 w-3.5" />
          Add priority
        </button>
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <Link2 className="h-3.5 w-3.5" />
          Add a tag
        </button>
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          Add time estimate
        </button>
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          Add time
        </button>
        <button type="button" className="col-span-2 flex items-center gap-2 transition-colors hover:text-foreground">
          <AlignLeft className="h-3.5 w-3.5" />
          Add description
        </button>
      </div>
    );
  }

  if (type === "focusBlock") {
    return (
      <div className="mt-3 space-y-3 px-1 pb-2 text-xs text-muted-foreground">
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <Link2 className="h-3.5 w-3.5" />
          Add Qentrah task
        </button>
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <BellOff className="h-3.5 w-3.5" />
          Do not decline meetings
        </button>
      </div>
    );
  }

  if (type === "reminder") {
    return (
      <div className="mt-3 space-y-3 px-1 pb-2 text-xs text-muted-foreground">
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <BellOff className="h-3.5 w-3.5" />
          Do not decline meetings
        </button>
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <UserPlus className="h-3.5 w-3.5" />
          Notify team
        </button>
        <button type="button" className="flex items-center gap-2 transition-colors hover:text-foreground">
          <AlignLeft className="h-3.5 w-3.5" />
          Add note
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {[
          { label: "Link task", icon: Link2 },
          { label: "Link doc", icon: AlignLeft },
          { label: "Invite team", icon: UserPlus },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-border bg-background text-xs text-muted-foreground transition-colors hover:border-current hover:text-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="mt-3 flex h-8 w-full items-center justify-center gap-1 rounded-md text-xs font-medium transition-colors"
        style={{ backgroundColor: `${accentColor}14`, color: accentColor }}
      >
        <Video className="h-3.5 w-3.5" />
        Add video call
      </button>

      <div className="mt-3 grid grid-cols-2 gap-2 px-1 pb-2 text-xs text-muted-foreground">
        <button type="button" className="flex items-center gap-3 transition-colors hover:text-foreground">
          <UserPlus className="h-3.5 w-3.5" />
          Add participants
        </button>
        <button type="button" className="flex items-center gap-3 transition-colors hover:text-foreground">
          <Link2 className="h-3.5 w-3.5" />
          Add Qentrah tasks and docs
        </button>
        <button type="button" className="flex items-center gap-3 transition-colors hover:text-foreground">
          <MapPin className="h-3.5 w-3.5" />
          Add location or room
        </button>
        <button type="button" className="flex items-center gap-3 transition-colors hover:text-foreground">
          <AlignLeft className="h-3.5 w-3.5" />
          Add description
        </button>
      </div>
    </>
  );
}

function calendarComposerPlaceholder(type: CalendarEventType) {
  if (type === "deadline") return "Task name";
  if (type === "focusBlock") return "Add title, @@ for tasks";
  if (type === "reminder") return "Why are you out?";
  return "Add title, @ for people, @@ for tasks, @@@ for docs";
}

function calendarDayMonthLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function calendarDurationLabel(start: Date, end: Date) {
  const minutes = calendarDurationMinutes(start, end);
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours <= 0) return `${minutes}m`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

function CalendarEventContent({
  event,
  mode,
}: {
  event: SvarCalendarEvent;
  mode: EventContentMode;
}) {
  const title = String(event.text ?? "");
  const start = event.start instanceof Date ? event.start : new Date(event.start);
  const end = event.end instanceof Date ? event.end : new Date(event.end);
  const compact = mode === "bars";

  return (
    <div className="qentrah-calendar-event-content">
      {!compact && (
        <span className="qentrah-calendar-event-time">
          {formatEventTime(start)} - {formatEventTime(end)}
        </span>
      )}
      <span className="qentrah-calendar-event-title">{title || "Untitled event"}</span>
    </div>
  );
}

function formatEventTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function calendarClockValue(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function calendarDurationMinutes(start: Date, end: Date) {
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / 60_000));
}

function toDateOrFallback(value: unknown, fallback: Date) {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return fallback;
}

function toSvarEvent(event: CalendarEvent): SvarCalendarEvent {
  const start = event.startAt ? new Date(event.startAt) : new Date(`${event.date}T${event.time || "00:00"}`);
  const end = event.endAt ? new Date(event.endAt) : new Date(start.getTime() + 60 * 60 * 1000);

  if (end.getTime() <= start.getTime()) {
    end.setTime(start.getTime() + 60 * 60 * 1000);
  }

  return {
    id: event.id,
    text: event.title,
    start,
    end,
    color: eventTypeColor[event.type],
    css: `qentrah-calendar-event qentrah-calendar-event-${event.type}`,
    type: event.type,
    status: event.status,
    location: event.location,
    details: event.notes,
  };
}

function EventDetailsDialog({
  event,
  isDeleting,
  onClose,
  onDelete,
}: {
  event: CalendarEvent | null;
  isDeleting: boolean;
  onClose: () => void;
  onDelete: (eventId: string) => void;
}) {
  return (
    <Dialog open={Boolean(event)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        {event && (
          <>
            <DialogHeader>
              <DialogTitle>{event.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><Clock3 className="me-2 inline h-4 w-4" />{event.date} · {event.time}</p>
              {event.location && <p><Users className="me-2 inline h-4 w-4" />{event.location}</p>}
              {event.notes && <p>{event.notes}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Close</Button>
              <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => onDelete(event.id)}>
                <Trash2 className="me-2 h-4 w-4" />
                Delete
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
