import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { IMPLEMENTED_NAVIGATION_CATALOG } from "./catalog";
import { navigationDomainIdValidator, navigationRailModeValidator } from "./validators";

const overlayInputValidator = v.object({
  domainOrder: v.optional(v.array(navigationDomainIdValidator)),
  hiddenOptionalNodeIds: v.optional(v.array(v.string())),
  aliases: v.optional(v.record(v.string(), v.string())),
  railMode: v.optional(navigationRailModeValidator),
  secondaryPanelWidth: v.optional(v.number()),
});

const knownDomainIds = new Set<string>(IMPLEMENTED_NAVIGATION_CATALOG.map((domain) => domain.id));

function uniqueKnownDomainIds(ids: readonly string[] | undefined): string[] {
  return [...new Set((ids ?? []).filter((id) => knownDomainIds.has(id)))];
}

function normalizedAliases(aliases: Readonly<Record<string, string>> | undefined) {
  return Object.fromEntries(Object.entries(aliases ?? {}).flatMap(([key, value]) => {
    const label = value.trim();
    const domainId = key.startsWith("domain:") ? key.slice("domain:".length) : null;
    return domainId && knownDomainIds.has(domainId) && label
      ? [[key, label]]
      : [];
  }));
}

export const updateMyOverlay = mutation({
  args: {
    organizationId: v.string(),
    input: overlayInputValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    const existing = await ctx.db
      .query("userNavigationOverlays")
      .withIndex("by_organization_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", actor.userId),
      )
      .unique();
    const now = Date.now();
    const patch = {
      domainOrder: args.input.domainOrder
        ? uniqueKnownDomainIds(args.input.domainOrder)
        : existing?.domainOrder ?? [],
      hiddenOptionalNodeIds: args.input.hiddenOptionalNodeIds
        ? [...new Set(args.input.hiddenOptionalNodeIds)]
        : existing?.hiddenOptionalNodeIds ?? [],
      aliases: args.input.aliases
        ? normalizedAliases(args.input.aliases)
        : existing?.aliases ?? {},
      railMode: args.input.railMode ?? existing?.railMode ?? "expanded" as const,
      secondaryPanelWidth: args.input.secondaryPanelWidth === undefined
        ? existing?.secondaryPanelWidth ?? 248
        : Math.min(360, Math.max(188, Math.round(args.input.secondaryPanelWidth))),
      version: (existing?.version ?? 0) + 1,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("userNavigationOverlays", {
        organizationId: args.organizationId,
        userId: actor.userId,
        ...patch,
        createdAt: now,
      });
    }
    return null;
  },
});

export const updateOrganizationLayout = mutation({
  args: {
    organizationId: v.string(),
    roleKey: v.string(),
    input: overlayInputValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const actor = await requireServerActor(ctx);
    const roleKey = args.roleKey.trim();
    if (!roleKey) throw new Error("Navigation layout role is required.");
    const existing = await ctx.db
      .query("organizationNavigationLayouts")
      .withIndex("by_organization_role", (q) =>
        q.eq("organizationId", args.organizationId).eq("roleKey", roleKey),
      )
      .unique();
    const now = Date.now();
    const patch = {
      domainOrder: args.input.domainOrder
        ? uniqueKnownDomainIds(args.input.domainOrder)
        : existing?.domainOrder ?? [],
      hiddenOptionalNodeIds: args.input.hiddenOptionalNodeIds
        ? [...new Set(args.input.hiddenOptionalNodeIds)]
        : existing?.hiddenOptionalNodeIds ?? [],
      aliases: args.input.aliases
        ? normalizedAliases(args.input.aliases)
        : existing?.aliases ?? {},
      railMode: args.input.railMode ?? existing?.railMode,
      secondaryPanelWidth: args.input.secondaryPanelWidth === undefined
        ? existing?.secondaryPanelWidth
        : Math.min(360, Math.max(188, Math.round(args.input.secondaryPanelWidth))),
      version: (existing?.version ?? 0) + 1,
      updatedByUserId: actor.userId,
      updatedAt: now,
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
    } else {
      await ctx.db.insert("organizationNavigationLayouts", {
        organizationId: args.organizationId,
        roleKey,
        ...patch,
        createdAt: now,
      });
    }
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: actor.userId,
      action: "navigation.layout.updated",
      target: `navigation-layout:${roleKey}`,
      summary: `Updated the ${roleKey} navigation layout.`,
      createdAt: now,
    });
    return null;
  },
});
