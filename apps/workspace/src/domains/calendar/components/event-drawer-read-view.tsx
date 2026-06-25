"use client";

import type { CalendarEvent } from "../store/calendar.types";
import { calendarLongDayYearLabel } from "@/domains/calendar/calendar-view-model";

export function EventDrawerReadView({
  event,
  locale,
  labels,
}: {
  event: CalendarEvent;
  locale: string;
  labels: {
    title: string;
    date: string;
    time: string;
    type: string;
    status: string;
    owner: string;
    location: string;
    notes: string;
    typeValue: string;
    statusValue: string;
  };
}) {
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <div className="space-y-5">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">{labels.title}</span>
          <p className="text-sm font-medium text-foreground">{event.title}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{labels.date}</span>
            <p className="text-sm font-medium text-foreground">
              {calendarLongDayYearLabel(new Date(`${event.date}T00:00:00`), locale)}
            </p>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{labels.time}</span>
            <p className="text-sm font-medium text-foreground">{event.time}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{labels.type}</span>
            <p className="text-sm font-medium text-foreground capitalize">{labels.typeValue}</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{labels.status}</span>
            <p className="text-sm font-medium text-foreground capitalize">{labels.statusValue}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-muted-foreground">{labels.owner}</span>
          <p className="text-sm font-medium text-foreground">{event.owner}</p>
        </div>
        {event.location && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{labels.location}</span>
            <p className="text-sm font-medium text-foreground">{event.location}</p>
          </div>
        )}
        {event.notes && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-muted-foreground">{labels.notes}</span>
            <div
              className="text-sm text-foreground prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: event.notes }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
