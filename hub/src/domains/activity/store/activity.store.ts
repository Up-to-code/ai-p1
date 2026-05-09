import { create } from "zustand";
import type { ActivityEvent } from "./activity.types";

interface ActivityState {
  events: ActivityEvent[];
  getById: (id: string) => ActivityEvent | undefined;
}

export const useActivityStore = create<ActivityState>((_, get) => ({
  events: [
    { id: "act-1", actor: "Sara Al-Rashid", action: "approved", target: "Al Madinah Residences", status: "approved", date: "2m ago" },
    { id: "act-2", actor: "Sync Engine", action: "blocked", target: "Jeddah Tower Complex", status: "blocked", date: "1h ago" },
    { id: "act-3", actor: "Workspace Owner", action: "created draft", target: "Villa 7", status: "draft", date: "3h ago" },
    { id: "act-4", actor: "Institutional CRM", action: "requested review", target: "Capital Ventures", status: "pending", date: "1d ago" },
  ],
  getById: (id) => get().events.find((event) => event.id === id),
}));
