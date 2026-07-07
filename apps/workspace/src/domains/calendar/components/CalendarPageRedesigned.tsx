"use client";

import { useState, useCallback } from "react";
import { useCalendarStore } from "../store/calendar.store";
import type { CalendarView } from "../calendar-view-model";
import { Calendar } from "@svar-ui/react-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting: "#6F00C2",
  deadline: "#A71E0F",
  reminder: "#ED8E00",
  milestone: "#00753E",
  focusBlock: "#31574B",
};

const MOCK_EVENTS = [
  {
    id: "1",
    title: "Sprint Planning",
    start: new Date(new Date().setHours(9, 0, 0, 0)),
    end: new Date(new Date().setHours(10, 30, 0, 0)),
    type: "meeting",
    description: "Weekly sprint planning session",
    location: "Conference Room A",
    status: "confirmed",
    color: EVENT_TYPE_COLORS.meeting,
  },
  {
    id: "2",
    title: "Q3 Deadline",
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    allDay: true,
    type: "deadline",
    description: "Q3 deliverables due",
    status: "confirmed",
    color: EVENT_TYPE_COLORS.deadline,
  },
  {
    id: "3",
    title: "Client Call — Acme Corp",
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
    type: "meeting",
    description: "Monthly review with Acme",
    location: "Zoom",
    status: "confirmed",
    color: EVENT_TYPE_COLORS.meeting,
  },
  {
    id: "4",
    title: "Design Review",
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    allDay: true,
    type: "milestone",
    description: "Design system audit",
    status: "confirmed",
    color: EVENT_TYPE_COLORS.milestone,
  },
  {
    id: "5",
    title: "Focus Time",
    start: new Date(new Date(new Date().setHours(7, 0, 0, 0)).setDate(new Date().getDate() + 1)),
    end: new Date(new Date(new Date().setHours(9, 0, 0, 0)).setDate(new Date().getDate() + 1)),
    type: "focusBlock",
    description: "Deep work — no meetings",
    status: "confirmed",
    color: EVENT_TYPE_COLORS.focusBlock,
  },
  {
    id: "6",
    title: "Follow up: Vendor contract",
    start: new Date(new Date(new Date().setHours(11, 0, 0, 0)).setDate(new Date().getDate() - 1)),
    end: new Date(new Date(new Date().setHours(11, 30, 0, 0)).setDate(new Date().getDate() - 1)),
    type: "reminder",
    description: "Send revised contract to vendor",
    status: "confirmed",
    color: EVENT_TYPE_COLORS.reminder,
  },
];

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  type?: string;
  status?: string;
  location?: string;
  description?: string;
  allDay?: boolean;
}

export function CalendarPageRedesigned() {
  const { currentDate, view, setCurrentDate, setView } = useCalendarStore();
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventStart, setNewEventStart] = useState<Date>(new Date());
  const [newEventEnd, setNewEventEnd] = useState<Date>(new Date());
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<string>("meeting");
  const [newTime, setNewTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("10:00");
  const [newLocation, setNewLocation] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleEventClick = useCallback((_event: CalendarEvent) => {
    // Show event details — can be expanded later
  }, []);

  const handleSlotCreate = useCallback((start: Date, end: Date) => {
    setNewEventStart(start);
    setNewEventEnd(end);
    const hours = String(start.getHours()).padStart(2, "0");
    const mins = String(start.getMinutes()).padStart(2, "0");
    const endHours = String(end.getHours()).padStart(2, "0");
    const endMins = String(end.getMinutes()).padStart(2, "0");
    setNewTime(`${hours}:${mins}`);
    setNewEndTime(`${endHours}:${endMins}`);
    setNewTitle("");
    setNewType("meeting");
    setNewLocation("");
    setNewDescription("");
    setShowEventModal(true);
  }, []);

  const handleSaveEvent = useCallback(() => {
    if (!newTitle.trim()) return;
    const [sh, sm] = newTime.split(":").map(Number);
    const [eh, em] = newEndTime.split(":").map(Number);
    const start = new Date(newEventStart);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(newEventStart);
    end.setHours(eh, em, 0, 0);

    const newEvent: CalendarEvent = {
      id: `mock-${Date.now()}`,
      title: newTitle.trim(),
      start,
      end,
      type: newType,
      color: EVENT_TYPE_COLORS[newType] || EVENT_TYPE_COLORS.meeting,
      description: newDescription,
      location: newLocation,
      status: "confirmed",
    };
    setEvents((prev) => [...prev, newEvent]);
    setShowEventModal(false);
  }, [newTitle, newType, newTime, newEndTime, newEventStart, newLocation, newDescription]);

  const handleEventUpdate = useCallback((updated: CalendarEvent) => {
    setEvents((prev) => prev.map((e) => (e.id === updated.id ? { ...e, ...updated } : e)));
  }, []);

  const handleEventDelete = useCallback((eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }, []);

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
  }, [setCurrentDate]);

  const handleViewChange = useCallback((newView: CalendarView) => {
    setView(newView);
  }, [setView]);

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header area with breathing room */}
      <div className="shrink-0 px-6 pt-5 pb-2 flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Calendar</h1>
        <div className="text-xs text-muted-foreground">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Calendar body — full width, no shadows, padded bottom */}
      <div className="flex-1 min-h-0 px-2 pb-4">
        <div className="h-full w-full rounded-xl overflow-hidden border border-border bg-card">
          <Calendar
            events={events}
            view={view}
            date={currentDate}
          />
        </div>
      </div>

      {/* Create Event Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Event</DialogTitle>
            <DialogDescription>
              {newEventStart.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Event title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-sm"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                  <option value="milestone">Milestone</option>
                  <option value="focusBlock">Focus Block</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Color</label>
                <div
                  className="h-9 w-full rounded-lg border border-border flex items-center gap-2 px-3"
                  style={{ backgroundColor: `${EVENT_TYPE_COLORS[newType] || EVENT_TYPE_COLORS.meeting}14` }}
                >
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: EVENT_TYPE_COLORS[newType] || EVENT_TYPE_COLORS.meeting }}
                  />
                  <span className="text-sm" style={{ color: EVENT_TYPE_COLORS[newType] || EVENT_TYPE_COLORS.meeting }}>
                    {newType}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Start</label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="text-sm dark:[color-scheme:dark]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">End</label>
                <Input
                  type="time"
                  value={newEndTime}
                  onChange={(e) => setNewEndTime(e.target.value)}
                  className="text-sm dark:[color-scheme:dark]"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
              <Input
                placeholder="Room, link, or address"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Notes</label>
              <Input
                placeholder="Add description..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowEventModal(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSaveEvent} disabled={!newTitle.trim()}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
