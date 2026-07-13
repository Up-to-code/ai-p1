import { v } from "convex/values";
import {
  isPlatformAdminEmail as matchesPlatformAdminEmail,
} from "../../../../packages/auth/src/platform-admin";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { query } from "../_generated/server";

const platformAdminAllowlist =
  process.env.QENTRAH_PLATFORM_ADMIN_EMAILS ??
  process.env.PLATFORM_ADMIN_EMAILS ??
  "";

function isPlatformAdminEmail(email: string | null | undefined): boolean {
  return matchesPlatformAdminEmail(email, platformAdminAllowlist);
}

export async function assertPlatformAdmin(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required.");
  }
  if (!isPlatformAdminEmail(identity.email)) {
    throw new Error("Platform admin required.");
  }
  return { _id: identity.subject, id: identity.subject, email: identity.email ?? "" };
}

export const canUsePlatformAdminAction = query({
  args: {},
  returns: v.object({ allowed: v.boolean() }),
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();
    if (!user) return { allowed: false };
    return { allowed: isPlatformAdminEmail(user.email) };
  },
});
