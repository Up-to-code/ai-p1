import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { normalizedKeywords } from "../search/adapters/shared";
import { writeSearchProjection } from "../search/projection";

export async function proposalSearchProjection(ctx: MutationCtx, proposal: Doc<"proposals">) {
  return writeSearchProjection(ctx, base(proposal, "proposal", `/crm/proposals?proposal=${proposal._id}`, proposal.title, proposal.scope, [proposal.status, proposal.commercialModel], proposal.amountMinor));
}

export async function contractSearchProjection(ctx: MutationCtx, contract: Doc<"contracts">) {
  return writeSearchProjection(ctx, base(contract, "contract", `/crm/contracts?contract=${contract._id}`, contract.title, [contract.scope, contract.billingTerms].join("\n"), [contract.status, contract.commercialModel], contract.amountMinor));
}

export async function engagementSearchProjection(ctx: MutationCtx, engagement: Doc<"engagements">) {
  const links = await ctx.db.query("engagementProjects").withIndex("by_engagement_project", (q) =>
    q.eq("organizationId", engagement.organizationId).eq("engagementId", engagement._id),
  ).collect();
  const projectIds = links.filter((link) => !link.deletedAt).map((link) => String(link.projectId));
  return writeSearchProjection(ctx, {
    ...base(engagement, "engagement", `/delivery/engagements?engagement=${engagement._id}`, engagement.name, engagement.scope, [engagement.status, engagement.health, engagement.commercialModel], engagement.agreedAmountMinor),
    scopeType: projectIds.length ? "project" : "organization", projectIds,
    principalKeys: [`user:${engagement.ownerUserId}`, `org:${engagement.organizationId}:member`, ...projectIds.map((id) => `project:${id}:member`)],
  });
}

export async function deliverableSearchProjection(ctx: MutationCtx, deliverable: Doc<"deliverables">) {
  const engagement = await ctx.db.get(deliverable.engagementId);
  return writeSearchProjection(ctx, {
    ...base(deliverable, "deliverable", `/delivery/engagements?engagement=${deliverable.engagementId}&deliverable=${deliverable._id}`, deliverable.name, deliverable.description ?? "", [deliverable.status], 0),
    scopeType: deliverable.projectId ? "project" : "organization",
    projectIds: deliverable.projectId ? [String(deliverable.projectId)] : [],
    clientIds: engagement && engagement.organizationId === deliverable.organizationId ? [String(engagement.clientId)] : [],
  });
}

function base(
  record: { organizationId: string; _id: string; ownerUserId: string; updatedAt: number; deletedAt?: number; clientId?: string },
  resourceType: "proposal" | "contract" | "engagement" | "deliverable",
  route: string,
  title: string,
  text: string,
  statuses: string[],
  amountMinor: number,
) {
  return {
    organizationId: record.organizationId, resourceType, resourceId: String(record._id), route, title, searchText: `${title}\n${text}`,
    keywords: normalizedKeywords([title, ...statuses]), locale: "en" as const, scopeType: "organization" as const, spaceIds: [], projectIds: [],
    principalKeys: [`user:${record.ownerUserId}`, `org:${record.organizationId}:member`], ownerIds: [record.ownerUserId], statuses,
    clientIds: record.clientId ? [String(record.clientId)] : [],
    dateValue: record.updatedAt, sensitivity: "standard" as const, sourceUpdatedAt: record.updatedAt, version: 1, deletedAt: record.deletedAt,
    subtitle: amountMinor ? `${amountMinor} minor units` : undefined,
  };
}
