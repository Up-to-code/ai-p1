import { create } from "zustand";
import type { CalendarEvent } from "./calendar.types";

interface CalendarState {
  events: CalendarEvent[];
  currentDate: Date;
  view: "month" | "week" | "day";
  setCurrentDate: (date: Date) => void;
  setView: (view: "month" | "week" | "day") => void;
  getById: (id: string) => CalendarEvent | undefined;
  getEventsForDate: (date: Date) => CalendarEvent[];
  createEvent: (input: Omit<CalendarEvent, "id">) => CalendarEvent;
  updateEvent: (id: string, input: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
}

const events: CalendarEvent[] = [];

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events,
  currentDate: new Date(),
  view: "month",
  setCurrentDate: (date) => set({ currentDate: date }),
  setView: (view) => set({ view }),
  getById: (id) => get().events.find((event) => event.id === id),
  getEventsForDate: (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return get().events.filter((event) => event.date === dateStr);
  },
  createEvent: (input) => {
    const next: CalendarEvent = { ...input, id: `cal-${Date.now()}` };
    set((state) => ({ events: [next, ...state.events] }));
    return next;
  },
  updateEvent: (id, input) => set((state) => ({
    events: state.events.map((event) => (event.id === id ? { ...event, ...input } : event)),
  })),
  deleteEvent: (id) => set((state) => ({ events: state.events.filter((event) => event.id !== id) })),
}));
