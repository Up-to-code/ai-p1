import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { assertReportRead, assertReportSourceAccess } from "./access";
import { reportSourceValidator } from "./validators";

const metric = v.object({ id: v.string(), value: v.number(), amountMinor: v.optional(v.number()), currency: v.optional(v.string()) });

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(v.object({ id: v.id("reportDefinitions"), name: v.string(), source: reportSourceValidator, visibility: v.string(), revision: v.number(), updatedAt: v.number(), owned: v.boolean() })),
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    const rows = await ctx.db.query("reportDefinitions").withIndex("by_owner_updated", (q) => q.eq("organizationId", args.organizationId)).order("desc").take(500);
    const visible = [];
    for (const report of rows) {
      if (report.deletedAt) continue;
      try { await assertReportRead(ctx, report); visible.push({ id: report._id, name: report.name, source: report.source, visibility: report.visibility, revision: report.revision, updatedAt: report.updatedAt, owned: report.createdByUserId === actor.userId }); } catch { continue; }
    }
    return visible;
  },
});

export const overview = query({
  args: { organizationId: v.string(), source: reportSourceValidator, startAt: v.number(), endAt: v.number() },
  returns: v.object({ source: reportSourceValidator, metrics: v.array(metric) }),
  handler: async (ctx, args) => {
    await assertReportSourceAccess(ctx, args.organizationId, args.source);
    if (args.endAt <= args.startAt) throw new Error("Report end must be after start.");
    if (args.source === "sales" || args.source === "pipeline") {
      const [clients, deals] = await Promise.all([
        ctx.db.query("clients").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(2_000),
        ctx.db.query("deals").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(2_000),
      ]);
      const activeDeals = deals.filter((row) => !row.deletedAt && row.recordState !== "deleted");
      return { source: args.source, metrics: [{ id: "clients", value: clients.filter((row) => !row.deletedAt && row.recordState !== "deleted").length }, { id: "deals", value: activeDeals.length }, { id: "pipelineValue", value: activeDeals.reduce((sum, row) => sum + (row.value ?? 0), 0) }] };
    }
    if (["finance", "tax", "project_profitability", "client_profitability"].includes(args.source)) {
      const lines = await ctx.db.query("financeLedgerLines").withIndex("by_period_account", (q) => q.eq("organizationId", args.organizationId).gte("accountingDate", args.startAt).lte("accountingDate", args.endAt)).take(5_000);
      return { source: args.source, metrics: [{ id: "debits", value: lines.reduce((sum, row) => sum + row.debitBaseMinor, 0), amountMinor: lines.reduce((sum, row) => sum + row.debitBaseMinor, 0) }, { id: "credits", value: lines.reduce((sum, row) => sum + row.creditBaseMinor, 0), amountMinor: lines.reduce((sum, row) => sum + row.creditBaseMinor, 0) }, { id: "ledgerLines", value: lines.length }] };
    }
    if (args.source === "resource_utilization" || args.source === "capacity") {
      const [capacity, allocations] = await Promise.all([
        ctx.db.query("resourceCapacityPeriods").withIndex("by_org_start", (q) => q.eq("organizationId", args.organizationId).lte("startAt", args.endAt)).take(2_000),
        ctx.db.query("resourceAllocations").withIndex("by_org_status_start", (q) => q.eq("organizationId", args.organizationId).eq("status", "confirmed").lte("startAt", args.endAt)).take(2_000),
      ]);
      const capacityMinutes = capacity.filter((row) => !row.deletedAt && row.endAt > args.startAt).reduce((sum, row) => sum + row.availableMinutes, 0);
      const allocatedMinutes = allocations.filter((row) => !row.deletedAt && row.endAt > args.startAt).reduce((sum, row) => sum + row.allocatedMinutes, 0);
      return { source: args.source, metrics: [{ id: "capacityMinutes", value: capacityMinutes }, { id: "allocatedMinutes", value: allocatedMinutes }, { id: "utilizationPercent", value: capacityMinutes ? Math.round(allocatedMinutes / capacityMinutes * 10_000) / 100 : 0 }] };
    }
    const [projects, engagements] = await Promise.all([
      ctx.db.query("projects").withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId)).take(2_000),
      ctx.db.query("engagements").withIndex("by_org_state_updated", (q) => q.eq("organizationId", args.organizationId)).take(2_000),
    ]);
    return { source: args.source, metrics: [{ id: "projects", value: projects.filter((row) => !row.deletedAt && row.recordState !== "deleted").length }, { id: "engagements", value: engagements.filter((row) => !row.deletedAt).length }] };
  },
});

export const schedules = query({
  args: { organizationId: v.string() },
  returns: v.array(v.object({ id: v.id("reportSchedules"), reportId: v.id("reportDefinitions"), cadence: v.string(), timezone: v.string(), recipients: v.array(v.string()), nextRunAt: v.number(), active: v.boolean() })),
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("reportSchedules").withIndex("by_org_next_run", (q) => q.eq("organizationId", args.organizationId).eq("active", true)).take(500);
    const visible = [];
    for (const row of rows) { const report = await ctx.db.get(row.reportId); if (!report || report.deletedAt) continue; try { await assertReportRead(ctx, report); visible.push({ id: row._id, reportId: row.reportId, cadence: row.cadence, timezone: row.timezone, recipients: row.recipients, nextRunAt: row.nextRunAt, active: row.active }); } catch { continue; } }
    return visible;
  },
});
