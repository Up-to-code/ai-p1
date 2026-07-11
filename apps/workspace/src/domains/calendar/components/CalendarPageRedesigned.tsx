"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock3, Columns3, Plus } from "lucide-react";
import { useLocale } from "next-intl";
import { useQuickChat } from "@/components/layout/quick-chat-context";
import { HttpQueryState } from "@/components/shared/crud-ui";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { useAuthSession } from "@/domains/auth";
import { createCalendarEventRequest, deleteCalendarEventRequest, updateCalendarEventRequest, useCalendarIndexRangeQueryResult } from "../api/calendar";
import { calendarHeaderLabel, calendarIsoDate, nextCalendarDate, visibleCalendarRange, type CalendarView } from "../calendar-view-model";
import { useCalendarStore } from "../store/calendar.store";
import type { CalendarEvent } from "../store/calendar.types";
import type { CalendarEventFormValues } from "../validation/calendar.schema";
import { CalendarEventFormDialog } from "./calendar-event-form-dialog";
import { CalendarGrid } from "./calendar-grid";

type SelectedSlot = { start: Date; end: Date };

const calendarViewOptions: Array<{ value: CalendarView; label: string; icon: typeof CalendarDays }> = [
  { value: "day", label: "Day", icon: Clock3 },
  { value: "week", label: "Week", icon: Columns3 },
  { value: "month", label: "Month", icon: CalendarDays },
];

export function CalendarPageRedesigned() {
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setDomainContext, clearDomainContext } = useQuickChat();
  const session = useAuthSession();
  const organizationId = session.workspace.isReady ? session.workspace.organizationId ?? undefined : undefined;
  const { currentDate, setCurrentDate, view, setView } = useCalendarStore();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);

  const range = useMemo(() => visibleCalendarRange(currentDate, view), [currentDate, view]);
  const calendarResult = useCalendarIndexRangeQueryResult(organizationId, range.startAt, range.endAt);
  const events = useMemo(() => calendarResult.data?.events ?? [], [calendarResult.data?.events]);

  useEffect(() => {
    setDomainContext({
      domain: "calendar",
      title: "Calendar",
      route: "/calendar",
      summary: `${calendarHeaderLabel(currentDate, view, locale)} ${view} view.`,
      metadata: { view, currentDate: calendarIsoDate(currentDate), visibleEventCount: events.length },
      updatedAt: Date.now(),
    });
    return () => clearDomainContext("calendar");
  }, [clearDomainContext, currentDate, events.length, locale, setDomainContext, view]);

  const createMutation = useMutation({
    mutationFn: (values: CalendarEventFormValues) => {
      if (!organizationId) throw new Error("Organization is required.");
      return createCalendarEventRequest(organizationId, { ...values, ownerUserId: session.user.id });
    },
    onSuccess: () => {
      closeEditor();
      invalidateCalendar(queryClient);
      toast({ title: "Event created", description: "Your event is now on the calendar.", type: "success" });
    },
    onError: (error) => toast({ title: "Could not create event", description: error.message, type: "error" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ eventId, values }: { eventId: string; values: CalendarEventFormValues }) => {
      if (!organizationId) throw new Error("Organization is required.");
      return updateCalendarEventRequest(organizationId, eventId, { ...values, ownerUserId: selectedEvent?.ownerUserId });
    },
    onSuccess: () => {
      closeEditor();
      invalidateCalendar(queryClient);
      toast({ title: "Event updated", description: "Your changes were saved.", type: "success" });
    },
    onError: (error) => toast({ title: "Could not update event", description: error.message, type: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) => {
      if (!organizationId) throw new Error("Organization is required.");
      return deleteCalendarEventRequest(organizationId, eventId);
    },
    onSuccess: () => {
      closeEditor();
      invalidateCalendar(queryClient);
      toast({ title: "Event deleted", description: "The calendar event was removed.", type: "success" });
    },
    onError: (error) => toast({ title: "Could not delete event", description: error.message, type: "error" }),
  });

  function closeEditor() {
    setSelectedEvent(null);
    setSelectedSlot(null);
  }

  function openCreate(start: Date, end: Date) {
    setSelectedEvent(null);
    setSelectedSlot({ start, end });
  }

  function handleFormSubmit(values: CalendarEventFormValues) {
    if (selectedEvent) updateMutation.mutate({ eventId: selectedEvent.id, values });
    else createMutation.mutate(values);
  }

  if (session.workspace.status === "loadingSession" || calendarResult.queryStatus === "loading") return <CalendarPageSkeleton />;
  if (calendarResult.queryStatus === "error") return <HttpQueryState query={calendarResult} variant="calendar" />;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <CalendarHeader
        currentDate={currentDate}
        locale={locale}
        view={view}
        onAdd={() => openCreate(nextHour(currentDate), new Date(nextHour(currentDate).getTime() + 60 * 60_000))}
        onMove={(direction) => setCurrentDate(nextCalendarDate(currentDate, view, direction))}
        onToday={() => setCurrentDate(new Date())}
        onViewChange={setView}
      />
      <CalendarGrid currentDate={currentDate} events={events} locale={locale} view={view} onCreate={openCreate} onEventClick={(event) => { setSelectedSlot(null); setSelectedEvent(event); }} />
      <CalendarEventFormDialog
        organizationId={organizationId}
        event={selectedEvent}
        initialSlot={selectedSlot}
        isPending={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending}
        onClose={closeEditor}
        onDelete={(eventId) => deleteMutation.mutate(eventId)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

function CalendarHeader({ currentDate, locale, view, onAdd, onMove, onToday, onViewChange }: { currentDate: Date; locale: string; view: CalendarView; onAdd: () => void; onMove: (direction: 1 | -1) => void; onToday: () => void; onViewChange: (view: CalendarView) => void }) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3">
      <div className="flex items-center gap-1">
        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onMove(-1)} aria-label="Previous calendar period"><ChevronLeft className="size-4" /></Button>
        <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => onMove(1)} aria-label="Next calendar period"><ChevronRight className="size-4" /></Button>
        <Button type="button" variant="outline" size="sm" className="ms-1" onClick={onToday}>Today</Button>
      </div>
      <h1 className="min-w-0 flex-1 text-center text-sm font-semibold text-foreground">{calendarHeaderLabel(currentDate, view, locale)}</h1>
      <div className="flex items-center gap-2"><CalendarViewDropdown value={view} onValueChange={onViewChange} /><Button type="button" size="sm" onClick={onAdd}><Plus className="me-1 size-4" />New event</Button></div>
    </div>
  );
}

