import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import {
  automationDocumentValidator,
  automationRunDocumentValidator,
} from "./validators";

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(automationDocumentValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(
      ctx,
      args.organizationId,
      "organization",
      "read",
    );
    return await ctx.db
      .query("automations")
      .withIndex("by_organization_updated", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .order("desc")
      .collect();
  },
});

export const listRuns = query({
  args: { organizationId: v.string(), automationId: v.id("automations") },
  returns: v.array(automationRunDocumentValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(
      ctx,
      args.organizationId,
      "organization",
      "read",
    );
    const automation = await ctx.db.get(args.automationId);
    if (!automation || automation.organizationId !== args.organizationId) return [];
    return await ctx.db
      .query("automationRuns")
      .withIndex("by_automation_started", (q) =>
        q.eq("automationId", args.automationId),
      )
      .order("desc")
      .take(50);
  },
});
