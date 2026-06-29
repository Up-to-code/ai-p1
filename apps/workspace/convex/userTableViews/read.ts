import { v } from "convex/values";
import { query } from "../_generated/server";
import { userTableViewValidator } from "./validators";
import { listViewsForUser, getDefaultView } from "./data";

export const list = query({
  args: {
    resourceType: v.optional(v.string()),
    viewType: v.optional(v.string()),
    organizationId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    spaceId: v.optional(v.string()),
  },
  returns: v.array(userTableViewValidator),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject;
    return listViewsForUser(ctx, userId, args);
  },
});

export const get = query({
  args: { viewId: v.id("userTableViews") },
  returns: v.union(userTableViewValidator, v.null()),
  handler: async (ctx, args) => {
    const view = await ctx.db.get(args.viewId);
    if (!view) return null;
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || view.userId !== identity.subject) return null;
    return view;
  },
});

export const getDefault = query({
  args: {
    resourceType: v.string(),
    viewType: v.string(),
    organizationId: v.optional(v.string()),
    projectId: v.optional(v.string()),
    spaceId: v.optional(v.string()),
  },
  returns: v.union(userTableViewValidator, v.null()),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return getDefaultView(ctx, identity.subject, args);
  },
});
