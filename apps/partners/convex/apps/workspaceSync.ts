import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { auditPartnerEvent, ensurePartnerProfile } from "../shared/runtime";
import { requireOwnedApp } from "./db";

export const recordWorkspaceSyncResult = mutationGeneric({
  args: {
    appId: v.string(),
    ok: v.boolean(),
    workspacePartnerAppId: v.optional(v.string()),
    workspaceOauthClientId: v.optional(v.string()),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { identity } = await ensurePartnerProfile(ctx, now);
    const app = await requireOwnedApp(ctx, args.appId, identity.subject);
    await ctx.db.patch(app._id, {
      workspacePartnerAppId: args.workspacePartnerAppId ?? app.workspacePartnerAppId,
      workspaceOauthClientId: args.workspaceOauthClientId ?? app.workspaceOauthClientId,
      workspaceSyncStatus: args.ok ? "synced" : "failed",
      workspaceSyncError: args.ok ? undefined : args.error ?? "Workspace sync failed.",
      updatedAt: now,
    });
    await auditPartnerEvent(ctx, {
      actorAuthSubject: identity.subject,
      appId: app._id,
      eventType: args.ok ? "partner_app.workspace_synced" : "partner_app.workspace_sync_failed",
      payload: {
        workspacePartnerAppId: args.workspacePartnerAppId,
        workspaceOauthClientId: args.workspaceOauthClientId,
        error: args.error,
      },
      now,
    });
    return { ok: true };
  },
});
