import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { searchResourceTypeValidator, searchSensitivityValidator } from "./validators";

const resultValidator = v.object({
  principalKeys: v.array(v.string()),
  locales: v.array(v.string()),
  resourceTypes: v.array(searchResourceTypeValidator),
  sensitivity: v.array(searchSensitivityValidator),
  policyVersion: v.number(),
});

/**
 * Resolves coarse search filters from live membership. These keys only reduce
 * external candidates; `hydrate` remains the authoritative record decision.
 */
export const resolve = query({
  args: { organizationId: v.string() },
  returns: resultValidator,
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "read");
    const actor = await requireServerActor(ctx);
    const [spaceMemberships, projectMemberships, policy] = await Promise.all([
      ctx.db.query("spaceMembers").withIndex("by_user_id", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", actor.userId),
      ).collect(),
      ctx.db.query("projectMembers").withIndex("by_user", (q) =>
        q.eq("organizationId", args.organizationId).eq("userId", actor.userId),
      ).collect(),
      ctx.db.query("searchPolicies").withIndex("by_organization", (q) =>
        q.eq("organizationId", args.organizationId),
      ).unique(),
    ]);
    const active = (record: { deletedAt?: number; recordState: string }) =>
      !record.deletedAt && record.recordState !== "deleted";
    const principalKeys = [
      `org:${args.organizationId}:member`,
      `user:${actor.userId}`,
      ...spaceMemberships.filter(active).map((membership) => `space:${membership.spaceId}:member`),
      ...projectMemberships.filter(active).map((membership) => `project:${membership.projectId}:member`),
    ];
    const defaultResourceTypes = ["project", "task"] as const;
    return {
      principalKeys: [...new Set(principalKeys)],
      locales: [...new Set([policy?.defaultLocale ?? "en", ...(policy?.fallbackLocales ?? [])])],
      resourceTypes: policy?.enabledResourceTypes ?? [...defaultResourceTypes],
      // Restricted/confidential records fail closed until sensitivity-specific
      // actor policy is implemented by the canonical Resource Access Module.
      sensitivity: ["standard" as const],
      policyVersion: policy?.version ?? 0,
    };
  },
});
