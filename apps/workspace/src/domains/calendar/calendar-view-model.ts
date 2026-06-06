import { formatLocationLabel, type LocationValue } from "@qentrah/location-map";
import type { CalendarEvent } from "./store/calendar.types";
import type { CalendarEventFormValues } from "./validation/calendar.schema";

export type CalendarView = "month" | "week" | "day";
export type CalendarStatusTone = "neutral" | "success" | "warning";

export const customEventTypeValues: CalendarEventFormValues["type"][] = [
  "visit",
  "call",
  "meeting",
  "follow-up",
  "client-visit",
  "site-viewing",
  "appointment",
  "signing",
  "handover",
  "audit",
  "custom",
];

function addCalendarDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

export function formatCalendarTimeLabel(value: string) {
  const [hourValue, minuteValue] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hourValue, minuteValue, 0, 0);
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function serializeCalendarLocation(location: LocationValue) {
  const parts = [
    formatLocationLabel(location),
    typeof location.latitude === "number" && typeof location.longitude === "number"
      ? `${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`
      : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

export function calendarLocationValueFromString(value?: string): LocationValue | null {
  if (!value?.trim()) return null;
  const [label, coordinates] = value.split("|").map((part) => part.trim());
  const [latitude, longitude] = coordinates?.split(",").map(Number) ?? [];
  return {
    label: label || value,
    latitude: Number.isFinite(latitude) ? latitude : undefined,
    longitude: Number.isFinite(longitude) ? longitude : undefined,
  };
}

export function calendarEventTone(status: CalendarEvent["status"]): CalendarStatusTone {
  return status === "confirmed"
    ? "success"
    : status === "pending"
      ? "warning"
      : "neutral";
}

export function calendarEventTypeClassName(type: string) {
  if (type === "visit")
    return "bg-cyan-50 border-cyan-200 text-cyan-800 dark:bg-cyan-400/10 dark:border-cyan-400/20 dark:text-cyan-300";
  if (type === "call")
    return "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-800 dark:bg-fuchsia-400/10 dark:border-fuchsia-400/20 dark:text-fuchsia-300";
  if (type === "meeting")
    return "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-400/10 dark:border-amber-400/20 dark:text-amber-300";
  if (type === "client-visit")
    return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300";
  if (type === "site-viewing")
    return "bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-300";
  if (type === "appointment")
    return "bg-violet-50 border-violet-200 text-violet-800 dark:bg-violet-900/20 dark:border-violet-800 dark:text-violet-300";
  if (type === "signing")
    return "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300";
  if (type === "follow-up")
    return "bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-300";
  if (type === "handover")
    return "bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/20 dark:border-teal-800 dark:text-teal-300";
  if (type === "audit")
    return "bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300";
  return "bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-800/40 dark:border-zinc-700 dark:text-zinc-300";
}

export function calendarScheduleTitle(typeLabel: string, context?: string) {
  return context ? `${typeLabel} - ${context}` : typeLabel;
}

export function calendarIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getCalendarMonthDays(date: Date): Date[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  for (let i = firstDay.getDay() - 1; i >= 0; i--) {
    const d = new Date(firstDay);
    d.setDate(firstDay.getDate() - i - 1);
    days.push(d);
  }
  for (let day = 1; day <= lastDay.getDate(); day++) {
    days.push(new Date(year, month, day));
  }
  const lastDow = lastDay.getDay();
  for (let i = 1; i < 7 - lastDow; i++) {
    const d = new Date(lastDay);
    d.setDate(lastDay.getDate() + i);
    days.push(d);
  }
  return days;
}

export function getCalendarWeekDays(date: Date): Date[] {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function startOfCalendarDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function endOfCalendarDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function visibleCalendarRange(date: Date, view: CalendarView) {
  if (view === "day") {
    return { startAt: startOfCalendarDay(date), endAt: endOfCalendarDay(date) };
  }
  const days = view === "week" ? getCalendarWeekDays(date) : getCalendarMonthDays(date);
  return {
    startAt: startOfCalendarDay(days[0]),
    endAt: endOfCalendarDay(days[days.length - 1]),
  };
}

export function calendarHeaderLabel(date: Date, view: CalendarView, locale: string) {
  if (view === "month") {
    return date.toLocaleDateString(locale, { month: "long", year: "numeric" });
  }
  if (view === "week") {
    const days = getCalendarWeekDays(date);
    return `${days[0].toLocaleDateString(locale, { month: "short", day: "numeric" })} - ${days[6].toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}`;
  }
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function calendarShortMonthLabel(date: Date, locale: string) {
  return date.toLocaleDateString(locale, { month: "short" });
}

export function calendarDayMonthLabel(date: Date, locale: string) {
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
  });
}

export function calendarLongDayLabel(date: Date, locale: string) {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function calendarLongDayYearLabel(date: Date, locale: string) {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function calendarIsoOptionLabel(value: string, locale?: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    weekday: "short",
    year: "numeric",
  });
}

export function nextCalendarDate(date: Date, view: CalendarView, direction: 1 | -1) {
  const next = new Date(date);
  if (view === "month") next.setMonth(next.getMonth() + direction);
  else if (view === "week") next.setDate(next.getDate() + direction * 7);
  else next.setDate(next.getDate() + direction);
  return next;
}

export function calendarEventsByDate(events: CalendarEvent[]) {
  const map: Record<string, CalendarEvent[]> = {};
  events.forEach((event) => {
    if (!map[event.date]) map[event.date] = [];
    map[event.date].push(event);
  });
  return map;
}

export function generateCalendarTimeSlots() {
  const slots: string[] = [];
  for (let h = 8; h <= 20; h++) {
    for (let m = 0; m < 60; m += 30) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return slots;
}

function isCalendarEventInSlot(eventTime: string, slotTime: string) {
  const [eh, em] = eventTime.split(":").map(Number);
  const [sh, sm] = slotTime.split(":").map(Number);
  const eventMin = eh * 60 + em;
  const slotMin = sh * 60 + sm;
  return eventMin >= slotMin && eventMin < slotMin + 30;
}

export function orderedCalendarEvents<TEvent extends { time: string }>(events: TEvent[]) {
  return [...events].sort((a, b) => a.time.localeCompare(b.time));
}

export function calendarEventsForTimeSlot<TEvent extends { time: string }>(
  events: TEvent[],
  slotTime: string,
) {
  return orderedCalendarEvents(events.filter((event) => isCalendarEventInSlot(event.time, slotTime)));
}

export function calendarDateOptions(today: Date, selectedDate?: string, days = 45) {
  const values = Array.from({ length: days }, (_, index) => calendarIsoDate(addCalendarDays(today, index)));
  if (selectedDate && !values.includes(selectedDate)) values.unshift(selectedDate);
  return values;
}

export function calendarTimeOptions(selectedTime?: string) {
  const values = generateCalendarTimeSlots();
  if (selectedTime && !values.includes(selectedTime)) values.unshift(selectedTime);
  return values;
}

export function calendarTasksForClient<TTask extends { clientId?: string | null }>(
  tasks: TTask[],
  clientId?: string | null,
) {
  return tasks.filter((task) => !clientId || task.clientId === clientId);
}

export function visibleCalendarPickerOptions<TOption extends { label: string }>(
  options: TOption[],
  searchValue: string,
) {
  const normalizedSearch = searchValue.trim().toLowerCase();
  return normalizedSearch
    ? options.filter((option) => option.label.toLowerCase().includes(normalizedSearch))
    : options;
}
