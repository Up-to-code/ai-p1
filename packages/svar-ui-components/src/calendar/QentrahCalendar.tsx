import React, { useMemo } from 'react';
import {
  useCalendarApp,
  DayFlowCalendar,
  createDayView,
  createWeekView,
  createMonthView,
  ViewType,
  createEvent as dfCreateEvent,
  createAllDayEvent,
  createEventsPlugin,
  type Event,
} from '@dayflow/react';
import { createKeyboardShortcutsPlugin } from '@dayflow/plugin-keyboard-shortcuts';

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  allDay?: boolean;
  description?: string;
  location?: string;
  attendees?: string[];
  type?: string;
  status?: string;
  meta?: Record<string, unknown>;
}

export interface QentrahCalendarProps {
  events: CalendarEvent[];
  view?: CalendarView;
  currentDate?: Date;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (start: Date, end: Date) => void;
  onEventUpdate?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onDateChange?: (date: Date) => void;
  onViewChange?: (view: CalendarView) => void;
  className?: string;
  compact?: boolean;
}

const EVENT_TYPE_CALENDAR = {
  meeting: { name: 'Meeting', color: '#6F00C2' },
  deadline: { name: 'Deadline', color: '#A71E0F' },
  reminder: { name: 'Reminder', color: '#ED8E00' },
  milestone: { name: 'Milestone', color: '#00753E' },
  focusBlock: { name: 'Focus Block', color: '#31574B' },
};

function mapCalendarEventToDf(event: CalendarEvent): Event {
  if (event.allDay) {
    return createAllDayEvent({
      id: event.id,
      title: event.title,
      start: event.start,
      calendarId: event.type || 'meeting',
      meta: {
        description: event.description,
        location: event.location,
        attendees: event.attendees,
        type: event.type,
        status: event.status,
        color: event.color,
        ...event.meta,
      },
    });
  }
  return dfCreateEvent({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    calendarId: event.type || 'meeting',
    meta: {
      description: event.description,
      location: event.location,
      attendees: event.attendees,
      type: event.type,
      status: event.status,
      color: event.color,
      ...event.meta,
    },
  });
}

function mapDfEventToCalendarEvent(dfEvent: Event): CalendarEvent {
  return {
    id: dfEvent.id,
    title: dfEvent.title,
    start: new Date(dfEvent.start instanceof Date ? dfEvent.start : String(dfEvent.start)),
    end: new Date(dfEvent.end instanceof Date ? dfEvent.end : String(dfEvent.end)),
    allDay: dfEvent.allDay ?? false,
    description: dfEvent.meta?.description as string | undefined,
    location: dfEvent.meta?.location as string | undefined,
    type: (dfEvent.meta?.type as string) || 'meeting',
    status: (dfEvent.meta?.status as string) || 'confirmed',
    meta: dfEvent.meta as Record<string, unknown>,
  };
}

const VIEW_MAP: Record<CalendarView, ViewType> = {
  day: ViewType.DAY,
  week: ViewType.WEEK,
  month: ViewType.MONTH,
};

export function QentrahCalendar({
  events = [],
  view = 'week',
  currentDate,
  onEventClick,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onDateChange,
  onViewChange,
  className = '',
  compact = false,
}: QentrahCalendarProps) {
  const dfEvents = useMemo(() => events.map(mapCalendarEventToDf), [events]);

  const calendar = useCalendarApp({
    views: [createDayView(), createWeekView(), createMonthView()],
    defaultView: VIEW_MAP[view],
    plugins: [
      createEventsPlugin(),
      createKeyboardShortcutsPlugin(),
    ],
    calendars: Object.entries(EVENT_TYPE_CALENDAR).map(([id, c]) => ({
      id,
      name: c.name,
      colors: {
        lineColor: c.color,
        eventColor: `${c.color}1A`,
        eventSelectedColor: `${c.color}33`,
        textColor: c.color,
      },
      isVisible: true,
    })),
    events: dfEvents,
    initialDate: currentDate || new Date(),
    useEventDetailPanel: false,
    callbacks: {
      onEventCreate: (event: Event) => {
        onEventCreate?.(new Date(String(event.start)), new Date(String(event.end)));
        return undefined;
      },
      onEventUpdate: (event: Event) => {
        onEventUpdate?.(mapDfEventToCalendarEvent(event));
        return undefined;
      },
      onEventDelete: (eventId: string) => {
        onEventDelete?.(eventId);
        return undefined;
      },
      onEventDoubleClick: (event: Event) => {
        onEventClick?.(mapDfEventToCalendarEvent(event));
        return undefined;
      },
      onViewChange: (newView: string) => {
        const viewMap: Record<string, CalendarView> = {
          day: 'day',
          week: 'week',
          month: 'month',
        };
        onViewChange?.(viewMap[newView] || 'month');
        return undefined;
      },
      onDateChange: (date: Date) => {
        onDateChange?.(date);
        return undefined;
      },
    },
  });

  return (
    <div className={`q-calendar-view h-full w-full ${className}`}>
      <DayFlowCalendar calendar={calendar} />
    </div>
  );
}
