import type { Context } from "hono";
import { api } from "@convex/_generated/api";
import { fetchAuthQuery } from "@/server/auth/clerk-convex";
import {
  readOrganizationId,
  readWorkspaceIdParam,
  workspaceOrganizationReadJson,
  workspaceReadJsonForOrganization,
} from "@/server/domains/organization/handlers/workspace-read-surface";

const dealStages = ["lead", "qualified", "proposal_sent", "contract_sent", "won", "lost"] as const;

export async function handleReadDeals(c: Context) {
  return workspaceOrganizationReadJson(c, "deals list", (organizationId) =>
    fetchAuthQuery(api.deals.read.list, {
      organizationId,
      stage: dealStages.includes(c.req.query("stage") as never) ? c.req.query("stage") as never : undefined,
      search: c.req.query("search") ?? undefined,
      limit: 500,
    }),
  );
}

export async function handleReadDealStats(c: Context) {
  return workspaceOrganizationReadJson(c, "deal stats", (organizationId) =>
    fetchAuthQuery(api.deals.read.stats, { organizationId }),
  );
}

export async function handleReadDealOptions(c: Context) {
  return workspaceOrganizationReadJson(c, "deal options", (organizationId) =>
    fetchAuthQuery(api.deals.read.options, { organizationId, limit: 100 }),
  );
}

export async function handleReadDeal(c: Context) {
  const organizationId = readOrganizationId(c);
  if (!organizationId.ok) return organizationId.response;
  const dealId = readWorkspaceIdParam<"deals">(c, "dealId", "Deal id");
  if (!dealId.ok) return dealId.response;
  return workspaceReadJsonForOrganization(c, "deal detail", organizationId.data, (organizationId) =>
    fetchAuthQuery(api.deals.read.get, {
      organizationId,
      dealId: dealId.data,
    }),
  );
}
