import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { companyValidator, contactValidator, leadStatusValidator, leadValidator } from "./validators";

const MAX_CRM_ROWS = 250;

export const listLeads = query({
  args: { organizationId: v.string(), status: v.optional(leadStatusValidator), limit: v.optional(v.number()) }, returns: v.array(leadValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "deal", "read");
    const statuses = args.status ? [args.status] : ["new", "qualified", "disqualified", "converted"] as const;
    const pages = await Promise.all(statuses.map((status) => ctx.db.query("crmLeads").withIndex("by_org_status_updated", (q) =>
      q.eq("organizationId", args.organizationId).eq("status", status).eq("recordState", "active"),
    ).order("desc").take(limit(args.limit))));
    return pages.flat().sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit(args.limit));
  },
});

export const listCompanies = query({
  args: { organizationId: v.string(), limit: v.optional(v.number()) }, returns: v.array(companyValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    return ctx.db.query("crmCompanies").withIndex("by_org_state_updated", (q) => q.eq("organizationId", args.organizationId).eq("recordState", "active")).order("desc").take(limit(args.limit));
  },
});

export const listContacts = query({
  args: { organizationId: v.string(), companyId: v.optional(v.id("crmCompanies")), limit: v.optional(v.number()) }, returns: v.array(contactValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    return args.companyId
      ? ctx.db.query("crmContacts").withIndex("by_company", (q) => q.eq("organizationId", args.organizationId).eq("companyId", args.companyId).eq("recordState", "active")).take(limit(args.limit))
      : ctx.db.query("crmContacts").withIndex("by_org_state_updated", (q) => q.eq("organizationId", args.organizationId).eq("recordState", "active")).order("desc").take(limit(args.limit));
  },
});

export const overview = query({
  args: { organizationId: v.string() },
  returns: v.object({ newLeads: v.number(), qualifiedLeads: v.number(), convertedLeads: v.number(), companies: v.number(), contacts: v.number() }),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const [newLeads, qualifiedLeads, convertedLeads, companies, contacts] = await Promise.all([
      ctx.db.query("crmLeads").withIndex("by_org_status_updated", (q) => q.eq("organizationId", args.organizationId).eq("status", "new").eq("recordState", "active")).collect(),
      ctx.db.query("crmLeads").withIndex("by_org_status_updated", (q) => q.eq("organizationId", args.organizationId).eq("status", "qualified").eq("recordState", "active")).collect(),
      ctx.db.query("crmLeads").withIndex("by_org_status_updated", (q) => q.eq("organizationId", args.organizationId).eq("status", "converted").eq("recordState", "active")).collect(),
      ctx.db.query("crmCompanies").withIndex("by_org_state_updated", (q) => q.eq("organizationId", args.organizationId).eq("recordState", "active")).collect(),
      ctx.db.query("crmContacts").withIndex("by_org_state_updated", (q) => q.eq("organizationId", args.organizationId).eq("recordState", "active")).collect(),
    ]);
    return { newLeads: newLeads.length, qualifiedLeads: qualifiedLeads.length, convertedLeads: convertedLeads.length, companies: companies.length, contacts: contacts.length };
  },
});

function limit(value?: number) { return Math.min(MAX_CRM_ROWS, Math.max(1, Math.trunc(value ?? 100))); }
