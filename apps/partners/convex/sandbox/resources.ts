import { ConvexError, v } from "convex/values";
import { mutationGeneric, queryGeneric } from "convex/server";
import { sandboxActionValidator, sandboxResourceTypeValidator } from "../schema";
import { presentResource } from "./types";
import { requireSandboxOrganization } from "./db";

export const readResource = queryGeneric({
  args: {
    partnerAppId: v.optional(v.string()),
    organizationId: v.string(),
    resource: sandboxResourceTypeValidator,
    resourceId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const organization = await requireSandboxOrganization(ctx, args.organizationId, args.partnerAppId);
    if (args.resource === "organization") {
      return {
        id: organization.organizationId,
        name: organization.name,
        mode: "sandbox",
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
      };
    }

    if (args.resourceId) {
      const id = ctx.db.normalizeId("sandboxResources", args.resourceId);
      const resource = id ? await ctx.db.get(id) : null;
      if (!resource || resource.organizationId !== args.organizationId || resource.resourceType !== args.resource || resource.deletedAt) return null;
      return presentResource(resource);
    }

    const rows = await ctx.db
      .query("sandboxResources")
      .withIndex("by_organization_resource", (q: any) => q.eq("organizationId", args.organizationId).eq("resourceType", args.resource))
      .take(Math.max(1, Math.min(100, Math.floor(args.limit ?? 25))));
    return rows.filter((row: any) => !row.deletedAt).map(presentResource);
  },
});

export const writeResource = mutationGeneric({
  args: {
    partnerAppId: v.string(),
    organizationId: v.string(),
    resource: sandboxResourceTypeValidator,
    action: sandboxActionValidator,
    resourceId: v.optional(v.string()),
    input: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (args.resource === "organization" || args.action === "read") {
      throw new ConvexError({ code: "UNSUPPORTED_SANDBOX_ACTION", message: "Use the sandbox read endpoint for this operation." });
    }
    const appId = ctx.db.normalizeId("partnerApps", args.partnerAppId);
    const app = appId ? await ctx.db.get(appId) : null;
    if (!app) throw new ConvexError({ code: "NOT_FOUND", message: "Sandbox app was not found." });
    await requireSandboxOrganization(ctx, args.organizationId, args.partnerAppId);

    const now = Date.now();
    if (args.action === "create") {
      const id = await ctx.db.insert("sandboxResources", {
        partnerAuthSubject: app.partnerAuthSubject,
        partnerAppId: app._id,
        organizationId: args.organizationId,
        resourceType: args.resource,
        data: args.input ?? {},
        createdAt: now,
        updatedAt: now,
      });
      return presentResource(await ctx.db.get(id));
    }

    const id = args.resourceId ? ctx.db.normalizeId("sandboxResources", args.resourceId) : null;
    const existing = id ? await ctx.db.get(id) : null;
    if (!existing || existing.organizationId !== args.organizationId || existing.resourceType !== args.resource || existing.deletedAt) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Sandbox resource was not found." });
    }

    if (args.action === "update") {
      await ctx.db.patch(existing._id, {
        data: { ...(existing.data ?? {}), ...(args.input ?? {}) },
        updatedAt: now,
      });
      return presentResource(await ctx.db.get(existing._id));
    }

    if (args.action === "delete") {
      await ctx.db.patch(existing._id, { deletedAt: now, updatedAt: now });
      return { deleted: true, id: existing._id };
    }

    throw new ConvexError({ code: "UNSUPPORTED_SANDBOX_ACTION", message: "Unsupported sandbox action." });
  },
});
