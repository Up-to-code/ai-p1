"use client";

import { useMemo, useEffect, useRef, useCallback } from "react";
import { BasicScheduler } from "@qentrah/calendar-kit";
import type { CalendarEvent as CalendarKitEvent } from "@qentrah/calendar-kit";
import type { CalendarEvent } from "../store/calendar.types";
import { parse } from "date-fns";
import { isRtlLocale } from "@/lib/i18n/locale";
// Calendar styles are loaded via globals.css to avoid Tailwind conflicts

interface QentrahCalendarKitProps {
  events: CalendarEvent[];
  view?: "month" | "week" | "day";
  onViewChange?: (view: "month" | "week" | "day") => void;
  date?: Date;
  onDateChange?: (date: Date) => void;
  onEventCreate?: (event: Partial<CalendarKitEvent>) => void;
  onEventUpdate?: (event: CalendarKitEvent) => void;
  onEventClick?: (event: CalendarKitEvent) => void;
  onTimeSlotClick?: (date: Date) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  locale?: string;
}

/**
 * DrawerInterceptor
 *
 * Replaces calendarkit-basic's internal EventModal AND EventViewModal.
 *
 * The library calls renderEventForm for both:
 *   • time-slot clicks  → props.event is undefined, props.initialDate is set
 *   • event clicks      → props.event is set
 *
 * We fire our drawer callbacks and immediately close the library modal so the
 * built-in overlay never appears.
 */
function DrawerInterceptor({
  isOpen,
  initialDate,
  event,
  onTimeSlotClick,
  onEventClick,
  onClose,
}: {
  isOpen: boolean;
  initialDate?: Date;
  event?: CalendarKitEvent;
  onTimeSlotClick?: (date: Date) => void;
  onEventClick?: (event: CalendarKitEvent) => void;
  onClose: () => void;
}) {
  const handledRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      handledRef.current = false;
      return;
    }
    if (handledRef.current) return;
    handledRef.current = true;

    // Always close the library modal immediately — we open our own drawer
    onClose();

    if (event && onEventClick) {
      onEventClick(event);
    } else if (initialDate && onTimeSlotClick) {
      onTimeSlotClick(initialDate);
    }
  }, [isOpen, event, initialDate, onEventClick, onTimeSlotClick, onClose]);

  // Render nothing — the library modal must stay invisible
  return null;
}

// ─── Event colour mapping ────────────────────────────────────────────────────

function getEventColor(
  type: CalendarEvent["type"],
  status: CalendarEvent["status"],
): string {
  if (status === "draft") return "#71717a"; // zinc-500

  switch (type) {
    case "meeting":    return "#f59e0b"; // amber-500
    case "deadline":   return "#ef4444"; // red-500
    case "reminder":   return "#0ea5e9"; // sky-500
    case "milestone":  return "#10b981"; // emerald-500
    case "focusBlock": return "#8b5cf6"; // violet-500
    default:           return "#4F80FF"; // q-network-blue
  }
}

// ─── Main component ──────────────────────────────────────────────────────────

