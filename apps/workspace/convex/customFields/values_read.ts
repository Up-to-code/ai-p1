import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";

export const listByRecord = query({
  args: {
    organizationId: v.string(),
    recordType: v.string(),
    recordId: v.string(),
  },
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");

    const values = await ctx.db
      .query("customFieldValues")
      .withIndex("by_organization_record", (qb) =>
        qb
          .eq("organizationId", args.organizationId)
          .eq("recordType", args.recordType as any)
          .eq("recordId", args.recordId),
      )
      .collect();

    return values
      .filter((v) => !v.deletedAt)
      .map((v) => ({
        id: v._id,
        fieldDefinitionId: v.fieldDefinitionId,
        fieldKey: v.fieldKey,
        textValue: v.textValue,
        numberValue: v.numberValue,
        currencyValue: v.currencyValue,
        booleanValue: v.booleanValue,
        dateValue: v.dateValue,
        dateTimeValue: v.dateTimeValue,
        selectValue: v.selectValue,
        multiSelectValue: v.multiSelectValue,
        userValue: v.userValue,
        urlValue: v.urlValue,
      }));
  },
});

export const listByOrganization = query({
  args: {
    organizationId: v.string(),
    recordType: v.string(),
  },
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");

    const values = await ctx.db
      .query("customFieldValues")
      .withIndex("by_organization_record", (qb) =>
        qb
          .eq("organizationId", args.organizationId)
          .eq("recordType", args.recordType as any),
      )
      .collect();

    return values
      .filter((v) => !v.deletedAt)
      .map((v) => ({
        id: v._id,
        fieldDefinitionId: v.fieldDefinitionId,
        fieldKey: v.fieldKey,
        recordId: v.recordId,
        textValue: v.textValue,
        numberValue: v.numberValue,
        currencyValue: v.currencyValue,
        booleanValue: v.booleanValue,
        dateValue: v.dateValue,
        dateTimeValue: v.dateTimeValue,
        selectValue: v.selectValue,
        multiSelectValue: v.multiSelectValue,
        userValue: v.userValue,
        urlValue: v.urlValue,
      }));
  },
});
