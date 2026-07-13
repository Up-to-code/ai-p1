import { v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import {
  createUserTableViewInputValidator,
  updateUserTableViewInputValidator,
  userTableViewValidator,
} from "./validators";
import { presentSavedView, scopeForInput } from "./data";
import { assertOrganizationPermission } from "../organizations/profile/access";

export const create = mutation({
  args: { input: createUserTableViewInputValidator },
  returns: userTableViewValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const now = Date.now();
    const organizationId = args.input.organizationId ?? `personal:${userId}`;
    if (args.input.organizationId) {
      await assertOrganizationPermission(ctx, organizationId, "read");
    }
    const scope = scopeForInput(args.input);
    await assertSavedViewScope(ctx, organizationId, scope);

    if (args.input.isDefault) {
      await clearDefaultFlags(ctx, userId, {
        resourceType: args.input.resourceType,
        viewType: args.input.viewType,
        organizationId,
      });
    }

    const viewId = await ctx.db.insert("savedViews", {
      organizationId,
      resourceType: args.input.resourceType,
      viewType: args.input.viewType,
      name: args.input.name,
      description: args.input.description,
      ownerUserId: userId,
      scopeType: scope.scopeType,
      scopeId: scope.scopeId,
      visibility: "private",
      config: args.input.config,
      isDefault: args.input.isDefault,
      isSystemDefault: false,
      isRemovable: true,
      recordState: "active",
      createdByUserId: userId,
      createdAt: now,
      updatedAt: now,
    });

    const inserted = await ctx.db.get(viewId);
    if (!inserted) throw new Error("Failed to create view");
    return presentSavedView(inserted);
  },
});

export const update = mutation({
  args: { input: updateUserTableViewInputValidator },
  returns: userTableViewValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existing = await ctx.db.get(args.input.viewId);
    if (!existing) throw new Error("View not found");
    assertOwner(existing, userId);
    await assertSavedViewOrganizationAccess(ctx, existing);

    if (args.input.isDefault) {
      await clearDefaultFlags(ctx, userId, {
        resourceType: existing.resourceType,
        viewType: existing.viewType,
        organizationId: existing.organizationId,
      });
    }

    const patch: Partial<Doc<"savedViews">> = { updatedAt: Date.now() };
    if (args.input.name !== undefined) patch.name = args.input.name;
    if (args.input.description !== undefined) patch.description = args.input.description;
    if (args.input.config !== undefined) patch.config = args.input.config;
    if (args.input.isDefault !== undefined) patch.isDefault = args.input.isDefault;

    await ctx.db.patch(args.input.viewId, patch);
    const updated = await ctx.db.get(args.input.viewId);
    if (!updated) throw new Error("Failed to load view");
    return presentSavedView(updated);
  },
});

export const remove = mutation({
  args: { viewId: v.id("savedViews") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.get(args.viewId);
    if (!existing) return null;
    assertOwner(existing, identity.subject);
    await assertSavedViewOrganizationAccess(ctx, existing);

    const now = Date.now();
    await ctx.db.patch(args.viewId, {
      recordState: "deleted",
      deletedAt: now,
      updatedAt: now,
    });
    return null;
  },
});

export const setDefault = mutation({
  args: { viewId: v.id("savedViews") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const userId = identity.subject;
    const existing = await ctx.db.get(args.viewId);
    if (!existing) return null;
    assertOwner(existing, userId);
    await assertSavedViewOrganizationAccess(ctx, existing);

    await clearDefaultFlags(ctx, userId, {
      resourceType: existing.resourceType,
      viewType: existing.viewType,
      organizationId: existing.organizationId,
    });
    await ctx.db.patch(args.viewId, { isDefault: true, updatedAt: Date.now() });
    return null;
  },
});

function assertOwner(view: Doc<"savedViews">, userId: string) {
  if (view.ownerUserId !== userId && view.createdByUserId !== userId) {
    throw new Error("Not authorized");
  }
}

async function assertSavedViewOrganizationAccess(
  ctx: MutationCtx,
  view: Doc<"savedViews">,
) {
  if (!view.organizationId.startsWith("personal:")) {
    await assertOrganizationPermission(ctx, view.organizationId, "read");
  }
}

export async function assertSavedViewScope(
  ctx: MutationCtx,
  organizationId: string,
  scope: ReturnType<typeof scopeForInput>,
) {
  if (!scope.scopeId || scope.scopeType === "workspace") return;
  const table = scope.scopeType === "project" ? "projects" : "spaces";
  const recordId = ctx.db.normalizeId(table, scope.scopeId);
  if (!recordId) throw new Error("Saved view scope is invalid.");
  const record = await ctx.db.get(recordId);
  if (
    !record ||
    record.organizationId !== organizationId ||
    record.deletedAt ||
    record.recordState === "deleted"
  ) {
    throw new Error("Saved view scope must reference an active record in this organization.");
  }
}

async function clearDefaultFlags(
  ctx: MutationCtx,
  userId: string,
  args: {
    resourceType: Doc<"savedViews">["resourceType"];
    viewType: Doc<"savedViews">["viewType"];
    organizationId: string;
  },
) {
  const all = await ctx.db
    .query("savedViews")
    .withIndex("by_owner_resource", (q) =>
      q.eq("organizationId", args.organizationId).eq("ownerUserId", userId).eq("resourceType", args.resourceType),
    )
    .collect();

  for (const view of all) {
    if (view.recordState === "active" && view.viewType === args.viewType && view.isDefault) {
      await ctx.db.patch(view._id, { isDefault: false, updatedAt: Date.now() });
    }
  }
}
