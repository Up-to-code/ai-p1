import { mutationGeneric } from "convex/server";
import { v } from "convex/values";
import { assertPartnerAppEditable, auditPartnerEvent, ensurePartnerProfile } from "../shared/runtime";
import { requireOwnedApp } from "./db";

export const submitPartnerAppForReview = mutationGeneric({
  args: { appId: v.string() },
  handler: async (ctx, args) => {
    const now = Date.now();
    const { identity } = await ensurePartnerProfile(ctx, now);
    const app = await requireOwnedApp(ctx, args.appId, identity.subject);
    assertPartnerAppEditable(app.status);
    await ctx.db.patch(app._id, {
      status: "pending_review",
      submittedAt: now,
      reviewNotes: undefined,
      workspaceSyncStatus: "pending",
      workspaceSyncError: undefined,
      updatedAt: now,
    });
    await ctx.db.insert("partnerAppReviews", {
      appId: app._id,
      status: "pending_review",
      createdAt: now,
    });
    await auditPartnerEvent(ctx, { actorAuthSubject: identity.subject, appId: app._id, eventType: "partner_app.submitted", now });
    return { ok: true };
  },
});

export const applyWorkspaceReviewDecision = mutationGeneric({
  args: {
    serviceToken: v.string(),
    appId: v.string(),
    status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("suspended")),
    workspacePartnerAppId: v.optional(v.string()),
    workspaceOauthClientId: v.optional(v.string()),
    reviewNotes: v.optional(v.string()),
    clientSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expected = process.env.PARTNERS_REVIEW_CALLBACK_TOKEN?.trim();
    if (!expected || args.serviceToken !== expected) {
      throw new Error("Invalid Partners review callback token.");
    }

    const normalizedId = ctx.db.normalizeId("partnerApps", args.appId);
    const app = normalizedId ? await ctx.db.get(normalizedId) : null;
    if (!app) throw new Error("Partner app not found.");

    const now = Date.now();
    const nextStatus = args.status === "approved" ? "active" : args.status;
    await ctx.db.patch(app._id, {
      status: nextStatus,
      workspacePartnerAppId: args.workspacePartnerAppId ?? app.workspacePartnerAppId,
      workspaceOauthClientId: args.workspaceOauthClientId ?? app.workspaceOauthClientId,
      workspaceSyncStatus: "synced",
      workspaceSyncError: undefined,
      reviewNotes: args.reviewNotes,
      reviewedAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("partnerAppReviews", {
      appId: app._id,
      status: nextStatus,
      reviewerAuthSubject: "anan-workspace",
      notes: args.reviewNotes,
      createdAt: now,
    });
    await auditPartnerEvent(ctx, {
      appId: app._id,
      eventType: "partner_app.workspace_reviewed",
      payload: {
        status: args.status,
        workspacePartnerAppId: args.workspacePartnerAppId,
        workspaceOauthClientId: args.workspaceOauthClientId,
        hasClientSecret: Boolean(args.clientSecret),
      },
      now,
    });
    return { ok: true };
  },
});
