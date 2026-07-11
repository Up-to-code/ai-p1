"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Project } from "../../../store/projects.types";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CalendarEventFormDialog } from "@/domains/calendar/components/calendar-event-form-dialog";
import { CalendarGrid } from "@/domains/calendar/components/calendar-grid";
import { createCalendarEventRequest, deleteCalendarEventRequest, updateCalendarEventRequest, useCalendarIndexRangeQueryResult } from "@/domains/calendar/api/calendar";
import { calendarHeaderLabel, nextCalendarDate, visibleCalendarRange } from "@/domains/calendar/calendar-view-model";
import type { CalendarEvent } from "@/domains/calendar/store/calendar.types";
import type { CalendarEventFormValues } from "@/domains/calendar/validation/calendar.schema";

interface CalendarTabProps { project: Project; organizationId: string; spaceId?: string }
type SelectedSlot = { start: Date; end: Date };

export function CalendarTab({ project, organizationId }: CalendarTabProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const range = useMemo(() => visibleCalendarRange(currentDate, "month"), [currentDate]);
  const result = useCalendarIndexRangeQueryResult(organizationId, range.startAt, range.endAt, project.id);
  const events = useMemo(() => (result.data?.events ?? []).filter((event) => event.projectId === project.id), [project.id, result.data?.events]);

  const create = useMutation({
    mutationFn: (values: CalendarEventFormValues) => createCalendarEventRequest(organizationId, { ...values, projectId: project.id }),
    onSuccess: () => { closeEditor(); invalidate(queryClient); toast({ title: "Event created", type: "success" }); },
    onError: (error) => toast({ title: "Could not create event", description: error.message, type: "error" }),
  });
  const update = useMutation({
    mutationFn: ({ eventId, values }: { eventId: string; values: CalendarEventFormValues }) => updateCalendarEventRequest(organizationId, eventId, { ...values, projectId: project.id }),
    onSuccess: () => { closeEditor(); invalidate(queryClient); toast({ title: "Event updated", type: "success" }); },
    onError: (error) => toast({ title: "Could not update event", description: error.message, type: "error" }),
  });
  const remove = useMutation({
    mutationFn: (eventId: string) => deleteCalendarEventRequest(organizationId, eventId),
    onSuccess: () => { closeEditor(); invalidate(queryClient); toast({ title: "Event deleted", type: "success" }); },
    onError: (error) => toast({ title: "Could not delete event", description: error.message, type: "error" }),
  });

  function closeEditor() { setSelectedEvent(null); setSelectedSlot(null); }
  function openCreate(start: Date, end: Date) { setSelectedEvent(null); setSelectedSlot({ start, end }); }
  function submit(values: CalendarEventFormValues) { if (selectedEvent) update.mutate({ eventId: selectedEvent.id, values }); else create.mutate(values); }

  return (
    <div className="flex h-[calc(100vh-260px)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1"><Button variant="ghost" size="icon" className="size-8" onClick={() => setCurrentDate(nextCalendarDate(currentDate, "month", -1))}><ChevronLeft className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8" onClick={() => setCurrentDate(nextCalendarDate(currentDate, "month", 1))}><ChevronRight className="size-4" /></Button></div>
        <p className="text-sm font-semibold">{calendarHeaderLabel(currentDate, "month", "en")}</p>
        <Button size="sm" onClick={() => openCreate(new Date(), new Date(Date.now() + 60 * 60_000))}><Plus className="me-1 size-4" />New event</Button>
      </div>
      <CalendarGrid currentDate={currentDate} events={events} locale="en" view="month" onCreate={openCreate} onEventClick={setSelectedEvent} />
      <CalendarEventFormDialog organizationId={organizationId} contextProjectId={project.id} event={selectedEvent} initialSlot={selectedSlot} isPending={create.isPending || update.isPending || remove.isPending} onClose={closeEditor} onDelete={(eventId) => remove.mutate(eventId)} onSubmit={submit} />
    </div>
  );
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) { void queryClient.invalidateQueries({ queryKey: ["calendar"] }); }
