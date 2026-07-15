import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { assertTeamInOrganization } from "../access/team";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { assertReportManage, assertReportScopeAccess, assertReportSourceAccess } from "./access";
import { reportCadenceValidator, reportScopeValidator, reportSourceValidator, reportVisibilityValidator } from "./validators";

function normalizedJson(value: string) {
  const trimmed = value.trim() || "{}";
  try { JSON.parse(trimmed); } catch { throw new Error("Report filters must be valid JSON."); }
  return trimmed;
}

export const createReport = mutation({
  args: { organizationId: v.string(), name: v.string(), source: reportSourceValidator, visibility: reportVisibilityValidator, scopeType: reportScopeValidator, scopeId: v.optional(v.string()), filtersJson: v.string(), dimensions: v.array(v.string()), measures: v.array(v.string()) },
  returns: v.id("reportDefinitions"),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "report", "create");
    const actor = await requireServerActor(ctx);
    await assertReportSourceAccess(ctx, args.organizationId, args.source);
    await assertReportScopeAccess(ctx, args);
    const now = Date.now();
    return ctx.db.insert("reportDefinitions", { ...args, name: args.name.trim(), filtersJson: normalizedJson(args.filtersJson), revision: 1, createdByUserId: actor.userId, createdAt: now, updatedAt: now });
  },
});

export const updateReport = mutation({
  args: { organizationId: v.string(), reportId: v.id("reportDefinitions"), name: v.optional(v.string()), filtersJson: v.optional(v.string()), dimensions: v.optional(v.array(v.string())), measures: v.optional(v.array(v.string())) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report || report.organizationId !== args.organizationId || report.deletedAt) throw new Error("Report not found.");
    await assertReportManage(ctx, report);
    await ctx.db.patch(report._id, { name: args.name?.trim(), filtersJson: args.filtersJson === undefined ? undefined : normalizedJson(args.filtersJson), dimensions: args.dimensions, measures: args.measures, revision: report.revision + 1, updatedAt: Date.now() });
    return null;
  },
});

export const setReportGrants = mutation({
  args: { organizationId: v.string(), reportId: v.id("reportDefinitions"), visibility: reportVisibilityValidator, grants: v.array(v.object({ principalType: v.union(v.literal("user"), v.literal("team")), principalId: v.string() })) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report || report.organizationId !== args.organizationId || report.deletedAt) throw new Error("Report not found.");
    const actor = await assertReportManage(ctx, report);
    const unique = [...new Map(args.grants.map((grant) => [`${grant.principalType}:${grant.principalId}`, grant])).values()];
    for (const grant of unique) if (grant.principalType === "team") await assertTeamInOrganization(ctx, args.organizationId, grant.principalId);
    const existing = await ctx.db.query("reportGrants").withIndex("by_report_principal", (q) => q.eq("organizationId", args.organizationId).eq("reportId", report._id)).collect();
    const requested = new Set(unique.map((grant) => `${grant.principalType}:${grant.principalId}`));
    for (const grant of existing) if (!grant.deletedAt && !requested.has(`${grant.principalType}:${grant.principalId}`)) await ctx.db.patch(grant._id, { deletedAt: Date.now() });
    for (const grant of unique) {
      const current = existing.find((item) => item.principalType === grant.principalType && item.principalId === grant.principalId);
      if (current) await ctx.db.patch(current._id, { deletedAt: undefined });
      else await ctx.db.insert("reportGrants", { organizationId: args.organizationId, reportId: report._id, ...grant, createdByUserId: actor.userId, createdAt: Date.now() });
    }
    await ctx.db.patch(report._id, { visibility: args.visibility, revision: report.revision + 1, updatedAt: Date.now() });
    return null;
  },
});

export const scheduleReport = mutation({
  args: { organizationId: v.string(), reportId: v.id("reportDefinitions"), cadence: reportCadenceValidator, timezone: v.string(), recipients: v.array(v.string()), nextRunAt: v.number() },
  returns: v.id("reportSchedules"),
  handler: async (ctx, args) => {
    const report = await ctx.db.get(args.reportId);
    if (!report || report.organizationId !== args.organizationId || report.deletedAt) throw new Error("Report not found.");
    const actor = await assertReportManage(ctx, report);
    const recipients = [...new Set(args.recipients.map((value) => value.trim().toLowerCase()).filter(Boolean))];
    if (!recipients.every((value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) throw new Error("Scheduled report recipients must be valid email addresses.");
    const now = Date.now();
    return ctx.db.insert("reportSchedules", { organizationId: args.organizationId, reportId: report._id, cadence: args.cadence, timezone: args.timezone, recipients, active: true, nextRunAt: args.nextRunAt, createdByUserId: actor.userId, createdAt: now, updatedAt: now });
  },
});
