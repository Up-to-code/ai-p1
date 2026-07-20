import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { getOrganizationRole } from "../permissions";
import { automationConnectionProviderValidator } from "../schema/automationConnections";

function connectionError(code: string, message: string): never {
  throw new ConvexError({ code, message });
}

export const assertMembership = internalQuery({
  args: { organizationId: v.string(), userId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const role = await getOrganizationRole(ctx, args.organizationId, args.userId);
    if (!role) {
      connectionError(
        "AUTOMATION_CONNECTION_FORBIDDEN",
        "Organization membership is required.",
      );
    }
    return null;
  },
});

export const store = internalMutation({
  args: {
    connectionId: v.optional(v.id("automationConnections")),
    organizationId: v.string(),
    ownerUserId: v.string(),
    provider: automationConnectionProviderValidator,
    label: v.string(),
    accountLabel: v.optional(v.string()),
    encryptedCredentials: v.string(),
    credentialIv: v.string(),
  },
  returns: v.id("automationConnections"),
  handler: async (ctx, args) => {
    const now = Date.now();
    const label = args.label.trim().slice(0, 120);
    if (!label) connectionError("CONNECTION_LABEL_REQUIRED", "Connection label is required.");

    if (args.connectionId) {
      const connection = await ctx.db.get(args.connectionId);
      if (
        !connection ||
        connection.organizationId !== args.organizationId ||
        connection.ownerUserId !== args.ownerUserId ||
        connection.provider !== args.provider
      ) {
        connectionError("AUTOMATION_CONNECTION_NOT_FOUND", "Connection not found.");
      }
      await ctx.db.patch(connection._id, {
        label,
        accountLabel: args.accountLabel?.trim().slice(0, 160) || undefined,
        encryptedCredentials: args.encryptedCredentials,
        credentialIv: args.credentialIv,
        status: "active",
        revokedAt: undefined,
        updatedAt: now,
      });
      return connection._id;
    }

    return await ctx.db.insert("automationConnections", {
      organizationId: args.organizationId,
      ownerUserId: args.ownerUserId,
      provider: args.provider,
      label,
      accountLabel: args.accountLabel?.trim().slice(0, 160) || undefined,
      status: "active",
      encryptedCredentials: args.encryptedCredentials,
      credentialIv: args.credentialIv,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const loadForExecution = internalQuery({
  args: {
    organizationId: v.string(),
    ownerUserId: v.string(),
    connectionId: v.id("automationConnections"),
    provider: automationConnectionProviderValidator,
  },
  returns: v.union(
    v.object({
      encryptedCredentials: v.string(),
      credentialIv: v.string(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (
      !connection ||
      connection.organizationId !== args.organizationId ||
      connection.ownerUserId !== args.ownerUserId ||
      connection.provider !== args.provider ||
      connection.status !== "active"
    ) {
      return null;
    }
    return {
      encryptedCredentials: connection.encryptedCredentials,
      credentialIv: connection.credentialIv,
    };
  },
});

export const markUsed = internalMutation({
  args: { connectionId: v.id("automationConnections") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const connection = await ctx.db.get(args.connectionId);
    if (connection?.status === "active") {
      await ctx.db.patch(connection._id, { lastUsedAt: Date.now() });
    }
    return null;
  },
});
