import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";
import { getAuthUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { createClient, deleteClient, updateClient } from "./lifecycle";
import { clientInputValidator, clientPatchValidator, clientValidator } from "./validators";

export const createFromHono = mutation({
  args: { organizationId: v.string(), input: clientInputValidator },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "create");
    return createClient(ctx, { ...args, actorUserId: user._id });
  },
});

export const updateFromHono = mutation({
  args: {
    organizationId: v.string(),
    clientId: v.id("clients"),
    input: clientPatchValidator,
  },
  returns: clientValidator,
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "update");
    return updateClient(ctx, { ...args, actorUserId: user._id });
  },
});

export const deleteFromHono = mutation({
  args: { organizationId: v.string(), clientId: v.id("clients") },
  returns: v.object({ removed: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "delete");
    return deleteClient(ctx, { ...args, actorUserId: user._id });
  },
});

export const createInternal = internalMutation({
  args: {
    organizationId: v.string(),
    input: clientInputValidator,
    actorUserId: v.string(),
  },
  returns: clientValidator,
  handler: createClient,
});

export const updateInternal = internalMutation({
  args: {
    organizationId: v.string(),
    clientId: v.id("clients"),
    input: clientPatchValidator,
    actorUserId: v.string(),
  },
  returns: clientValidator,
  handler: updateClient,
});

export const deleteInternal = internalMutation({
  args: {
    organizationId: v.string(),
    clientId: v.id("clients"),
    actorUserId: v.string(),
  },
  returns: v.object({ removed: v.boolean() }),
  handler: deleteClient,
});
