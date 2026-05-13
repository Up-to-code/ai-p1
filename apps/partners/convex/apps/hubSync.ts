import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { auditPartnerEvent, ensurePartnerProfile } from "../shared/runtime";
import { requireOwnedApp } from "./db";

export const recordHubSyncResult = mutationGeneric({
  args: {
    appId: v.string(),
    ok: v.boolean(),
    hubPartnerAppId: v.optional(v.string()),
    hubOauthClientId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { identity } = await ensurePartnerProfile(ctx, now);
    const app = await requireOwnedApp(ctx, args.appId, identity.subject);
    await ctx.db.patch(app._id, {
      hubPartnerAppId: args.hubPartnerAppId ?? app.hubPartnerAppId,
      hubOauthClientId: args.hubOauthClientId ?? app.hubOauthClientId,
      hubSyncStatus: args.ok ? "synced" : "failed",
      hubSyncError: args.ok ? undefined : args.error ?? "Hub sync failed.",
      updatedAt: now,
    });
    await auditPartnerEvent(ctx, {
      actorAuthSubject: identity.subject,
      appId: app._id,
      eventType: args.ok ? "partner_app.hub_synced" : "partner_app.hub_sync_failed",
      payload: {
        hubPartnerAppId: args.hubPartnerAppId,
        hubOauthClientId: args.hubOauthClientId,
        error: args.error,
      },
      now,
    });
    return { ok: true };
  },
});
