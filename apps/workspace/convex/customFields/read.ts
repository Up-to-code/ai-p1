import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { workOsRecordResourceValidator } from "../schema/validators";
import { assertCustomFieldTargetPermission } from "./access";

export const listByOrganization = query({
  args: {
    organizationId: v.string(),
    recordType: v.optional(workOsRecordResourceValidator),
  },
  handler: async (ctx, args) => {
    if (args.recordType) {
      await assertCustomFieldTargetPermission(ctx, args.organizationId, [args.recordType], "read");
    } else {
      await assertOrganizationResourcePermission(ctx, args.organizationId, "organization", "read");
    }

    let q = ctx.db
      .query("customFieldDefinitions")
      .withIndex("by_organization_id", (qb) => qb.eq("organizationId", args.organizationId));

    if (args.recordType) {
      const rt = args.recordType;
      q = q.filter((qb) => qb.eq(qb.field("appliesTo"), [rt]));
    }

    const definitions = await q.collect();
    if (!args.recordType && definitions.some((definition) => definition.appliesTo.length > 0)) {
      await assertCustomFieldTargetPermission(
        ctx,
        args.organizationId,
        definitions.flatMap((definition) => definition.appliesTo),
        "read",
      );
    }

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
        defaultValue:
          d.defaultTextValue ??
          d.defaultNumberValue ??
          d.defaultBooleanValue ??
          d.defaultDateValue ??
          d.defaultSelectValue ??
          d.defaultMultiSelectValue,
        display: {
          tableVisible: true,
          boardVisible: true,
          detailVisible: true,
          requiredOnCreate: d.required,
        },
        order: d.order,
      }));
  },
});

export const listByOrganizationForTable = query({
  args: {
    organizationId: v.string(),
    recordType: workOsRecordResourceValidator,
  },
  handler: async (ctx, args) => {
    await assertCustomFieldTargetPermission(ctx, args.organizationId, [args.recordType], "read");

    const definitions = await ctx.db
      .query("customFieldDefinitions")
      .withIndex("by_organization_id", (qb) => qb.eq("organizationId", args.organizationId))
      .collect();

    return definitions
      .filter(
        (d) =>
          !d.archivedAt &&
          !d.deletedAt &&
          d.appliesTo.includes(args.recordType),
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
