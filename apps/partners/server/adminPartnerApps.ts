import type { Prisma } from "@prisma/client";
import {
  type OAuthRuntimeProjectionStatus,
  type PartnerReviewRequest,
} from "@qentrah/partner-workspace-sync";
import { prisma } from "@/lib/prisma";
import {
  toAdminPartnerAppRecord,
  type AdminPartnerAppRecord,
} from "@/server/partnerAppCatalog";
import { syncOAuthClientRuntimeProjection } from "@/server/qentrahWorkspace";
import { oauthDebug } from "@/server/oauth-debug";
export type { AdminPartnerAppRecord };

function runtimeProjectionStatus(status: PartnerReviewRequest["status"]): OAuthRuntimeProjectionStatus {
  if (status === "approved") return "approved";
  if (status === "suspended") return "suspended";
  return "rejected";
}

export const adminPartnerAppsRepository = {
  async list(input: { limit?: number; cursor?: string; search?: string } = {}) {
    const take = Math.max(1, Math.min(input.limit ?? 100, 200));
    const search = input.search?.trim();
    const apps = await prisma.partnerApp.findMany({
      where: {
        status: { in: ["pending_review", "active", "rejected", "suspended"] },
        OR: search
          ? [
            { name: { contains: search, mode: "insensitive" } },
            { publisherName: { contains: search, mode: "insensitive" } },
            { clientId: { contains: search, mode: "insensitive" } },
          ]
          : undefined,
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      take: take + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      skip: input.cursor ? 1 : 0,
    });
    const page = apps.slice(0, take);
    return {
      apps: page.map(toAdminPartnerAppRecord),
      nextCursor: apps.length > take ? apps[take]?.id : undefined,
      isDone: apps.length <= take,
    };
  },

  async get(appId: string) {
    const app = await prisma.partnerApp.findUnique({ where: { id: appId } });
    return app ? toAdminPartnerAppRecord(app) : null;
  },

  async review(appId: string, input: PartnerReviewRequest, reviewer: string) {
    oauthDebug("partners.app.review.start", {
      appId,
      status: input.status,
      reviewer,
    });
    const app = await prisma.partnerApp.findUnique({ where: { id: appId } });
    if (!app) throw new Error("Partner app not found.");
    const nextStatus = input.status === "approved" ? "active" : input.status;
    const updated = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const record = await tx.partnerApp.update({
        where: { id: app.id },
        data: {
          status: nextStatus,
          reviewNotes: input.reviewNotes,
          reviewedAt: new Date(),
          workspaceSyncStatus: "pending",
          workspaceSyncError: null,
        },
      });
      await tx.partnerAppReview.create({
        data: {
          appId: app.id,
          status: nextStatus,
          reviewerAuthSubject: reviewer,
          notes: input.reviewNotes,
        },
      });
      await tx.partnerEvent.create({
        data: {
          actorAuthSubject: null,
          appId: app.id,
          eventType: "partner_app.admin_reviewed",
          payload: { status: nextStatus, reviewer },
        },
      });
      return record;
    });
    const record = toAdminPartnerAppRecord(updated);
    const runtimeSync = await publishWorkspaceRuntimeBestEffort(record, input.status);
    const synced = await prisma.partnerApp.update({
      where: { id: record.id },
      data: {
        workspaceSyncStatus: runtimeSync.ok ? "synced" : "failed",
        workspaceSyncError: runtimeSync.ok ? null : runtimeSync.error,
      },
    });
    const syncedRecord = toAdminPartnerAppRecord(synced);
    oauthDebug("partners.app.review.success", {
      appId: syncedRecord.id,
      clientId: syncedRecord.clientId,
      status: input.status,
      workspaceSyncStatus: syncedRecord.workspaceSyncStatus,
    });
    return syncedRecord;
  },
};

async function publishWorkspaceRuntimeBestEffort(app: AdminPartnerAppRecord, status: PartnerReviewRequest["status"]) {
  try {
    oauthDebug("partners.oauth.runtime_publish.start", {
      appId: app.id,
      clientId: app.clientId,
      status,
      redirectUriCount: app.redirectUris.length,
      scopeCount: app.allowedScopes.length,
    });
    await syncOAuthClientRuntimeProjection({
      id: app.id,
      clientId: app.clientId,
      name: app.name,
      publisherName: app.publisherName,
      description: app.description,
      homepageUrl: app.homepageUrl,
      logoUrl: app.logoUrl ?? app.iconUrl,
      iconUrl: app.iconUrl,
      redirectUris: app.redirectUris,
      allowedScopes: app.allowedScopes,
      clientType: app.clientType,
      status,
    }, { status: runtimeProjectionStatus(status) });
    oauthDebug("partners.oauth.runtime_publish.success", {
      appId: app.id,
      clientId: app.clientId,
      status,
    });
    return { ok: true as const };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    oauthDebug("partners.oauth.runtime_publish.error", {
      appId: app.id,
      clientId: app.clientId,
      status,
      error: message,
    });
    console.warn("Workspace OAuth runtime projection publish failed.", error);
    return { ok: false as const, error: message };
  }
}
