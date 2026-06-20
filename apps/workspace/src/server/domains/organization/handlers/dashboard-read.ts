import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/clerk-convex";
import {
  readOrganizationId,
  workspaceReadJsonForOrganization,
} from "./workspace-read-surface";
import { readTimeRangeQuery } from "./workspace-read-helper";

export async function handleReadDashboardOverview(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const range = readTimeRangeQuery(c, { defaultStartAt: 0, defaultEndAt: Date.now() });
  if (!range.ok) return range.response;
  return workspaceReadJsonForOrganization(c, "dashboard overview", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.dashboard.read.overview, {
      organizationId,
      startAt: range.data!.startAt,
      endAt: range.data!.endAt,
    }),
  );
}

export async function handleReadDashboardIndex(c: Context) {
  return handleReadDashboardOverview(c);
}
