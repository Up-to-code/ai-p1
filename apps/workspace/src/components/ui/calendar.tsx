"use client";

import { useState, useCallback } from "react";
import { Calendar, momentLocalizer, View } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { cn } from "@/lib/utils";

const localizer = momentLocalizer(moment);

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  type?: string;
  status?: string;
  location?: string;
}

interface CalendarProps {
  mode?: "single" | "range" | "multiple";
  selected?: Date | Date[] | { from: Date; to: Date };
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
  defaultMonth?: Date;
  events?: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (slotInfo: { start: Date; end: Date }) => void;
  view?: View;
  onView?: (view: View) => void;
  date?: Date;
  onNavigate?: (date: Date) => void;
}

export function CalendarComponent({
  mode = "single",
  selected,
  onSelect,
  className,
  disabled,
  defaultMonth,
  events = [],
  onEventClick,
  onSlotClick,
  view = "month" as View,
  onView,
  date,
  onNavigate,
}: CalendarProps) {
  const [currentView, setCurrentView] = useState<View>(view as View || "month");
  const [currentDate, setCurrentDate] = useState<Date>(date || defaultMonth || new Date());

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    onEventClick?.(event);
  }, [onEventClick]);

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    onSlotClick?.(slotInfo);
  }, [onSlotClick]);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
    onNavigate?.(newDate);
  }, [onNavigate]);

  const handleView = useCallback((newView: View) => {
    setCurrentView(newView);
    onView?.(newView);
  }, [onView]);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.color || "#007AFF",
        borderRadius: "4px",
        opacity: event.status === "draft" ? 0.5 : 1,
        color: "white",
        border: "none",
        padding: "2px 4px",
        fontSize: "12px",
      },
      className: "rbc-event",
    };
  }, []);

  const dayPropGetter = useCallback((date: Date) => {
    const isDisabled = disabled?.(date);
    return {
      style: {
        backgroundColor: isDisabled ? "#f5f5f5" : undefined,
        cursor: isDisabled ? "not-allowed" : "pointer",
      },
      className: isDisabled ? "rbc-off-range-bg" : "",
    };
  }, [disabled]);

  return (
    <div className={cn("h-full w-full rbc-calendar", className)}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        view={currentView}
        date={currentDate}
        onNavigate={handleNavigate}
        onView={handleView}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        views={["month" as View, "week" as View, "day" as View, "agenda" as View]}
        defaultView="month"
      />
    </div>
  );
}
          --rbc-off-range-bg: var(--muted/50);
          --rbc-off-range-color: var(--muted-foreground);
          --rbc-slot-bg: var(--muted/20);
          --rbc-slot-color: var(--foreground);
        }
        
        .rbc-header {
          background-color: var(--rbc-header-bg);
          color: var(--rbc-header-color);
          border-bottom: 1px solid var(--border);
        }
        
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
          background-color: var(--background);
        }
        
        .rbc-today {
          background-color: var(--rbc-today-bg) !important;
        }
        
        .rbc-off-range-bg {
          background-color: var(--rbc-off-range-bg);
        }
        
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid var(--border);
        }
        
        .rbc-month-row {
          border-bottom: 1px solid var(--border);
        }
        
        .rbc-event {
          background-color: var(--rbc-event-bg);
          color: white;
        }
        
        .rbc-event.rbc-selected {
          background-color: var(--rbc-active-bg);
          color: var(--rbc-active-color);
        }
        
        .rbc-show-more {
          background-color: var(--rbc-slot-bg);
          color: var(--rbc-slot-color);
        }
        
        .rbc-toolbar button {
          color: var(--foreground);
          background-color: var(--background);
          border: 1px solid var(--border);
        }
        
        .rbc-toolbar button:hover {
          background-color: var(--accent);
          color: var(--accent-foreground);
        }
        
        .rbc-toolbar button.rbc-active {
          background-color: var(--primary);
          color: var(--primary-foreground);
        }
        
        .rbc-toolbar label {
          color: var(--foreground);
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        view={currentView}
        date={currentDate}
        onNavigate={handleNavigate}
        onView={handleView}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        views={["month" as View, "week" as View, "day" as View, "agenda" as View]}
        defaultView="month"
      />
    </div>
  );
}
          --rbc-off-range-color: var(--muted-foreground);
          --rbc-slot-bg: var(--muted/20);
          --rbc-slot-color: var(--foreground);
        }
        
        .rbc-header {
          background-color: var(--rbc-header-bg);
          color: var(--rbc-header-color);
          border-bottom: 1px solid var(--border);
        }
        
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
          background-color: var(--background);
        }
        
        .rbc-today {
          background-color: var(--rbc-today-bg) !important;
        }
        
        .rbc-off-range-bg {
          background-color: var(--rbc-off-range-bg);
        }
        
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid var(--border);
        }
        
        .rbc-month-row {
          border-bottom: 1px solid var(--border);
        }
        
        .rbc-event {
          background-color: var(--rbc-event-bg);
          color: white;
        }
        
        .rbc-event.rbc-selected {
          background-color: var(--rbc-active-bg);
          color: var(--rbc-active-color);
        }
        
        .rbc-show-more {
          background-color: var(--rbc-slot-bg);
          color: var(--rbc-slot-color);
        }
        
        .rbc-toolbar button {
          color: var(--foreground);
          background-color: var(--background);
          border: 1px solid var(--border);
        }
        
        .rbc-toolbar button:hover {
          background-color: var(--accent);
          color: var(--accent-foreground);
        }
        
        .rbc-toolbar button.rbc-active {
          background-color: var(--primary);
          color: var(--primary-foreground);
        }
        
        .rbc-toolbar label {
          color: var(--foreground);
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        view={currentView}
        date={currentDate}
        onNavigate={handleNavigate}
        onView={handleView}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        views={["month" as View, "week" as View, "day" as View, "agenda" as View]}
        defaultView="month"
      />
    </div>
  );
}
          --rbc-off-range-color: var(--muted-foreground);
          --rbc-slot-bg: var(--muted/20);
          --rbc-slot-color: var(--foreground);
        }
        
        .rbc-header {
          background-color: var(--rbc-header-bg);
          color: var(--rbc-header-color);
          border-bottom: 1px solid var(--border);
        }
        
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
          background-color: var(--background);
        }
        
        .rbc-today {
          background-color: var(--rbc-today-bg) !important;
        }
        
        .rbc-off-range-bg {
          background-color: var(--rbc-off-range-bg);
        }
        
        .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid var(--border);
        }
        
        .rbc-month-row {
          border-bottom: 1px solid var(--border);
        }
        
        .rbc-event {
          background-color: var(--rbc-event-bg);
          color: white;
        }
        
        .rbc-event.rbc-selected {
          background-color: var(--rbc-active-bg);
          color: var(--rbc-active-color);
        }
        
        .rbc-show-more {
          background-color: var(--rbc-slot-bg);
          color: var(--rbc-slot-color);
        }
        
        .rbc-toolbar button {
          color: var(--foreground);
          background-color: var(--background);
          border: 1px solid var(--border);
        }
        
        .rbc-toolbar button:hover {
          background-color: var(--accent);
          color: var(--accent-foreground);
        }
        
        .rbc-toolbar button.rbc-active {
          background-color: var(--primary);
          color: var(--primary-foreground);
        }
        
        .rbc-toolbar label {
          color: var(--foreground);
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        view={currentView}
        date={currentDate}
        onNavigate={handleNavigate}
        onView={handleView}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        selectable
        eventPropGetter={eventStyleGetter}
        dayPropGetter={dayPropGetter}
        views={["month" as View, "week" as View, "day" as View, "agenda" as View]}
        defaultView="month"
      />
    </div>
  );
}
