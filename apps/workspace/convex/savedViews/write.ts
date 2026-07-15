import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import {
  createUserTableViewInputValidator,
  updateUserTableViewInputValidator,
  userTableViewValidator,
  savedViewGrantInputValidator,
  savedViewSharingModeValidator,
} from "./validators";
import { presentSavedView, scopeForInput } from "./data";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { assertCanReadSavedViewScope } from "../access/savedView";
import { assertSavedViewGrantAction } from "../access/savedViewGrant";
import { requireServerActor } from "../access/actor";
import { assertTeamInOrganization } from "../access/team";
import { hasOrganizationMembership } from "../permissions";

export const create = mutation({
  args: { input: createUserTableViewInputValidator },
  returns: userTableViewValidator,
  handler: async (ctx, args) => {
    const userId = (await requireServerActor(ctx)).userId;
    const now = Date.now();
    const organizationId = args.input.organizationId ?? `personal:${userId}`;
    if (args.input.organizationId) {
      await assertOrganizationPermission(ctx, organizationId, "read");
    }
    const scope = scopeForInput(args.input);
    await assertCanReadSavedViewScope(ctx, organizationId, scope);

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
      sharingMode: args.input.sharingMode ?? "personal",
      revision: 1,
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
    if (!inserted) throw savedViewError("SAVED_VIEW_CREATE_FAILED", "The saved view could not be created.");
    return presentSavedView(inserted);
  },
});

export const update = mutation({
  args: { input: updateUserTableViewInputValidator },
  returns: userTableViewValidator,
  handler: async (ctx, args) => {
    const userId = (await requireServerActor(ctx)).userId;
    const existing = await ctx.db.get(args.input.viewId);
    if (!existing) throw savedViewError("SAVED_VIEW_NOT_FOUND", "The saved view no longer exists.");
    await assertSavedViewOrganizationAccess(ctx, existing);
    const access = await assertSavedViewGrantAction(ctx, existing, "canConfigure");
    if (args.input.isDefault !== undefined) assertOwner(existing, userId);

    if (args.input.isDefault) {
      await clearDefaultFlags(ctx, userId, {
        resourceType: existing.resourceType,
        viewType: existing.viewType,
        organizationId: existing.organizationId,
      });
    }

    const patch: Partial<Doc<"savedViews">> = { updatedAt: Date.now(), revision: (existing.revision ?? 1) + 1 };
    if (args.input.name !== undefined) patch.name = args.input.name;
    if (args.input.description !== undefined) patch.description = args.input.description;
    if (args.input.config !== undefined) patch.config = args.input.config;
    if (args.input.isDefault !== undefined) patch.isDefault = args.input.isDefault;

    await ctx.db.patch(args.input.viewId, patch);
    const updated = await ctx.db.get(args.input.viewId);
    if (!updated) throw savedViewError("SAVED_VIEW_LOAD_FAILED", "The updated saved view could not be loaded.");
    return presentSavedView(updated, access);
  },
});

