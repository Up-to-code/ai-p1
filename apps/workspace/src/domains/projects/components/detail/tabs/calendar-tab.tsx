"use client";

import React, { useState } from "react";
import { type Project } from "../../../store/projects.types";
import { useCalendarIndexRangeQueryResult, createCalendarEventRequest } from "@/domains/calendar/api/calendar";
import { useAuthSession } from "@/domains/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@svar-ui/react-calendar";
import type { CalendarEvent as CalendarEventType } from "@/domains/calendar/store/calendar.types";

interface CalendarTabProps {
  project: Project;
  organizationId: string;
  spaceId?: string;
}

const eventTypeColors: Record<string, string> = {
  meeting: "#6F00C2",
  deadline: "#A71E0F",
  reminder: "#ED8E00",
  milestone: "#00753E",
  focusBlock: "#31574B",
};

export function CalendarTab({ project, organizationId, spaceId }: CalendarTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("meeting");
  const [newTime, setNewTime] = useState("09:00");
  const [newDate, setNewDate] = useState("");

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime();
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).getTime();

  const calendarResult = useCalendarIndexRangeQueryResult(organizationId, startOfMonth, endOfMonth, project.id, spaceId);
  const events = calendarResult.data?.events ?? [];

  const displayEvents = events.map((ev: CalendarEventType) => {
    const start = new Date(`${ev.date}T${ev.time || "00:00"}`);
    const end = ev.endTime
      ? new Date(`${ev.date}T${ev.endTime}`)
      : new Date(start.getTime() + 60 * 60 * 1000);
    return {
      id: ev.id,
      title: ev.title,
      start,
      end,
      color: eventTypeColors[ev.type] || "#6F00C2",
      type: ev.type,
      status: ev.status,
      location: ev.location,
      description: ev.notes,
    };
  });

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border overflow-hidden bg-card" style={{ height: "calc(100vh - 340px)" }}>
        <Calendar
          events={displayEvents}
          view="month"
          date={currentMonth}
        />
      </div>

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>Schedule an event for this project.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              placeholder="Event title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="text-sm"
              autoFocus
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                >
                  <option value="meeting">Meeting</option>
                  <option value="deadline">Deadline</option>
                  <option value="reminder">Reminder</option>
                  <option value="milestone">Milestone</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Time</label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="text-sm dark:[color-scheme:dark]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)} className="h-8 text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={async () => {
                if (!newTitle.trim()) return;
                await createCalendarEventRequest(organizationId, {
                  title: newTitle,
                  owner: "project",
                  type: newType as any,
                  date: newDate || new Date().toISOString().split("T")[0],
                  time: newTime,
                  status: "confirmed",
                  projectId: project.id,
                });
                setNewTitle("");
                setIsAdding(false);
              }}
              disabled={!newTitle.trim()}
              className="h-8 text-xs"
            >
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
