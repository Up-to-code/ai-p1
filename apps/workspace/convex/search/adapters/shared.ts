import type { MutationCtx } from "../../_generated/server";

export async function searchLocale(ctx: MutationCtx, organizationId: string) {
  const policy = await ctx.db.query("searchPolicies").withIndex("by_organization", (q) => q.eq("organizationId", organizationId)).unique();
  return policy?.defaultLocale ?? "en";
}

export function normalizedKeywords(values: Array<string | undefined>) {
  return [...new Set(values.flatMap((value) => value?.split(/[\s,]+/) ?? []).map((value) => value.trim()).filter(Boolean))];
}
