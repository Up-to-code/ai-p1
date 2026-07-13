import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/auth-request";
import {
  readOrganizationId,
  readWorkspaceIdParam,
  workspaceOrganizationReadJson,
  workspaceReadJsonForOrganization,
} from "@/server/domains/organization/handlers/workspace-read-surface";

const opportunityStages = ["new", "qualified", "proposal", "negotiation", "won", "lost"] as const;

export async function handleReadOpportunities(c: Context) {
  return workspaceOrganizationReadJson(c, "opportunities list", (organizationId) =>
    fetchAuthQuery(api.opportunities.read.list, {
      organizationId,
      stage: opportunityStages.includes(c.req.query("stage") as never) ? c.req.query("stage") as never : undefined,
      search: c.req.query("search") ?? undefined,
      limit: 500,
    }),
  );
}

export async function handleReadOpportunityStats(c: Context) {
  return workspaceOrganizationReadJson(c, "opportunity stats", (organizationId) =>
    fetchAuthQuery(api.opportunities.read.stats, { organizationId }),
  );
}

export async function handleReadOpportunityOptions(c: Context) {
  return workspaceOrganizationReadJson(c, "opportunity options", (organizationId) =>
    fetchAuthQuery(api.opportunities.read.options, { organizationId, limit: 100 }),
  );
}

export async function handleReadOpportunity(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const opportunityId = readWorkspaceIdParam<"opportunities">(c, "opportunityId", "Opportunity id");
  if (!opportunityId.ok) return opportunityId.response;
  return workspaceReadJsonForOrganization(c, "opportunity detail", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.opportunities.read.get, {
      organizationId,
      opportunityId: opportunityId.data,
    }),
  );
}
