import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { authUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";

export const upsertFromHono = mutation({
  args: {
    organizationId: v.string(),
    fieldDefinitionId: v.id("customFieldDefinitions"),
    fieldKey: v.string(),
    recordType: v.union(
      v.literal("client"),
      v.literal("deal"),
      v.literal("opportunity"),
      v.literal("project"),
      v.literal("task"),
      v.literal("calendarEvent"),
    ),
    recordId: v.string(),
    type: v.union(
      v.literal("text"),
      v.literal("longText"),
      v.literal("number"),
      v.literal("currency"),
      v.literal("date"),
      v.literal("dateTime"),
      v.literal("select"),
      v.literal("multiSelect"),
      v.literal("boolean"),
      v.literal("user"),
      v.literal("url"),
    ),
    textValue: v.optional(v.string()),
    numberValue: v.optional(v.number()),
    currencyValue: v.optional(v.number()),
    booleanValue: v.optional(v.boolean()),
    dateValue: v.optional(v.string()),
    dateTimeValue: v.optional(v.string()),
    selectValue: v.optional(v.string()),
    multiSelectValue: v.optional(v.array(v.string())),
    userValue: v.optional(v.string()),
    urlValue: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    // Check if value already exists
    const existing = await ctx.db
      .query("customFieldValues")
      .withIndex("by_organization_field_record", (qb) =>
        qb
          .eq("organizationId", args.organizationId)
          .eq("fieldDefinitionId", args.fieldDefinitionId)
          .eq("recordType", args.recordType)
          .eq("recordId", args.recordId),
      )
      .first();

    const now = Date.now();
    const valueData = {
      textValue: args.textValue,
      numberValue: args.numberValue,
      currencyValue: args.currencyValue,
      booleanValue: args.booleanValue,
      dateValue: args.dateValue,
      dateTimeValue: args.dateTimeValue,
      selectValue: args.selectValue,
      multiSelectValue: args.multiSelectValue,
      userValue: args.userValue,
      urlValue: args.urlValue,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        ...valueData,
        updatedAt: now,
        deletedAt: undefined,
      });
      return { valueId: existing._id, updated: true };
    }

    const valueId = await ctx.db.insert("customFieldValues", {
      organizationId: args.organizationId,
      fieldDefinitionId: args.fieldDefinitionId,
      fieldKey: args.fieldKey,
      recordType: args.recordType,
      recordId: args.recordId,
      type: args.type,
      ...valueData,
      createdAt: now,
      updatedAt: now,
    });

    return { valueId, created: true };
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    valueId: v.id("customFieldValues"),
  },
  handler: async (ctx, args) => {
    const user = await authUser.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    const existing = await ctx.db.get(args.valueId);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Value not found");
    }

    await ctx.db.patch(args.valueId, {
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