function CalendarViewDropdown({ value, onValueChange }: { value: CalendarView; onValueChange: (view: CalendarView) => void }) {
  const selected = calendarViewOptions.find((option) => option.value === value) ?? calendarViewOptions[1];
  const SelectedIcon = selected.icon;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button type="button" variant="outline" size="sm" className="min-w-24 justify-between"><span className="flex items-center gap-1.5"><SelectedIcon className="size-3.5" />{selected.label}</span><ChevronDown className="size-3.5" /></Button>} />
      <DropdownMenuContent align="end"><DropdownMenuRadioGroup value={value} onValueChange={(next: string) => onValueChange(next as CalendarView)}>{calendarViewOptions.map(({ value, label, icon: Icon }) => <DropdownMenuRadioItem key={value} value={value}><Icon className="size-3.5" />{label}</DropdownMenuRadioItem>)}</DropdownMenuRadioGroup></DropdownMenuContent>
    </DropdownMenu>
  );
}

function CalendarPageSkeleton() {
  return <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background"><div className="flex items-center justify-between border-b border-border px-4 py-3"><Skeleton className="h-8 w-36" /><Skeleton className="h-5 w-48" /><Skeleton className="h-8 w-36" /></div><div className="grid flex-1 grid-cols-7 gap-px bg-border">{Array.from({ length: 35 }, (_, index) => <Skeleton key={index} className="min-h-28 rounded-none bg-background" />)}</div></div>;
}

function nextHour(date: Date) {
  const next = new Date(date);
  next.setHours(new Date().getHours() + 1, 0, 0, 0);
  return next;
}

function invalidateCalendar(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: ["calendar"] });
}
