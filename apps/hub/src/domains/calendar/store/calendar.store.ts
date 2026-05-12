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

const events: CalendarEvent[] = [
  { id: "cal-1", title: "Waterfront villa viewing", owner: "Fahad Al-Saud", date: "2026-05-07", time: "10:30", type: "site-viewing", status: "confirmed", clientId: "cl-4", unitId: "unt-3", location: "KAFD District" },
  { id: "cal-2", title: "Budget allocation audit", owner: "Capital Ventures", date: "2026-05-08", time: "13:00", type: "audit", status: "pending", clientId: "cl-3" },
  { id: "cal-3", title: "Broker handover sync", owner: "Sara Al-Rashid", date: "2026-05-09", time: "15:15", type: "handover", status: "draft", clientId: "cl-2" },
  { id: "cal-4", title: "Unit A-101 inspection", owner: "Abdullah Al-Faisal", date: "2026-05-10", time: "09:00", type: "site-viewing", status: "confirmed", clientId: "cl-1", unitId: "unt-1", location: "Al Madinah Residences" },
  { id: "cal-5", title: "Mortgage paperwork follow-up", owner: "Abdullah Al-Faisal", date: "2026-05-10", time: "14:00", type: "follow-up", status: "pending", clientId: "cl-1" },
  { id: "cal-6", title: "Penthouse B-301 tour", owner: "Capital Ventures", date: "2026-05-12", time: "11:00", type: "client-visit", status: "confirmed", clientId: "cl-3", unitId: "unt-2", location: "Jeddah Corniche" },
  { id: "cal-7", title: "Al Madinah handover", owner: "Fahad Al-Saud", date: "2026-05-15", time: "10:00", type: "handover", status: "pending", clientId: "cl-4" },
  { id: "cal-8", title: "Contract signing - Villa 12", owner: "Capital Ventures", date: "2026-05-18", time: "09:30", type: "signing", status: "draft", clientId: "cl-3", notes: "Bring 3 copies of the contract" },
  { id: "cal-9", title: "Jeddah site visit", owner: "Sara Al-Rashid", date: "2026-05-22", time: "08:00", type: "appointment", status: "confirmed", clientId: "cl-2", location: "Jeddah North" },
  { id: "cal-10", title: "Contract renewal follow-up", owner: "Abdullah Al-Faisal", date: "2026-05-25", time: "16:00", type: "follow-up", status: "pending", clientId: "cl-1" },
];

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
