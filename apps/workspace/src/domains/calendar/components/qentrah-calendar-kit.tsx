"use client";

import { useMemo } from "react";
import { BasicScheduler } from "calendarkit-basic";
import type { CalendarEvent as CalendarKitEvent } from "calendarkit-basic";
import type { CalendarEvent } from "../store/calendar.types";
import { parse } from "date-fns";
// Calendar styles loaded via globals.css to avoid Tailwind conflicts

interface QentrahCalendarKitProps {
  events: CalendarEvent[];
  view?: "month" | "week" | "day";
  onViewChange?: (view: "month" | "week" | "day") => void;
  date?: Date;
  onDateChange?: (date: Date) => void;
  onEventCreate?: (event: Partial<CalendarKitEvent>) => void;
  onEventUpdate?: (event: CalendarKitEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventClick?: (event: CalendarKitEvent) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  locale?: string;
}

/**
 * QentrahCalendarKit - A themed wrapper around CalendarKit BasicScheduler
 * Integrates CalendarKit with Qentrah's design system and data structure
 */
export function QentrahCalendarKit({
  events,
  view = "week",
  onViewChange,
  date,
  onDateChange,
  onEventCreate,
  onEventUpdate,
  onEventDelete,
  onEventClick,
  readOnly = false,
  isLoading = false,
  locale = "en",
}: QentrahCalendarKitProps) {
  // Transform Qentrah events to CalendarKit format
  const calendarKitEvents = useMemo(() => {
    return events
      .filter((event) => event.date && event.time)
      .map((event): CalendarKitEvent => {
        const dateStr = event.date; // Format: "YYYY-MM-DD"
        const timeStr = event.time; // Format: "HH:mm" or "h:mm a"
        
        let startDate: Date;
        let endDate: Date;

        try {
          // If we have timestamps, use those
          if (event.startAt && event.endAt) {
            startDate = new Date(event.startAt);
            endDate = new Date(event.endAt);
          } else {
            // Parse from date and time strings
            let parsedTime = parse(timeStr, "HH:mm", new Date());
            if (isNaN(parsedTime.getTime())) {
              // Try 12-hour format
              parsedTime = parse(timeStr, "h:mm a", new Date());
            }
            
            const hours = parsedTime.getHours();
            const minutes = parsedTime.getMinutes();
            
            startDate = parse(dateStr, "yyyy-MM-dd", new Date());
            startDate.setHours(hours, minutes, 0, 0);
            
            // Default to 1-hour duration
            endDate = new Date(startDate);
            endDate.setHours(hours + 1, minutes, 0, 0);
          }
        } catch (error) {
          console.error("Error parsing event date/time:", event, error);
          // Fallback to current date
          startDate = new Date();
          endDate = new Date(startDate.getTime() + 3600000); // +1 hour
        }

        return {
          id: event.id,
          title: event.title,
          start: startDate,
          end: endDate,
          color: getEventColor(event.type, event.status),
          description: event.notes,
          allDay: false,
        };
      });
  }, [events]);

  // Event color mapping based on type and status
  function getEventColor(
    type: CalendarEvent["type"],
    status: CalendarEvent["status"],
  ): string {
    // Status-based opacity
    const opacity = status === "confirmed" ? "" : status === "pending" ? "/80" : "/50";

    // Type-based colors using Qentrah design system
    switch (type) {
      case "meeting":
        return `hsl(var(--primary))${opacity}`;
      case "deadline":
        return `hsl(var(--destructive))${opacity}`;
      case "reminder":
        return `hsl(var(--warning))${opacity}`;
      case "milestone":
        return `hsl(var(--success))${opacity}`;
      case "focusBlock":
        return `hsl(var(--secondary))${opacity}`;
      default:
        return `hsl(var(--primary))${opacity}`;
    }
  }

  return (
    <div className="qentrah-calendar-wrapper" dir={locale === "ar" ? "rtl" : "ltr"}>
      <BasicScheduler
        events={calendarKitEvents}
        view={view}
        onViewChange={onViewChange}
        date={date}
        onDateChange={onDateChange}
        onEventCreate={onEventCreate}
        onEventUpdate={onEventUpdate}
        onEventDelete={onEventDelete}
        onEventClick={onEventClick}
        weekStartsOn={locale === "ar" ? 6 : 1} // Saturday for Arabic, Monday for English
        readOnly={readOnly}
        isLoading={isLoading}
      />

      <style jsx global>{`
        /* Qentrah Calendar Theme Integration */
        .qentrah-calendar-wrapper {
          /* Override CalendarKit CSS variables with Qentrah design tokens */
          --background: var(--q-bg);
          --foreground: var(--q-text-primary);
          --card: var(--q-card);
          --card-foreground: var(--q-text-primary);
          --primary: var(--q-accent);
          --primary-foreground: #ffffff;
          --secondary: var(--q-bg-secondary);
          --secondary-foreground: var(--q-text-primary);
          --muted: var(--q-bg-secondary);
          --muted-foreground: var(--q-text-muted);
          --accent: var(--q-bg-secondary);
          --accent-foreground: var(--q-text-primary);
          --border: var(--q-border);
          --input: var(--q-border);
          --ring: var(--q-accent);
          --destructive: var(--q-error);
          --destructive-foreground: #ffffff;
          --radius: 12px;
          
          /* Typography */
          font-family: var(--font-sans), system-ui, sans-serif;
        }

        /* Container - Add rounded corners and border */
        .qentrah-calendar-wrapper > div {
          background: var(--q-card);
          border: 1px solid var(--q-border);
          border-radius: 24px;
          overflow: hidden;
        }

        /* Apply Qentrah button styles */
        .qentrah-calendar-wrapper button {
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s;
          border-radius: 12px;
        }

        /* Calendar header styling */
        .qentrah-calendar-wrapper .calendar-header {
          border-bottom: 1px solid var(--q-border);
          background: var(--q-card);
          padding: 1.25rem;
        }

        /* Event pills styling */
        .qentrah-calendar-wrapper .calendar-event {
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.75rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid transparent;
        }

        /* Month view grid cells */
        .qentrah-calendar-wrapper .calendar-day {
          border: 1px solid var(--q-border);
          background: var(--q-card);
          transition: background 0.2s;
        }

        .qentrah-calendar-wrapper .calendar-day:hover {
          background: var(--q-bg-muted);
        }

        /* Week/Day timeline */
        .qentrah-calendar-wrapper .calendar-timeline {
          border: 1px solid var(--q-border);
        }

        /* Today highlight */
        .qentrah-calendar-wrapper .calendar-today {
          background-color: var(--q-accent) !important;
          color: #ffffff !important;
          border-radius: 50%;
        }

        /* View toggle buttons */
        .qentrah-calendar-wrapper .view-toggle {
          background: var(--q-bg-muted);
          border-radius: 12px;
          padding: 4px;
        }

        .qentrah-calendar-wrapper .view-toggle button {
          border-radius: 8px;
          padding: 0.5rem 1rem;
          font-size: 10px;
          font-weight: 800;
        }

        .qentrah-calendar-wrapper .view-toggle button[data-active="true"] {
          background: var(--q-card);
          color: var(--q-text-primary);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* Navigation buttons */
        .qentrah-calendar-wrapper .nav-button {
          background: var(--q-bg-muted);
          border-radius: 12px;
          padding: 0.5rem;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        /* Month/Week headers */
        .qentrah-calendar-wrapper .calendar-header-cell {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--q-text-muted);
          padding: 0.75rem;
          text-align: center;
        }

        /* Time slots in day/week view */
        .qentrah-calendar-wrapper .time-slot {
          border-top: 1px solid var(--q-border);
          min-height: 60px;
        }

        /* Empty state */
        .qentrah-calendar-wrapper .empty-state {
          color: var(--q-text-muted);
          text-align: center;
          padding: 3rem;
        }

        /* Loading state */
        .qentrah-calendar-wrapper .loading {
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
