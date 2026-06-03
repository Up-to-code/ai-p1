import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

const workosEventDataValidator = v.object({
  id: v.optional(v.string()),
  object: v.optional(v.string()),
  organization_id: v.optional(v.string()),
  organizationId: v.optional(v.string()),
  user_id: v.optional(v.string()),
  userId: v.optional(v.string()),
  email: v.optional(v.string()),
  role: v.optional(v.string()),
  roles: v.optional(v.array(v.string())),
  permissions: v.optional(v.array(v.string())),
  status: v.optional(v.string()),
  created_at: v.optional(v.string()),
  createdAt: v.optional(v.string()),
  updated_at: v.optional(v.string()),
  updatedAt: v.optional(v.string()),
});

const workosEventValidator = v.object({
  id: v.string(),
  event: v.string(),
  data: v.optional(workosEventDataValidator),
  created_at: v.optional(v.string()),
});

function stringField(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function arrayField(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function authKitProjectionEventId(eventType: string, data: Record<string, unknown>) {
  const objectId = stringField(data.id) ??
    stringField(data.user_id) ??
    stringField(data.userId) ??
    stringField(data.organization_id) ??
    stringField(data.organizationId) ??
    "unknown";
  const version = stringField(data.updatedAt) ??
    stringField(data.updated_at) ??
    stringField(data.createdAt) ??
    stringField(data.created_at) ??
    stringField(data.status) ??
    "current";
  return `authkit:${eventType}:${objectId}:${version}`;
}

export function eventWorkosOrganizationId(event: { event?: string; data?: Record<string, unknown> }) {
  return stringField(event.data?.organization_id) ??
    stringField(event.data?.organizationId) ??
    (event.event?.startsWith("organization.") ? stringField(event.data?.id) : undefined);
}

export function eventWorkosUserId(event: { event?: string; data?: Record<string, unknown> }) {
  return stringField(event.data?.user_id) ??
    stringField(event.data?.userId) ??
    (event.event?.startsWith("user.") ? stringField(event.data?.id) : undefined);
}

export function membershipStatus(value: string | undefined) {
  if (value === "inactive" || value === "pending" || value === "deleted") return value;
  return "active" as const;
}

export function shouldProjectMembershipEvent(eventType: string) {
  return eventType === "organization_membership.created" || eventType === "organization_membership.updated";
}

async function organizationByWorkOSId(ctx: QueryCtx, workosOrganizationId: string) {
  return ctx.db
    .query("organizations")
    .withIndex("by_workos_organization_id", (q) => q.eq("workosOrganizationId", workosOrganizationId))
    .unique();
}

async function applyWorkOSProjection(
  ctx: MutationCtx,
  event: { event: string; data?: Record<string, unknown> },
  now: number,
) {
  const workosOrganizationId = eventWorkosOrganizationId(event);
  const workosUserId = eventWorkosUserId(event);

  if (event.event === "organization.updated" && workosOrganizationId) {
    const organization = await organizationByWorkOSId(ctx, workosOrganizationId);
    if (organization) await ctx.db.patch(organization._id, { updatedAt: now });
  }

  if (shouldProjectMembershipEvent(event.event) && workosOrganizationId && workosUserId) {
    const member = await ctx.db
      .query("workosOrganizationMembers")
      .withIndex("by_workos_org_user", (q) =>
        q.eq("workosOrganizationId", workosOrganizationId).eq("workosUserId", workosUserId),
      )
      .unique();
    if (member) {
      const roles = arrayField(event.data?.roles);
      const permissions = arrayField(event.data?.permissions);
      await ctx.db.patch(member._id, {
        status: membershipStatus(stringField(event.data?.status)),
        role: stringField(event.data?.role) ?? member.role,
        roles: roles.length > 0 ? roles : member.roles,
        permissions: permissions.length > 0 ? permissions : member.permissions,
        updatedAt: now,
      });
    }
  }

  if (event.event === "organization_membership.deleted" && workosOrganizationId && workosUserId) {
    const member = await ctx.db
      .query("workosOrganizationMembers")
      .withIndex("by_workos_org_user", (q) =>
        q.eq("workosOrganizationId", workosOrganizationId).eq("workosUserId", workosUserId),
      )
      .unique();
    if (member) await ctx.db.patch(member._id, { status: "deleted", updatedAt: now });
  }

  if (event.event === "api_key.revoked" && stringField(event.data?.id)) {
    const key = await ctx.db
      .query("workosPartnerApiKeys")
      .withIndex("by_workos_api_key_id", (q) => q.eq("workosApiKeyId", stringField(event.data?.id)!))
      .unique();
    if (key) {
      await ctx.db.patch(key._id, {
        status: "revoked",
        revokedAt: now,
        updatedAt: now,
      });
    }
  }

  return { workosOrganizationId, workosUserId };
}

export const resolveSession = query({
  args: {
    workosUserId: v.string(),
    workosOrganizationId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      userId: v.string(),
      workosUserId: v.string(),
      organizationId: v.string(),
      workosOrganizationId: v.string(),
      membershipId: v.optional(v.string()),
      workosMembershipId: v.optional(v.string()),
      role: v.optional(v.string()),
      roles: v.array(v.string()),
      permissions: v.array(v.string()),
      organizationName: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("workosOrganizationMembers")
      .withIndex("by_workos_org_user", (q) =>
        q.eq("workosOrganizationId", args.workosOrganizationId).eq("workosUserId", args.workosUserId),
      )
      .unique();
    if (!member || member.status !== "active") return null;
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", member.organizationId))
      .unique();
    return {
      userId: member.userId,
      workosUserId: member.workosUserId,
      organizationId: member.organizationId,
      workosOrganizationId: member.workosOrganizationId,
      membershipId: member._id,
      workosMembershipId: member.workosMembershipId,
      role: member.role,
      roles: member.roles,
      permissions: member.permissions,
      organizationName: organization?.name,
    };
  },
});

export const ensureMobileSessionProjection = mutation({
  args: {
    workosUserId: v.string(),
    workosOrganizationId: v.string(),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    roles: v.array(v.string()),
    permissions: v.array(v.string()),
  },
  returns: v.object({
    userId: v.string(),
    workosUserId: v.string(),
    organizationId: v.string(),
    workosOrganizationId: v.string(),
    membershipId: v.optional(v.string()),
    workosMembershipId: v.optional(v.string()),
    role: v.optional(v.string()),
    roles: v.array(v.string()),
    permissions: v.array(v.string()),
    organizationName: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const organization = await organizationByWorkOSId(ctx, args.workosOrganizationId);
    if (!organization) throw new Error("WorkOS organization is not linked to a local workspace.");

    const now = Date.now();
    const roles = args.roles.length > 0 ? args.roles : [args.role ?? "member"];
    const role = args.role ?? roles[0];
    const existing = await ctx.db
      .query("workosOrganizationMembers")
      .withIndex("by_workos_org_user", (q) =>
        q.eq("workosOrganizationId", args.workosOrganizationId).eq("workosUserId", args.workosUserId),
      )
      .unique();
    const memberPatch = {
      organizationId: organization.organizationId,
      userId: args.workosUserId,
      email: args.email,
      role,
      roles,
      permissions: args.permissions,
      status: "active" as const,
      updatedAt: now,
    };
    const membershipId = existing?._id ?? await ctx.db.insert("workosOrganizationMembers", {
      workosOrganizationId: args.workosOrganizationId,
      workosUserId: args.workosUserId,
      createdAt: now,
      ...memberPatch,
    });
    if (existing) await ctx.db.patch(existing._id, memberPatch);

    return {
      userId: args.workosUserId,
      workosUserId: args.workosUserId,
      organizationId: organization.organizationId,
      workosOrganizationId: args.workosOrganizationId,
      membershipId,
      workosMembershipId: existing?.workosMembershipId,
      role,
      roles,
      permissions: args.permissions,
      organizationName: organization.name,
    };
  },
});

export const listUserOrganizations = query({
  args: { workosUserId: v.string() },
  returns: v.array(v.object({
    organizationId: v.string(),
    workosOrganizationId: v.string(),
    name: v.string(),
    role: v.optional(v.string()),
    roles: v.array(v.string()),
  })),
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("workosOrganizationMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.workosUserId))
      .collect();
    const activeMemberships = memberships.filter((membership) => membership.status === "active");
    const organizations = await Promise.all(
      activeMemberships.map(async (membership) => {
        const organization = await ctx.db
          .query("organizations")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", membership.organizationId))
          .unique();
        return {
          organizationId: membership.organizationId,
          workosOrganizationId: membership.workosOrganizationId,
          name: organization?.name ?? "Workspace",
          role: membership.role,
          roles: membership.roles,
        };
      }),
    );

    return organizations.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const resolveOrganizationForPartnerKey = query({
  args: { organizationId: v.string() },
  returns: v.union(v.null(), v.object({ organizationId: v.string(), workosOrganizationId: v.optional(v.string()) })),
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();
    if (!organization) return null;
    return {
      organizationId: organization.organizationId,
      workosOrganizationId: organization.workosOrganizationId,
    };
  },
});

export const ensureOrganizationForWorkOSActions = mutation({
  args: { organizationId: v.string() },
  returns: v.object({ organizationId: v.string(), workosOrganizationId: v.string() }),
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();
    if (!organization) throw new Error("Organization was not found.");
    if (!organization.workosOrganizationId) throw new Error("Organization is not linked to WorkOS.");
    return {
      organizationId: organization.organizationId,
      workosOrganizationId: organization.workosOrganizationId,
    };
  },
});

export const ensureLocalOrganizationForWorkOSActions = mutation({
  args: { workosOrganizationId: v.string() },
  returns: v.object({ organizationId: v.string(), workosOrganizationId: v.string() }),
  handler: async (ctx, args) => {
    const organization = await organizationByWorkOSId(ctx, args.workosOrganizationId);
    if (!organization) throw new Error("WorkOS organization is not linked to a local workspace.");
    return {
      organizationId: organization.organizationId,
      workosOrganizationId: args.workosOrganizationId,
    };
  },
});

export const updateOrganizationSettingsProjection = mutation({
  args: {
    organizationId: v.string(),
    name: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();
    if (!organization) throw new Error("Organization was not found.");
    await ctx.db.patch(organization._id, {
      ...(args.name ? { name: args.name, legalName: args.name } : {}),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const markMembershipProjectionDeleted = mutation({
  args: {
    workosMembershipId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const member = await ctx.db
      .query("workosOrganizationMembers")
      .withIndex("by_workos_membership_id", (q) => q.eq("workosMembershipId", args.workosMembershipId))
      .unique();
    if (member) await ctx.db.patch(member._id, { status: "deleted", updatedAt: Date.now() });
    return null;
  },
});

export const linkIdentity = mutation({
  args: {
    workosUserId: v.string(),
    email: v.string(),
    migrationStatus: v.union(
      v.literal("pending"),
      v.literal("linked"),
      v.literal("verified"),
      v.literal("failed"),
    ),
    verifiedAt: v.optional(v.number()),
  },
  returns: v.object({ id: v.id("workosIdentityMappings") }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("workosIdentityMappings")
      .withIndex("by_workos_user_id", (q) => q.eq("workosUserId", args.workosUserId))
      .unique();
    const patch = {
      email: args.email.toLowerCase(),
      migrationStatus: args.migrationStatus,
      lastVerifiedAt: args.verifiedAt,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { id: existing._id };
    }
    const id = await ctx.db.insert("workosIdentityMappings", {
      workosUserId: args.workosUserId,
      createdAt: now,
      ...patch,
    });
    return { id };
  },
});

export const upsertOrganizationMapping = mutation({
  args: {
    organizationId: v.string(),
    workosOrganizationId: v.string(),
  },
  returns: v.object({ organizationId: v.string(), workosOrganizationId: v.string() }),
  handler: async (ctx, args) => {
    const organization = await ctx.db
      .query("organizations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();
    if (!organization) throw new Error("Organization was not found.");
    await ctx.db.patch(organization._id, {
      workosOrganizationId: args.workosOrganizationId,
      updatedAt: Date.now(),
    });
    return args;
  },
});

export const upsertMembershipProjection = mutation({
  args: {
    organizationId: v.string(),
    workosOrganizationId: v.string(),
    workosUserId: v.string(),
    workosMembershipId: v.optional(v.string()),
    userId: v.string(),
    email: v.optional(v.string()),
    role: v.optional(v.string()),
    roles: v.array(v.string()),
    permissions: v.array(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("pending"), v.literal("deleted")),
  },
  returns: v.object({ id: v.id("workosOrganizationMembers") }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("workosOrganizationMembers")
      .withIndex("by_workos_org_user", (q) =>
        q.eq("workosOrganizationId", args.workosOrganizationId).eq("workosUserId", args.workosUserId),
      )
      .unique();
    const patch = {
      organizationId: args.organizationId,
      workosMembershipId: args.workosMembershipId,
      userId: args.userId,
      email: args.email,
      role: args.role,
      roles: args.roles,
      permissions: args.permissions,
      status: args.status,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return { id: existing._id };
    }
    const id = await ctx.db.insert("workosOrganizationMembers", {
      workosOrganizationId: args.workosOrganizationId,
      workosUserId: args.workosUserId,
      createdAt: now,
      ...patch,
    });
    return { id };
  },
});

export const bootstrapWorkspaceOwner = mutation({
  args: {
    organizationId: v.string(),
    workosOrganizationId: v.string(),
    organizationName: v.string(),
    organizationType: v.string(),
    workosUserId: v.string(),
    workosMembershipId: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  returns: v.object({ organizationId: v.string(), workosOrganizationId: v.string() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existingByWorkOS = await ctx.db
      .query("organizations")
      .withIndex("by_workos_organization_id", (q) => q.eq("workosOrganizationId", args.workosOrganizationId))
      .unique();
    const existingByLocal = await ctx.db
      .query("organizations")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .unique();
    const organization = existingByWorkOS ?? existingByLocal;
    const organizationPatch = {
      organizationId: args.organizationId,
      workosOrganizationId: args.workosOrganizationId,
      name: args.organizationName,
      legalName: args.organizationName,
      type: args.organizationType,
      email: args.email ?? "",
      phone: "",
      website: "",
      address: "",
      updatedAt: now,
    };

    if (organization) {
      await ctx.db.patch(organization._id, organizationPatch);
    } else {
      await ctx.db.insert("organizations", organizationPatch);
    }

    const identity = await ctx.db
      .query("workosIdentityMappings")
      .withIndex("by_workos_user_id", (q) => q.eq("workosUserId", args.workosUserId))
      .unique();
    if (identity) {
      await ctx.db.patch(identity._id, {
        email: (args.email ?? identity.email).toLowerCase(),
        migrationStatus: "verified",
        lastVerifiedAt: now,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("workosIdentityMappings", {
        workosUserId: args.workosUserId,
        email: (args.email ?? "").toLowerCase(),
        migrationStatus: "verified",
        lastVerifiedAt: now,
        createdAt: now,
        updatedAt: now,
      });
    }

    const member = await ctx.db
      .query("workosOrganizationMembers")
      .withIndex("by_workos_org_user", (q) =>
        q.eq("workosOrganizationId", args.workosOrganizationId).eq("workosUserId", args.workosUserId),
      )
      .unique();
    const memberPatch = {
      organizationId: args.organizationId,
      workosMembershipId: args.workosMembershipId,
      userId: args.workosUserId,
      email: args.email,
      role: "owner",
      roles: ["owner", "admin"],
      permissions: ["workspace:read", "organization:read", "organization:update"],
      status: "active" as const,
      updatedAt: now,
    };

    if (member) {
      await ctx.db.patch(member._id, memberPatch);
    } else {
      await ctx.db.insert("workosOrganizationMembers", {
        workosOrganizationId: args.workosOrganizationId,
        workosUserId: args.workosUserId,
        createdAt: now,
        ...memberPatch,
      });
    }

    return {
      organizationId: args.organizationId,
      workosOrganizationId: args.workosOrganizationId,
    };
  },
});

export const processWebhookEvent = mutation({
  args: { event: workosEventValidator },
  returns: v.object({
    status: v.union(v.literal("processed"), v.literal("duplicate"), v.literal("failed")),
  }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("workosWebhookEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", args.event.id))
      .unique();
    if (existing) return { status: "duplicate" as const };

    const now = Date.now();
    const event = args.event;
    let workosOrganizationId = eventWorkosOrganizationId(event);
    let workosUserId = eventWorkosUserId(event);

    try {
      const projection = await applyWorkOSProjection(ctx, event, now);
      workosOrganizationId = projection.workosOrganizationId;
      workosUserId = projection.workosUserId;

      await ctx.db.insert("workosWebhookEvents", {
        eventId: event.id,
        eventType: event.event,
        workosOrganizationId,
        workosUserId,
        status: "processed",
        raw: event,
        receivedAt: now,
        processedAt: now,
      });
      return { status: "processed" as const };
    } catch (error) {
      await ctx.db.insert("workosWebhookEvents", {
        eventId: event.id,
        eventType: event.event,
        workosOrganizationId,
        workosUserId,
        status: "failed",
        error: error instanceof Error ? error.message : "WorkOS webhook failed.",
        raw: event,
        receivedAt: now,
      });
      return { status: "failed" as const };
    }
  },
});

export const projectAuthKitEvent = internalMutation({
  args: {
    event: v.string(),
    data: v.record(v.string(), v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const eventId = authKitProjectionEventId(args.event, args.data);
    const existing = await ctx.db
      .query("workosWebhookEvents")
      .withIndex("by_event_id", (q) => q.eq("eventId", eventId))
      .unique();
    if (existing) return null;

    const now = Date.now();
    const event = { event: args.event, data: args.data };
    const workosOrganizationId = eventWorkosOrganizationId(event);
    const workosUserId = eventWorkosUserId(event);

    try {
      await applyWorkOSProjection(ctx, event, now);
      await ctx.db.insert("workosWebhookEvents", {
        eventId,
        eventType: args.event,
        workosOrganizationId,
        workosUserId,
        status: "processed",
        raw: { source: "workos-authkit-component", ...event },
        receivedAt: now,
        processedAt: now,
      });
    } catch (error) {
      await ctx.db.insert("workosWebhookEvents", {
        eventId,
        eventType: args.event,
        workosOrganizationId,
        workosUserId,
        status: "failed",
        error: error instanceof Error ? error.message : "WorkOS AuthKit event failed.",
        raw: { source: "workos-authkit-component", ...event },
        receivedAt: now,
      });
    }
    return null;
  },
});

export type WorkOSPartnerApiKeyDoc = Doc<"workosPartnerApiKeys">;