export function QentrahCalendarKit({
  events,
  view = "week",
  onViewChange,
  date,
  onDateChange,
  onEventCreate,
  onEventUpdate,
  onEventClick,
  onTimeSlotClick,
  readOnly = false,
  isLoading = false,
  locale = "en",
}: QentrahCalendarKitProps) {
  const isRtl = isRtlLocale(locale);

  // ── Transform events to CalendarKit format ──────────────────────────────
  const calendarKitEvents = useMemo<CalendarKitEvent[]>(() => {
    return events
      .filter((ev) => ev.date && ev.time)
      .map((ev): CalendarKitEvent => {
        let startDate: Date;
        let endDate: Date;

        try {
          if (ev.startAt && ev.endAt) {
            startDate = new Date(ev.startAt);
            endDate   = new Date(ev.endAt);
          } else {
            // Parse "HH:mm" first, fallback to "h:mm a"
            let parsedTime = parse(ev.time, "HH:mm", new Date());
            if (isNaN(parsedTime.getTime())) {
              parsedTime = parse(ev.time, "h:mm a", new Date());
            }

            const hours   = parsedTime.getHours();
            const minutes = parsedTime.getMinutes();

            startDate = parse(ev.date, "yyyy-MM-dd", new Date());
            startDate.setHours(hours, minutes, 0, 0);

            // Use explicit endTime when available, else default 1-hour duration
            if (ev.endDate && ev.endTime) {
              endDate = parse(ev.endDate, "yyyy-MM-dd", new Date());
              const parsedEnd = parse(ev.endTime, "HH:mm", new Date());
              endDate.setHours(parsedEnd.getHours(), parsedEnd.getMinutes(), 0, 0);
            } else {
              endDate = new Date(startDate);
              endDate.setHours(hours + 1, minutes, 0, 0);
            }
          }
        } catch {
          startDate = new Date();
          endDate   = new Date(startDate.getTime() + 3_600_000);
        }

        return {
          id:          ev.id,
          title:       ev.title,
          start:       startDate,
          end:         endDate,
          color:       getEventColor(ev.type, ev.status),
          description: ev.notes,
          allDay:      false,
        };
      });
  }, [events]);

  // ── Stable callbacks so DrawerInterceptor deps don't thrash ────────────
  const handleEventClick    = useCallback((ev: CalendarKitEvent) => onEventClick?.(ev),    [onEventClick]);
  const handleTimeSlotClick = useCallback((d: Date)              => onTimeSlotClick?.(d),  [onTimeSlotClick]);

  return (
    <div
      className="qentrah-calendar-wrapper h-full w-full overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <BasicScheduler
        events={calendarKitEvents}
        view={view}
        onViewChange={onViewChange}
        date={date}
        onDateChange={onDateChange}
        onEventCreate={onEventCreate}
        onEventUpdate={onEventUpdate}
        /* onEventClick is intentionally passed here so the library's
           handleEventClickInternal fires our callback directly AND we
           intercept via renderEventForm to suppress the EventViewModal. */
        onEventClick={handleEventClick}
        renderEventForm={(props: any) => (
          <DrawerInterceptor
            isOpen={props.isOpen}
            initialDate={props.initialDate}
            event={props.event}
            onTimeSlotClick={handleTimeSlotClick}
            onEventClick={handleEventClick}
            onClose={props.onClose}
          />
        )}
        weekStartsOn={isRtl ? 6 : 1}
        readOnly={readOnly}
        isLoading={isLoading}
      />

      {/* ── Qentrah Calendar: design-system bridge + UX polish ── */}
      <style jsx global>{`

        /* ── 1. CSS variable bridge ─────────────────────────────────────── */
        .qentrah-calendar-wrapper {
          --background:           var(--q-bg);
          --foreground:           var(--q-text-primary);
          --card:                 var(--q-card);
          --card-foreground:      var(--q-text-primary);
          --primary:              var(--q-accent);
          --primary-foreground:   var(--q-bg);
          --secondary:            var(--q-bg-secondary);
          --secondary-foreground: var(--q-text-primary);
          --muted:                var(--q-bg-secondary);
          --muted-foreground:     var(--q-text-muted);
          --accent:               var(--q-bg-secondary);
          --accent-foreground:    var(--q-text-primary);
          --border:               var(--q-border);
          --input:                var(--q-input-bg);
          --ring:                 transparent;
          --destructive:          var(--q-error);
          --destructive-foreground: var(--q-bg);
          --radius:               12px;
          font-family: var(--font-sans), system-ui, sans-serif;
          display:        flex;
          flex-direction: column;
          height:         100%;
          width:          100%;
          max-width:      100%;
          min-width:      0;
        }

        /* ── 2. Top-level library shell ─────────────────────────────────── */
        .qentrah-calendar-wrapper > div {
          display:        flex !important;
          flex-direction: column !important;
          flex:           1 1 0% !important;
          height:         100% !important;
          width:          100% !important;
          max-width:      100% !important;
          min-width:      0 !important;
          background:     transparent !important;
          border:         none !important;
          outline:        none !important;
          box-shadow:     none !important;
          border-radius:  0 !important;
          overflow:       hidden !important;
        }

        .qentrah-calendar-wrapper > div,
        .qentrah-calendar-wrapper > div > div {
          box-shadow:   none !important;
          outline:      none !important;
          border-color: var(--q-border) !important;
        }

        .qentrah-calendar-wrapper > div > div:not([class*="absolute"]) {
          border:        none !important;
          box-shadow:    none !important;
          outline:       none !important;
          border-radius: 0 !important;
          width:         100% !important;
          max-width:     100% !important;
          min-width:     0 !important;
        }

        /* ── 3. Hide library header (we render our own) ──────────────────── */
        .qentrah-calendar-wrapper > div > div:first-child {
          display: none !important;
        }

        /* ── 4. Content area fills remaining space ───────────────────────── */
        .qentrah-calendar-wrapper > div > div:not(:first-child) {
          flex:      1 1 0% !important;
          height:    100% !important;
          overflow:  hidden !important;
          width:     100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          padding:   0 !important;
        }

        /* ── 5. Kill sidebar / mini-calendar panel ───────────────────────── */
        .qentrah-calendar-wrapper [class*="hidden"][class*="md:block"],
        .qentrah-calendar-wrapper [class*="w-64"],
        .qentrah-calendar-wrapper [class*="w-72"],
        .qentrah-calendar-wrapper [class*="w-80"] {
          display:    none !important;
          width:      0 !important;
          min-width:  0 !important;
          max-width:  0 !important;
          overflow:   hidden !important;
          padding:    0 !important;
          border:     none !important;
        }

        /* ── 6. Kill ALL library modals / overlays completely ────────────── */
        /* EventModal (z-50), EventViewModal (z-50), MobileBottomSheet (z-40) */
        .qentrah-calendar-wrapper [class*="inset-0"][class*="z-50"],
        .qentrah-calendar-wrapper [class*="inset-0"][class*="z-40"],
        .qentrah-calendar-wrapper [class*="absolute"][class*="inset-0"],
        .qentrah-calendar-wrapper [class*="fixed"][class*="inset-0"] {
          display: none !important;
          pointer-events: none !important;
        }

        /* ── 7. Strip arbitrary min-width on week/day grid ───────────────── */
        .qentrah-calendar-wrapper [style*="min-width"],
        .qentrah-calendar-wrapper [class*="min-w-"] {
          min-width: 0 !important;
        }

        /* ── 8. Strip calendarkit padding around grid ─────────────────────── */
        .qentrah-calendar-wrapper [class*="p-4"],
        .qentrah-calendar-wrapper [class*="p-6"],
        .qentrah-calendar-wrapper [class*="px-4"],
        .qentrah-calendar-wrapper [class*="px-6"] {
          padding: 0 !important;
        }

        /* ── 9. Fix strict containment so grid fills height ──────────────── */
        .qentrah-calendar-wrapper [style*="contain: strict"] {
          contain: layout style !important;
        }

        /* ── 10. Month view: weekday headers ─────────────────────────────── */
        .qentrah-calendar-wrapper th {
          font-size:      10px !important;
          font-weight:    700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
          color:          var(--q-text-muted) !important;
          padding:        10px 0 !important;
          text-align:     center !important;
          border:         none !important;
          background:     transparent !important;
        }

        /* ── 11. Week/Day time-label column ──────────────────────────────── */
        /* The library hard-codes text-right on the time gutter.
           In RTL we flip it so labels align toward the reading start edge. */
        .qentrah-calendar-wrapper [dir="rtl"] .flex-none.w-16,
        .qentrah-calendar-wrapper [dir="rtl"] [class*="text-right"][class*="pr-3"] {
          text-align: left !important;
          padding-right: 0 !important;
          padding-left:  12px !important;
          direction: ltr !important; /* keep time numerals LTR even in RTL layout */
        }

        /* Time numbers are always LTR regardless of locale */
        .qentrah-calendar-wrapper .tabular-nums {
          direction:  ltr !important;
          unicode-bidi: embed !important;
        }

        /* ── 12. Week/Day sticky day-header row ──────────────────────────── */
        .qentrah-calendar-wrapper .sticky.top-0 {
          background: var(--q-card) !important;
          border-bottom: 1px solid var(--q-border) !important;
          z-index: 20 !important;
        }

        /* RTL: flip the border from left to right on day columns */
        .qentrah-calendar-wrapper [dir="rtl"] [class*="border-l border-border"] {
          border-left:  none !important;
          border-right: 1px solid var(--q-border) !important;
        }

        /* ── 13. Week/Day event pills ─────────────────────────────────────── */
        .qentrah-calendar-wrapper .absolute.z-10 > div {
          border-radius: 10px !important;
          border-left:   none !important;
          border-right:  none !important;
          font-size:     11px !important;
          font-weight:   600 !important;
          backdrop-filter: none !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10) !important;
          transition: transform 0.12s ease, box-shadow 0.12s ease !important;
          cursor: pointer !important;
        }
        .qentrah-calendar-wrapper .absolute.z-10 > div:hover {
          box-shadow: 0 4px 14px rgba(0,0,0,0.16) !important;
          transform:  translateY(-1px) scale(1.01) !important;
        }
        .qentrah-calendar-wrapper .absolute.z-10 > div:active {
          transform:  scale(0.97) !important;
          box-shadow: 0 1px 4px rgba(0,0,0,0.10) !important;
        }

        /* RTL: event pill left-accent border becomes right-accent */
        .qentrah-calendar-wrapper [dir="rtl"] .absolute.z-10 > div {
          border-right: 3px solid rgba(255,255,255,0.35) !important;
          border-left:  none !important;
        }

        /* Pill text always starts on the inline-start side */
        .qentrah-calendar-wrapper .absolute.z-10 .flex.flex-col {
          text-align: start !important;
        }

        /* ── 14. Time-slot rows: clear hover highlight + cursor ──────────── */
        /* Week view slots */
        .qentrah-calendar-wrapper [class*="hover:bg-accent"] {
          cursor: cell !important;
        }
        /* Day view slots */
        .qentrah-calendar-wrapper [class*="hover:bg-muted"] {
          cursor: cell !important;
        }
        /* More specific slot targets */
        .qentrah-calendar-wrapper .absolute.top-0.left-0.w-full[class*="border-b"],
        .qentrah-calendar-wrapper [class*="border-b border-dashed"] {
          cursor: cell !important;
        }
        .qentrah-calendar-wrapper .absolute.top-0.left-0.w-full[class*="border-b"]:hover,
        .qentrah-calendar-wrapper [class*="border-b border-dashed"]:hover {
          background-color: color-mix(in srgb, var(--q-accent) 8%, transparent) !important;
        }

        /* Month day cells */
        .qentrah-calendar-wrapper [class*="h-\[120px\]"][class*="cursor-pointer"] {
          cursor: cell !important;
        }
        .qentrah-calendar-wrapper [class*="h-\[120px\]"][class*="cursor-pointer"]:hover {
          background-color: color-mix(in srgb, var(--q-accent) 6%, transparent) !important;
        }

        /* ── 15. Today highlight ─────────────────────────────────────────── */
        .qentrah-calendar-wrapper [class*="today"],
        .qentrah-calendar-wrapper td[class*="bg-primary"],
        .qentrah-calendar-wrapper div[class*="bg-primary"][class*="rounded-full"] {
          background-color: var(--q-accent) !important;
          color: var(--q-bg) !important;
        }

        /* Current-time indicator */
        .qentrah-calendar-wrapper [class*="bg-primary shadow-\[0_0_8px"] {
          background-color: var(--q-accent) !important;
        }
        .qentrah-calendar-wrapper [class*="pulse-dot"],
        .qentrah-calendar-wrapper .bg-primary.rounded-full {
          background-color: var(--q-accent) !important;
        }

        /* ── 16. Scrollbar ───────────────────────────────────────────────── */
        .qentrah-calendar-wrapper ::-webkit-scrollbar        { width: 5px; height: 5px; }
        .qentrah-calendar-wrapper ::-webkit-scrollbar-track  { background: transparent; }
        .qentrah-calendar-wrapper ::-webkit-scrollbar-thumb  { background: var(--q-border-strong); border-radius: 99px; }
        .qentrah-calendar-wrapper ::-webkit-scrollbar-thumb:hover { background: var(--q-text-muted); }

        /* ── 17. Loading skeleton inherits brand accent ──────────────────── */
        .qentrah-calendar-wrapper [class*="animate-pulse"] > div {
          background: color-mix(in srgb, var(--q-accent) 12%, var(--q-bg-secondary)) !important;
        }

      `}</style>
    </div>
  );
}
