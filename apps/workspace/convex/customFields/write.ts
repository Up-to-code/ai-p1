import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { clerkAuthComponent } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";

export const createFromHono = mutation({
  args: {
    organizationId: v.string(),
    key: v.string(),
    label: v.string(),
    description: v.optional(v.string()),
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
    required: v.boolean(),
    options: v.optional(
      v.array(
        v.object({
          id: v.string(),
          label: v.string(),
          color: v.optional(v.string()),
          order: v.number(),
          archivedAt: v.optional(v.number()),
        }),
      ),
    ),
    appliesTo: v.array(
      v.union(
        v.literal("client"),
        v.literal("deal"),
        v.literal("opportunity"),
        v.literal("project"),
        v.literal("task"),
        v.literal("calendarEvent"),
      ),
    ),
    defaultValue: v.optional(v.any()),
    display: v.optional(
      v.object({
        formSection: v.optional(v.string()),
        tableVisible: v.boolean(),
        boardVisible: v.boolean(),
        detailVisible: v.boolean(),
        requiredOnCreate: v.boolean(),
      }),
    ),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    // Determine order
    const existing = await ctx.db
      .query("customFieldDefinitions")
      .withIndex("by_organization_id", (qb) => qb.eq("organizationId", args.organizationId))
      .collect();
    const maxOrder = existing.reduce((max, d) => Math.max(max, d.order), -1);

    const now = Date.now();
    const fieldId = await ctx.db.insert("customFieldDefinitions", {
      organizationId: args.organizationId,
      key: args.key,
      label: args.label,
      description: args.description,
      type: args.type,
      required: args.required,
      options: args.options,
      appliesTo: args.appliesTo,
      defaultValue: args.defaultValue,
      display: args.display ?? {
        tableVisible: false,
        boardVisible: false,
        detailVisible: true,
        requiredOnCreate: false,
      },
      order: args.order ?? maxOrder + 1,
      createdByUserId: user.id,
      createdAt: now,
      updatedAt: now,
    });

    return { fieldId };
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    fieldId: v.id("customFieldDefinitions"),
    label: v.optional(v.string()),
    description: v.optional(v.string()),
    required: v.optional(v.boolean()),
    options: v.optional(
      v.array(
        v.object({
          id: v.string(),
          label: v.string(),
          color: v.optional(v.string()),
          order: v.number(),
          archivedAt: v.optional(v.number()),
        }),
      ),
    ),
    appliesTo: v.optional(
      v.array(
        v.union(
          v.literal("client"),
          v.literal("deal"),
          v.literal("opportunity"),
          v.literal("project"),
          v.literal("task"),
          v.literal("calendarEvent"),
        ),
      ),
    ),
    display: v.optional(
      v.object({
        formSection: v.optional(v.string()),
        tableVisible: v.boolean(),
        boardVisible: v.boolean(),
        detailVisible: v.boolean(),
        requiredOnCreate: v.boolean(),
      }),
    ),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    const existing = await ctx.db.get(args.fieldId);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Field not found");
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.label !== undefined) patch.label = args.label;
    if (args.description !== undefined) patch.description = args.description;
    if (args.required !== undefined) patch.required = args.required;
    if (args.options !== undefined) patch.options = args.options;
    if (args.appliesTo !== undefined) patch.appliesTo = args.appliesTo;
    if (args.display !== undefined) patch.display = args.display;
    if (args.order !== undefined) patch.order = args.order;

    await ctx.db.patch(args.fieldId, patch);
    return { success: true };
  },
});

export const deleteFromHono = mutation({
  args: {
    organizationId: v.string(),
    fieldId: v.id("customFieldDefinitions"),
  },
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    const existing = await ctx.db.get(args.fieldId);
    if (!existing || existing.organizationId !== args.organizationId) {
      throw new Error("Field not found");
    }

    // Soft delete the definition
    await ctx.db.patch(args.fieldId, {
      archivedAt: Date.now(),
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Soft delete all values for this field
    const values = await ctx.db
      .query("customFieldValues")
      .withIndex("by_organization_field", (qb) =>
        qb.eq("organizationId", args.organizationId).eq("fieldDefinitionId", args.fieldId),
      )
      .collect();

    for (const value of values) {
      await ctx.db.patch(value._id, { deletedAt: Date.now() });
    }

    return { success: true };
  },
});

export const reorderFromHono = mutation({
  args: {
    organizationId: v.string(),
    fieldOrders: v.array(
      v.object({
        fieldId: v.id("customFieldDefinitions"),
        order: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const user = await clerkAuthComponent.getAuthUser(ctx);
    if (!user) throw new Error("Unauthorized");

    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");

    for (const item of args.fieldOrders) {
      const existing = await ctx.db.get(item.fieldId);
      if (existing && existing.organizationId === args.organizationId) {
        await ctx.db.patch(item.fieldId, { order: item.order, updatedAt: Date.now() });
      }
    }

    return { success: true };
  },
});
