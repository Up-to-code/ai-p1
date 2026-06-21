import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";

export const listByOrganization = query({
  args: {
    organizationId: v.string(),
    recordType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");

    let q = ctx.db
      .query("customFieldDefinitions")
      .withIndex("by_organization_id", (qb) => qb.eq("organizationId", args.organizationId));

    if (args.recordType) {
      const rt = args.recordType;
      q = q.filter((qb) => qb.eq(qb.field("appliesTo"), [rt]));
    }

    const definitions = await q.collect();

    return definitions
      .filter((d) => !d.archivedAt && !d.deletedAt)
      .sort((a, b) => a.order - b.order)
      .map((d) => ({
        id: d._id,
        key: d.key,
        label: d.label,
        description: d.description,
        type: d.type,
        required: d.required,
        options: d.options,
        appliesTo: d.appliesTo,
        defaultValue: d.defaultValue,
        display: d.display,
        order: d.order,
      }));
  },
});

export const listByOrganizationForTable = query({
  args: {
    organizationId: v.string(),
    recordType: v.string(),
  },
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");

    const definitions = await ctx.db
      .query("customFieldDefinitions")
      .withIndex("by_organization_id", (qb) => qb.eq("organizationId", args.organizationId))
      .collect();

    return definitions
      .filter(
        (d) =>
          !d.archivedAt &&
          !d.deletedAt &&
          d.appliesTo.includes(args.recordType as any) &&
          d.display?.tableVisible,
      )
      .sort((a, b) => a.order - b.order)
      .map((d) => ({
        id: d._id,
        key: d.key,
        label: d.label,
        type: d.type,
        options: d.options,
      }));
  },
});
