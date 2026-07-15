import { v } from "convex/values";
import { query } from "../_generated/server";
import { savedViewGrantValidator, userTableViewValidator } from "./validators";
import { listViewRecordsForUser, presentSavedView } from "./data";
import { viewTypeValidator, workOsRecordResourceValidator } from "../schema/validators";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { assertCanReadSavedViewScope } from "../access/savedView";
import { assertSavedViewGrantAction, resolveSavedViewGrantAccess } from "../access/savedViewGrant";
import { requireServerActor } from "../access/actor";
import type { Doc } from "../_generated/dataModel";

export const list = query({
  args: {
    resourceType: v.optional(workOsRecordResourceValidator),
    viewType: v.optional(viewTypeValidator),
    organizationId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    spaceId: v.optional(v.string()),
  },
  returns: v.array(userTableViewValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    if (args.organizationId) {
      await assertOrganizationPermission(ctx, args.organizationId, "read");
    }
    const userId = (await requireServerActor(ctx)).userId;
    const views = await listViewRecordsForUser(ctx, userId, { ...args, includeAdministered: true });
    const readable = await accessibleViews(ctx, views);
    return readable.map(({ view, access }) => presentSavedView(view, access));
  },
});

export const get = query({
  args: { viewId: v.id("savedViews") },
  returns: v.union(userTableViewValidator, v.null()),
  handler: async (ctx, args) => {
    const view = await ctx.db.get(args.viewId);
    if (!view) return null;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    if (!view.organizationId.startsWith("personal:")) {
      await assertOrganizationPermission(ctx, view.organizationId, "read");
      await assertCanReadSavedViewScope(ctx, view.organizationId, view);
    }
    const access = await resolveSavedViewGrantAccess(ctx, view);
    return access.canRead ? presentSavedView(view, access) : null;
  },
});

export const getDefault = query({
  args: {
    resourceType: workOsRecordResourceValidator,
    viewType: viewTypeValidator,
    organizationId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    spaceId: v.optional(v.string()),
  },
  returns: v.union(userTableViewValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    if (args.organizationId) {
      await assertOrganizationPermission(ctx, args.organizationId, "read");
    }
    const actor = await requireServerActor(ctx);
    const views = await listViewRecordsForUser(ctx, actor.userId, args);
    const readable = await accessibleViews(ctx, views);
    const presented = readable.map(({ view, access }) => presentSavedView(view, access));
    return presented.find((view) => view.isDefault) ?? presented[0] ?? null;
  },
});

export const listGrants = query({
  args: { viewId: v.id("savedViews") },
  returns: v.array(savedViewGrantValidator),
  handler: async (ctx, args) => {
    const view = await ctx.db.get(args.viewId);
    if (!view || view.recordState !== "active") return [];
    if (!view.organizationId.startsWith("personal:")) {
      await assertOrganizationPermission(ctx, view.organizationId, "read");
      await assertCanReadSavedViewScope(ctx, view.organizationId, view);
    }
    await assertSavedViewGrantAction(ctx, view, "canShare");
    const grants = await ctx.db.query("savedViewGrants").withIndex("by_view_state", (q) =>
      q.eq("organizationId", view.organizationId).eq("viewId", view._id).eq("recordState", "active"),
    ).collect();
    return grants.filter((grant) => !grant.deletedAt).map((grant) => ({
      principalType: grant.principalType,
      principalId: grant.principalId,
      access: grant.access,
    }));
  },
});

async function accessibleViews(
  ctx: Parameters<typeof resolveSavedViewGrantAccess>[0],
  views: readonly Doc<"savedViews">[],
) {
  const decisions = await Promise.all(views.map(async (view) => {
    try {
      if (!view.organizationId.startsWith("personal:")) {
        await assertCanReadSavedViewScope(ctx, view.organizationId, view);
      }
      const access = await resolveSavedViewGrantAccess(ctx, view);
      return access.canRead ? { view, access } : null;
    } catch {
      return null;
    }
  }));
  return decisions.filter((decision): decision is NonNullable<typeof decision> => decision !== null);
}
