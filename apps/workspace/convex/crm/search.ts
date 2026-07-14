import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { normalizedKeywords } from "../search/adapters/shared";
import { writeSearchProjection } from "../search/projection";

export async function leadSearchProjection(ctx: MutationCtx, lead: Doc<"crmLeads">) {
  return writeSearchProjection(ctx, projection(lead, "lead", `/crm/leads?lead=${lead._id}`, lead.name, [lead.companyName, lead.source, lead.notes].filter(Boolean).join("\n"), [lead.status, lead.source]));
}
export async function companySearchProjection(ctx: MutationCtx, company: Doc<"crmCompanies">) {
  return writeSearchProjection(ctx, { ...projection(company, "company", `/crm/companies?company=${company._id}`, company.name, [company.industry, company.website].filter(Boolean).join("\n"), [company.industry ?? "company"]), clientIds: company.clientId ? [String(company.clientId)] : [] });
}
export async function contactSearchProjection(ctx: MutationCtx, contact: Doc<"crmContacts">) {
  return writeSearchProjection(ctx, { ...projection(contact, "contact", `/crm/contacts?contact=${contact._id}`, contact.name, contact.title ?? "", [contact.title ?? "contact"]), clientIds: contact.clientId ? [String(contact.clientId)] : [] });
}

function projection(
  record: { organizationId: string; _id: string; ownerUserId: string; updatedAt: number; deletedAt?: number },
  resourceType: "lead" | "company" | "contact",
  route: string,
  title: string,
  searchText: string,
  statuses: string[],
) {
  return {
    organizationId: record.organizationId, resourceType, resourceId: String(record._id), route, title, searchText: `${title}\n${searchText}`,
    keywords: normalizedKeywords([title, ...statuses]), locale: "en" as const, scopeType: "organization" as const, spaceIds: [], projectIds: [],
    principalKeys: [`user:${record.ownerUserId}`, `org:${record.organizationId}:member`], ownerIds: [record.ownerUserId], statuses,
    sensitivity: "restricted" as const, sourceUpdatedAt: record.updatedAt, version: 1, deletedAt: record.deletedAt,
  };
}