export const remove = mutation({
  args: { viewId: v.id("savedViews") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireServerActor(ctx);

    const existing = await ctx.db.get(args.viewId);
    if (!existing) return null;
    await assertSavedViewOrganizationAccess(ctx, existing);
    await assertSavedViewGrantAction(ctx, existing, "canDelete");

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
    const userId = (await requireServerActor(ctx)).userId;
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

export const share = mutation({
  args: {
    viewId: v.id("savedViews"),
    sharingMode: savedViewSharingModeValidator,
    grants: v.array(savedViewGrantInputValidator),
  },
  returns: userTableViewValidator,
  handler: async (ctx, args) => {
    if (args.sharingMode === "personal") throw savedViewError("SAVED_VIEW_SHARING_MODE_INVALID", "Use make personal to stop sharing a view.");
    const actor = await requireServerActor(ctx);
    const view = await ctx.db.get(args.viewId);
    if (!view) throw savedViewError("SAVED_VIEW_NOT_FOUND", "The saved view no longer exists.");
    await assertSavedViewOrganizationAccess(ctx, view);
    await assertSavedViewGrantAction(ctx, view, "canShare");
    const trimmed = args.grants.map((grant) => ({ ...grant, principalId: grant.principalId.trim() }));
    const normalized = [...new Map(trimmed.map((grant) => [`${grant.principalType}:${grant.principalId}`, grant])).values()]
      .filter((grant) => grant.principalId);
    for (const grant of normalized) {
      if (grant.principalType === "team") await assertTeamInOrganization(ctx, view.organizationId, grant.principalId);
      else if (!(await hasOrganizationMembership(ctx, view.organizationId, grant.principalId))) {
        throw savedViewError("SAVED_VIEW_PRINCIPAL_INVALID", "The user is not a member of this organization.");
      }
    }
    const now = Date.now();
    const existing = await ctx.db.query("savedViewGrants").withIndex("by_view_state", (q) =>
      q.eq("organizationId", view.organizationId).eq("viewId", view._id).eq("recordState", "active"),
    ).collect();
    const requestedKeys = new Set(normalized.map((grant) => `${grant.principalType}:${grant.principalId}`));
    for (const grant of existing) {
      if (!requestedKeys.has(`${grant.principalType}:${grant.principalId}`)) {
        await ctx.db.patch(grant._id, { recordState: "deleted", deletedAt: now, updatedAt: now });
      }
    }
    for (const grant of normalized) {
      const current = existing.find((item) => item.principalType === grant.principalType && item.principalId === grant.principalId);
      if (current) await ctx.db.patch(current._id, { access: grant.access, recordState: "active", deletedAt: undefined, updatedAt: now });
      else await ctx.db.insert("savedViewGrants", { organizationId: view.organizationId, viewId: view._id, ...grant, recordState: "active", createdByUserId: actor.userId, createdAt: now, updatedAt: now });
    }
    await ctx.db.patch(view._id, { sharingMode: args.sharingMode, revision: (view.revision ?? 1) + 1, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", { organizationId: view.organizationId, actorUserId: actor.userId, action: "savedView.grants.updated", target: view._id, summary: `Updated grants for saved view ${view.name}.`, createdAt: now });
    const updated = await ctx.db.get(view._id);
    if (!updated) throw savedViewError("SAVED_VIEW_LOAD_FAILED", "The shared saved view could not be loaded.");
    return presentSavedView(updated);
  },
});

export const makePersonal = mutation({
  args: { viewId: v.id("savedViews") },
  returns: userTableViewValidator,
  handler: async (ctx, args) => {
    const actor = await requireServerActor(ctx);
    const view = await ctx.db.get(args.viewId);
    if (!view) throw savedViewError("SAVED_VIEW_NOT_FOUND", "The saved view no longer exists.");
    assertOwner(view, actor.userId);
    await assertSavedViewOrganizationAccess(ctx, view);
    const now = Date.now();
    const grants = await ctx.db.query("savedViewGrants").withIndex("by_view_state", (q) => q.eq("organizationId", view.organizationId).eq("viewId", view._id).eq("recordState", "active")).collect();
    for (const grant of grants) await ctx.db.patch(grant._id, { recordState: "deleted", deletedAt: now, updatedAt: now });
    await ctx.db.patch(view._id, { sharingMode: "personal", revision: (view.revision ?? 1) + 1, updatedAt: now });
    await ctx.db.insert("organizationAuditEvents", { organizationId: view.organizationId, actorUserId: actor.userId, action: "savedView.madePersonal", target: view._id, summary: `Made saved view ${view.name} personal.`, createdAt: now });
    const updated = await ctx.db.get(view._id);
    if (!updated) throw savedViewError("SAVED_VIEW_LOAD_FAILED", "The personal saved view could not be loaded.");
    return presentSavedView(updated);
  },
});

function assertOwner(view: Doc<"savedViews">, userId: string) {
  if (view.ownerUserId !== userId && view.createdByUserId !== userId) {
    throw savedViewError("SAVED_VIEW_OWNER_REQUIRED", "Only the saved view owner can perform this action.");
  }
}

function savedViewError(code: string, message: string) {
  return new ConvexError({ code, message });
}

async function assertSavedViewOrganizationAccess(
  ctx: MutationCtx,
  view: Doc<"savedViews">,
) {
  if (!view.organizationId.startsWith("personal:")) {
    await assertOrganizationPermission(ctx, view.organizationId, "read");
    await assertCanReadSavedViewScope(ctx, view.organizationId, view);
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
