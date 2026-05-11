"use client";

import { useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useHttpQuery } from "@/components/shared/use-http-query";
import type { CalendarEvent } from "../store/calendar.types";
import type { CalendarEventFormValues } from "../validation/calendar.schema";

type CalendarStats = {
  total: number;
  confirmed: number;
  pending: number;
  draft: number;
  owners: number;
};

export function useCalendarEventsQuery(organizationId?: string, clientId?: string) {
  const args = useMemo(() => {
    if (!organizationId) return "skip" as const;
    return {
      organizationId,
      ...(clientId ? { clientId: clientId as Id<"clients"> } : {}),
    };
  }, [clientId, organizationId]);

  return useHttpQuery<CalendarEvent[]>(
    ["calendar", "list", args],
    organizationId ? `/api/v1/organizations/${organizationId}/read/calendar` : undefined,
    clientId ? { clientId } : undefined,
  );
}

export function useCalendarEventsRangeQuery(organizationId: string | undefined, startAt: number, endAt: number) {
  const args = useMemo(
    () => organizationId ? { organizationId, startAt, endAt } : "skip" as const,
    [endAt, organizationId, startAt],
  );

  return useHttpQuery<CalendarEvent[]>(
    ["calendar", "range", args],
    organizationId ? `/api/v1/organizations/${organizationId}/read/calendar` : undefined,
    organizationId ? { startAt, endAt } : undefined,
  );
}

export function useCalendarStatsRangeQuery(organizationId: string | undefined, startAt: number, endAt: number) {
  const args = useMemo(
    () => organizationId ? { organizationId, startAt, endAt } : "skip" as const,
    [endAt, organizationId, startAt],
  );

  return useHttpQuery<CalendarStats>(
    ["calendar", "stats", args],
    organizationId ? `/api/v1/organizations/${organizationId}/read/calendar/stats` : undefined,
    organizationId ? { startAt, endAt } : undefined,
  );
}

async function jsonOrThrow(response: Response) {
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Calendar request failed.");
  }
  return payload;
}

export async function createCalendarEventRequest(organizationId: string, values: CalendarEventFormValues) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/calendar-events`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  });
  return jsonOrThrow(response);
}

export async function updateCalendarEventRequest(organizationId: string, eventId: string, values: CalendarEventFormValues) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/calendar-events/${eventId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  });
  return jsonOrThrow(response);
}

export async function deleteCalendarEventRequest(organizationId: string, eventId: string) {
  const response = await fetch(`/api/v1/organizations/${organizationId}/calendar-events/${eventId}`, {
    method: "DELETE",
  });
  return jsonOrThrow(response);
}
