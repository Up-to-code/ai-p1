"use client";

import React, { useState, useMemo } from "react";
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
import { cn } from "@/lib/utils";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface CalendarTabProps {
  project: Project;
  organizationId: string;
  spaceId?: string;
}

const eventTypeColors: Record<string, string> = {
  meeting: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  deadline: "bg-red-500/10 text-red-600 dark:text-red-400",
  reminder: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  milestone: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  focusBlock: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export function CalendarTab({ project, organizationId, spaceId }: CalendarTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("meeting");
  const [newTime, setNewTime] = useState("09:00");

  const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getTime();
  const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0, 23, 59, 59).getTime();

  const calendarResult = useCalendarIndexRangeQueryResult(organizationId, startOfMonth, endOfMonth, project.id, spaceId);
  const events = calendarResult.data?.events ?? [];

  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    for (const event of events) {
      const dateKey = event.date || new Date(event.startAt ?? 0).toISOString().split("T")[0];
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(event);
    }
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];

  // Calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  function formatMonth(date: Date) {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Mini Calendar */}
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {/* Month header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <h3 className="text-sm font-bold text-foreground">{formatMonth(currentMonth)}</h3>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7">
            {days.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} className="h-20 border-b border-r border-border/50" />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayEvents = eventsByDate.get(dateStr) ?? [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "h-20 border-b border-r border-border/50 p-1.5 cursor-pointer transition-colors",
                    isSelected && "bg-primary/5",
                    !isSelected && "hover:bg-muted/30",
                  )}
                >
                  <div className={cn(
                    "text-xs font-bold mb-1",
                    isToday ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center" : "text-foreground",
                  )}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((event: any) => (
                      <div
                        key={event.id}
                        className={cn(
                          "rounded px-1 py-0.5 text-[9px] font-semibold truncate",
                          eventTypeColors[event.type] || "bg-muted text-muted-foreground",
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-muted-foreground font-bold">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected date events / Upcoming */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">
            {selectedDate
              ? `Events on ${new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : "Upcoming Events"}
          </h3>
          <Button
            onClick={() => setIsAdding(true)}
            variant="outline"
            size="sm"
            className="h-7 rounded-lg text-[11px] font-semibold"
          >
            <Plus className="mr-1 h-3 w-3" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {(selectedDate ? selectedEvents : events.filter((e: any) => e.startAt && e.startAt > Date.now()).slice(0, 10)).length > 0 ? (
            (selectedDate ? selectedEvents : events.filter((e: any) => e.startAt && e.startAt > Date.now()).slice(0, 10)).map((event: any) => (
              <div key={event.id} className="rounded-xl border border-border bg-card p-3 hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize",
                    eventTypeColors[event.type] || "bg-muted text-muted-foreground",
                  )}>
                    {event.type}
                  </span>
                </div>
                <p className="text-sm font-medium text-foreground">{event.title}</p>
                <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                  {event.startAt && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(event.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  )}
                  {event.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <CalendarIcon className="mx-auto mb-3 h-6 w-6 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                {selectedDate ? "No events on this day." : "No upcoming events."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
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
                  date: selectedDate || new Date().toISOString().split("T")[0],
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
