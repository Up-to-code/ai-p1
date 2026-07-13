import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthUser } from "../auth";
import { workOsRecordResourceValidator } from "../schema/validators";
import { assertCustomFieldTargetPermission } from "./access";

export const upsertFromHono = mutation({
  args: {
    organizationId: v.string(),
    fieldDefinitionId: v.id("customFieldDefinitions"),
    fieldKey: v.string(),
    recordType: workOsRecordResourceValidator,
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
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await assertCustomFieldTargetPermission(ctx, args.organizationId, [args.recordType], "update");

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
        recordState: "active",
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
      recordState: "active",
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
    const user = await getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const existing = await ctx.db.get(args.valueId);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Value not found");
    }
    await assertCustomFieldTargetPermission(ctx, args.organizationId, [existing.recordType], "update");

    await ctx.db.patch(args.valueId, {
      deletedAt: Date.now(),
      recordState: "deleted",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
