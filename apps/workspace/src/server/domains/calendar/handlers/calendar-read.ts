import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/convex-auth";
import {
  readBoundedOptionalLimit,
  readOrganizationId,
  workspaceReadJsonForOrganization,
} from "@/server/domains/organization/handlers/workspace-read-surface";
import {
  readOptionalNumberQuery,
  readTimeRangeQuery,
} from "@/server/domains/organization/handlers/workspace-read-helper";

export async function handleReadCalendarEvents(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const range = readTimeRangeQuery(c, { requireBoth: true });
  if (!range.ok) return range.response;
  return workspaceReadJsonForOrganization(c, "calendar events", organizationId.data, async (organizationId) => {
    return range.data
      ? await fetchAuthQuery(api.calendar.read.listRange, {
          organizationId,
          startAt: range.data.startAt,
          endAt: range.data.endAt,
        })
      : await fetchAuthQuery(api.calendar.read.list, {
          organizationId,
        });
  });
}

export async function handleReadCalendarStats(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const range = readTimeRangeQuery(c, { defaultStartAt: 0, defaultEndAt: Date.now() });
  if (!range.ok) return range.response;
  return workspaceReadJsonForOrganization(c, "calendar stats", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.calendar.read.statsInRange, {
      organizationId,
      startAt: range.data!.startAt,
      endAt: range.data!.endAt,
    }),
  );
}

export async function handleReadCalendarIndex(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const range = readTimeRangeQuery(c, { requireBoth: true });
  if (!range.ok) return range.response;

  return workspaceReadJsonForOrganization(c, "calendar index", organizationId.data, async (organizationId) => {
    const [events, stats] = await Promise.all([
      fetchAuthQuery(api.calendar.read.listRange, {
        organizationId,
        startAt: range.data!.startAt,
        endAt: range.data!.endAt,
      }),
      fetchAuthQuery(api.calendar.read.statsInRange, {
        organizationId,
        startAt: range.data!.startAt,
        endAt: range.data!.endAt,
      }),
    ]);
    return { events, stats };
  });
}

export async function handleReadUpcomingCalendarEvents(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const startAt = readOptionalNumberQuery(c, "startAt");
  if (!startAt.ok) return startAt.response;
  const limit = readBoundedOptionalLimit(c, 100);
  if (!limit.ok) return limit.response;

  return workspaceReadJsonForOrganization(c, "upcoming calendar events", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.calendar.read.listUpcoming, {
      organizationId,
      startAt: startAt.data ?? Date.now(),
      limit: limit.data,
    }),
  );
}
