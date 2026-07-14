import { v } from "convex/values";
import { query } from "../_generated/server";
import { userTableViewValidator } from "./validators";
import { listViewRecordsForUser, presentSavedView } from "./data";
import { viewTypeValidator, workOsRecordResourceValidator } from "../schema/validators";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { assertCanReadSavedViewScope, filterReadableSavedViews } from "../access/savedView";

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
    const userId = identity.subject;
    const views = await listViewRecordsForUser(ctx, userId, args);
    const readable = args.organizationId
      ? await filterReadableSavedViews(ctx, args.organizationId, views)
      : views;
    return readable.map(presentSavedView);
  },
});

export const get = query({
  args: { viewId: v.id("savedViews") },
  returns: v.union(userTableViewValidator, v.null()),
  handler: async (ctx, args) => {
    const view = await ctx.db.get(args.viewId);
    if (!view) return null;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || (view.ownerUserId !== identity.subject && view.createdByUserId !== identity.subject)) return null;
    if (!view.organizationId.startsWith("personal:")) {
      await assertOrganizationPermission(ctx, view.organizationId, "read");
      await assertCanReadSavedViewScope(ctx, view.organizationId, view);
    }
    return presentSavedView(view);
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
    const views = await listViewRecordsForUser(ctx, identity.subject, args);
    const readable = args.organizationId
      ? await filterReadableSavedViews(ctx, args.organizationId, views)
      : views;
    const presented = readable.map(presentSavedView);
    return presented.find((view) => view.isDefault) ?? presented[0] ?? null;
  },
});
