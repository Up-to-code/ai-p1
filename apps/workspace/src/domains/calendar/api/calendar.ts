"use client";

import { useMemo, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import {
  useWorkspaceResource,
  useWorkspaceResourceResult,
  workspaceMutation,
} from "@/domains/resources/workspace-resource-request";
import type { CalendarEvent } from "../store/calendar.types";
import type { CalendarEventFormValues } from "../validation/calendar.schema";

type CalendarStats = {
  total: number;
  confirmed: number;
  pending: number;
  draft: number;
  owners: number;
};

type CalendarIndex = {
  events: CalendarEvent[];
  stats: CalendarStats;
};

export function useCalendarEventsQuery(organizationId?: string, clientId?: string, options: { enabled?: boolean } = {}) {
  const args = useMemo(() => {
    if (!organizationId || options.enabled === false) return "skip" as const;
    return {
      organizationId,
      ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    };
  }, [clientId, options.enabled, organizationId]);

  return useWorkspaceResource<CalendarEvent[]>(
    ["calendar", "list", args],
    organizationId && options.enabled !== false ? organizationId : undefined,
    "calendar",
    clientId ? { clientId } : undefined,
  );
}

export function useUpcomingCalendarEventsQuery(
  organizationId: string | undefined,
  options: { enabled?: boolean; limit?: number; startAt?: number } = {},
) {
  const [defaultStartAt] = useState(() => Date.now());
  const startAt = options.startAt ?? defaultStartAt;
  return useWorkspaceResource<CalendarEvent[]>(
    ["calendar", "upcoming", organizationId, startAt, options.limit],
    organizationId && options.enabled !== false ? organizationId : undefined,
    "calendar/upcoming",
    { startAt, limit: options.limit ?? 50 },
  );
}

export function useCalendarEventsRangeQuery(organizationId: string | undefined, startAt: number, endAt: number) {
  return useCalendarEventsRangeQueryResult(organizationId, startAt, endAt).data;
}

export function useCalendarEventsRangeQueryResult(organizationId: string | undefined, startAt: number, endAt: number) {
  const args = useMemo(
    () => organizationId ? { organizationId, startAt, endAt } : "skip" as const,
    [endAt, organizationId, startAt],
  );

  return useWorkspaceResourceResult<CalendarEvent[]>(
    ["calendar", "range", args],
    organizationId,
    "calendar",
    organizationId ? { startAt, endAt } : undefined,
  );
}

export function useCalendarIndexRangeQueryResult(organizationId: string | undefined, startAt: number, endAt: number, projectId?: string | null) {
  const args = useMemo(
    () => organizationId ? { organizationId, startAt, endAt, projectId: projectId ?? undefined } : "skip" as const,
    [endAt, organizationId, startAt, projectId],
  );

  return useWorkspaceResourceResult<CalendarIndex>(
    ["calendar", "index", args],
    organizationId,
    "calendar/index",
    organizationId ? { startAt, endAt, projectId: projectId ?? undefined } : undefined,
  );
}

export function useCalendarStatsRangeQuery(organizationId: string | undefined, startAt: number, endAt: number) {
  return useCalendarStatsRangeQueryResult(organizationId, startAt, endAt).data;
}

export function useCalendarStatsRangeQueryResult(organizationId: string | undefined, startAt: number, endAt: number) {
  const args = useMemo(
    () => organizationId ? { organizationId, startAt, endAt } : "skip" as const,
    [endAt, organizationId, startAt],
  );

  return useWorkspaceResourceResult<CalendarStats>(
    ["calendar", "stats", args],
    organizationId,
    "calendar/stats",
    organizationId ? { startAt, endAt } : undefined,
  );
}

export async function createCalendarEventRequest(organizationId: string, values: CalendarEventFormValues) {
  return workspaceMutation(organizationId, "calendar-events", {
    method: "POST",
    body: values,
    fallbackMessage: "Calendar request failed.",
  });
}

export async function updateCalendarEventRequest(organizationId: string, eventId: string, values: CalendarEventFormValues) {
  return workspaceMutation(organizationId, `calendar-events/${eventId}`, {
    method: "PATCH",
    body: values,
    fallbackMessage: "Calendar request failed.",
  });
}

export async function deleteCalendarEventRequest(organizationId: string, eventId: string) {
  return workspaceMutation(organizationId, `calendar-events/${eventId}`, {
    method: "DELETE",
    fallbackMessage: "Calendar request failed.",
  });
}
