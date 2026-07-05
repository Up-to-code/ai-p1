"use client";

import { useMemo, useState, useCallback } from "react";
import { ChevronDown, Search } from "lucide-react";
import { View } from "react-big-calendar";
import { useCalendarStore } from "../store/calendar.store";
import type { CalendarEvent } from "../store/calendar.types";
import { useAuthSession } from "@/domains/auth";
import { visibleCalendarRange } from "../calendar-view-model";
import type { CalendarView } from "../calendar-view-model";
import { useCalendarIndexRangeQueryResult, createCalendarEventRequest } from "../api/calendar";
import { useCurrentProjectId } from "@/domains/projects/hooks/use-current-project-id";
import { useNavigation } from "@/domains/navigation";
import { HttpQueryState, WorkspaceQueryState } from "@/components/shared/crud-ui";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { CalendarComponent } from "@/components/ui/calendar";
import { EventCreationModal } from "./event-creation-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const EVENT_COLORS: Record<CalendarEvent["type"], string> = {
  meeting: "#007AFF",
  deadline: "#FF3B30",
  reminder: "#FF9500",
  milestone: "#34C759",
  focusBlock: "#AF52DE",
};

function getEventColor(type: CalendarEvent["type"], status: CalendarEvent["status"]): string {
  if (status === "draft") return "#8e8e93";
  return EVENT_COLORS[type] ?? "#007AFF";
}

interface RBCEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  type?: string;
  status?: string;
  location?: string;
}

export function CalendarPageRedesigned() {
  const t = useTranslations("Calendar");
  const session = useAuthSession();
  const [showEventModal, setShowEventModal] = useState(false);
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>(undefined);
  const [modalInitialEndTime, setModalInitialEndTime] = useState<Date | undefined>(undefined);
  const [calendarView, setCalendarView] = useState<View>("week");
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [viewSearch, setViewSearch] = useState("");
  const [showViewMenu, setShowViewMenu] = useState(false);

  const workspaceStatus = session.workspace.status;
  const isWorkspaceReady = workspaceStatus === "ready";
  const workspaceOrganizationId = isWorkspaceReady && session.workspace.organizationId
    ? session.workspace.organizationId
    : undefined;

  const { currentDate, view, setCurrentDate, setView } = useCalendarStore();

  const range = useMemo(
    () => visibleCalendarRange(currentDate, view),
    [currentDate, view],
  );

  const projectId = useCurrentProjectId();
  const { spaceId } = useNavigation();

  const eventsQuery = useCalendarIndexRangeQueryResult(
    workspaceOrganizationId,
    range.startAt,
    range.endAt,
    projectId,
    spaceId,
  );

  const events = useMemo(
    () => (eventsQuery.data?.events ?? []) as CalendarEvent[],
    [eventsQuery.data],
  );

  const isLoading = isWorkspaceReady && eventsQuery.queryStatus === "loading";
  const isQueryBlocked = isLoading || eventsQuery.queryStatus === "error";

  // Transform CalendarEvent for react-big-calendar
  const displayEvents = useMemo(() => {
    return events.map((ev) => {
      const start = new Date(`${ev.date}T${ev.time || "00:00"}`);
      const end = ev.endTime ? new Date(`${ev.date}T${ev.endTime}`) : new Date(start.getTime() + 60 * 60 * 1000); // Default 1 hour
      return {
        id: ev.id,
        title: ev.title,
        start,
        end,
        color: getEventColor(ev.type, ev.status),
        type: ev.type,
        status: ev.status,
        location: ev.location,
      } as RBCEvent;
    });
  }, [events]);


  const handleEventClick = useCallback((event: RBCEvent) => {
    // Handle event click - could open event details modal
    console.log("Event clicked:", event);
  }, []);

  const handleSlotClick = useCallback((slotInfo: { start: Date; end: Date }) => {
    setModalInitialDate(slotInfo.start);
    setModalInitialEndTime(slotInfo.end);
    setShowEventModal(true);
  }, []);

  const handleSaveEvent = useCallback(async (data: any) => {
    if (!workspaceOrganizationId) return;
    
    try {
      await createCalendarEventRequest(workspaceOrganizationId, {
        title: data.title,
        owner: session.user?.id || "unknown",
        date: data.date,
        time: data.time,
        endTime: data.endTime,
        type: data.type,
        location: data.location,
        notes: data.notes,
        status: "confirmed",
      });
      // The query will automatically refetch due to TanStack Query
    } catch (error) {
      console.error("Failed to create event:", error);
    }
  }, [workspaceOrganizationId, session.user?.id]);

  const handleCalendarNavigate = useCallback((date: Date) => {
    setCalendarDate(date);
    setCurrentDate(date);
  }, [setCurrentDate]);

  const handleCalendarView = useCallback((view: View) => {
    setCalendarView(view);
    const viewMapping: Record<View, CalendarView> = {
      "month": "month",
      "week": "week",
      "day": "day",
      "agenda": "month",
      "work_week": "week",
    };
    setView(viewMapping[view] || "week");
  }, [setView]);

  if (workspaceStatus !== "ready") {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <WorkspaceQueryState status={workspaceStatus} variant="calendar" />
      </div>
    );
  }

  if (isQueryBlocked) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <HttpQueryState query={eventsQuery} variant="calendar" />
      </div>
    );
  }

  const viewOptions: { value: View; label: string }[] = [
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "day", label: "Day" },
    { value: "agenda", label: "Agenda" },
    { value: "work_week", label: "Work Week" },
  ];

  const filteredViewOptions = viewOptions.filter((option) =>
    option.label.toLowerCase().includes(viewSearch.toLowerCase())
  );

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6 py-3">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
          
          <Popover open={showViewMenu} onOpenChange={setShowViewMenu}>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                {viewOptions.find((v) => v.value === calendarView)?.label || "Week"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <div className="p-4 border-b border-border/50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search views..."
                    value={viewSearch}
                    onChange={(e) => setViewSearch(e.target.value)}
                    className="pl-9 h-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-ring/20"
                  />
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto py-2">
                {filteredViewOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setCalendarView(option.value);
                      handleCalendarView(option.value);
                      setShowViewMenu(false);
                      setViewSearch("");
                    }}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm transition-colors mx-2 rounded-md",
                      calendarView === option.value
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Full-screen calendar */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground">Loading calendar...</div>
          </div>
        ) : (
          <CalendarComponent
            events={displayEvents}
            onEventClick={handleEventClick}
            onSlotClick={handleSlotClick}
            view={calendarView}
            onView={handleCalendarView}
            date={calendarDate}
            onNavigate={handleCalendarNavigate}
            className="h-full"
          />
        )}
      </div>

      <EventCreationModal
        open={showEventModal}
        onOpenChange={setShowEventModal}
        initialDate={modalInitialDate}
        initialEndTime={modalInitialEndTime}
        onSave={handleSaveEvent}
      />
    </div>
  );
}
