import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthUser } from "../auth";
import { assertOrganizationResourcePermission } from "../organizations/profile/access";
import { activeWorkspaceRows } from "../workspace/readSurface";
import { presentWorkspaceRecord } from "../shared/present";
import { theoryValidator } from "./validators";

const MAX_LIST_THEORIES = 500;

type TheoryAccessRow = {
  organizationId: string;
  createdByUserId: string;
  isPrivate: boolean;
  deletedAt?: number;
};

/**
 * Private theories are personal records. Organization owners and admins retain
 * normal access to shared theories but do not receive a private-theory bypass.
 */
export function canReadTheory(
  theory: TheoryAccessRow,
  organizationId: string,
  authenticatedUserId: string,
) {
  return (
    theory.organizationId === organizationId &&
    !theory.deletedAt &&
    (!theory.isPrivate || theory.createdByUserId === authenticatedUserId)
  );
}

export function readableTheoriesForUser<TTheory extends TheoryAccessRow>(
  theories: TTheory[],
  organizationId: string,
  authenticatedUserId: string,
) {
  return theories.filter((theory) => canReadTheory(theory, organizationId, authenticatedUserId));
}

export const list = query({
  args: { organizationId: v.string() },
  returns: v.array(theoryValidator),
  handler: async (ctx, args) => {
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const theories = await ctx.db
      .query("theories")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_THEORIES);
    return activeWorkspaceRows(theories)
      .filter((t) => !t.isPrivate)
      .map(presentWorkspaceRecord);
  },
});

export const listPrivate = query({
  args: { organizationId: v.string() },
  returns: v.array(theoryValidator),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const theories = await ctx.db
      .query("theories")
      .withIndex("by_organization_private", (q) =>
        q.eq("organizationId", args.organizationId).eq("isPrivate", true),
      )
      .take(MAX_LIST_THEORIES);
    return readableTheoriesForUser(activeWorkspaceRows(theories), args.organizationId, user._id)
      .filter((theory) => theory.isPrivate)
      .map(presentWorkspaceRecord);
  },
});

export const listAll = query({
  args: { organizationId: v.string() },
  returns: v.array(theoryValidator),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const theories = await ctx.db
      .query("theories")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_THEORIES);
    return readableTheoriesForUser(activeWorkspaceRows(theories), args.organizationId, user._id)
      .map(presentWorkspaceRecord);
  },
});

export const get = query({
  args: { organizationId: v.string(), theoryId: v.id("theories") },
  returns: v.union(theoryValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const theory = await ctx.db.get(args.theoryId);
    if (!theory || !canReadTheory(theory, args.organizationId, user._id)) return null;
    return presentWorkspaceRecord(theory);
  },
});

export const search = query({
  args: { organizationId: v.string(), query: v.string() },
  returns: v.array(theoryValidator),
  handler: async (ctx, args) => {
    const user = await getAuthUser(ctx);
    await assertOrganizationResourcePermission(ctx, args.organizationId, "client", "read");
    const needle = args.query.trim().toLowerCase();
    if (!needle) return [];
    const theories = await ctx.db
      .query("theories")
      .withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId))
      .take(MAX_LIST_THEORIES);
    return readableTheoriesForUser(activeWorkspaceRows(theories), args.organizationId, user._id)
      .filter((t) =>
        [t.title, t.content, ...(t.tags ?? [])].some((v) => v?.toLowerCase().includes(needle)),
      )
      .map(presentWorkspaceRecord);
  },
});
