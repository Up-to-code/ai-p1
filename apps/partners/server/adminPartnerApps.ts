import { timingSafeEqual } from "node:crypto";
import {
  buildOAuthRuntimeProjectionInput,
  type PartnerReviewRequest,
  type PublishedPartnerApp,
} from "@qentrah/partner-workspace-sync";
import { prisma } from "@/lib/prisma";
import { normalizeRedirectUris, normalizeScopes } from "@/server/partnerAppPolicies";
import { qentrahWorkspaceConfig } from "@/server/qentrahWorkspace";

type AdminEnv = Record<string, string | undefined>;

export type AdminPartnerAppRecord = Omit<PublishedPartnerApp, "status"> & {
  status: "pending" | "approved" | "rejected" | "suspended";
  reviewNotes?: string | null;
  submittedAt?: number | null;
  reviewedAt?: number | null;
  createdAt: number;
};

export function partnersAdminServiceTokenFromEnv(env: AdminEnv = process.env) {
  return env.PARTNERS_ADMIN_SERVICE_TOKEN?.trim() || "";
}

function timingSafeTokenEqual(supplied: string, expected: string) {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export function assertPartnersAdminServiceToken(headers: Headers, env: AdminEnv = process.env) {
  const expected = partnersAdminServiceTokenFromEnv(env);
  const authorization = headers.get("authorization");
  const supplied = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ||
    headers.get("x-qentrah-admin-token")?.trim() ||
    "";
  if (!expected || !supplied || !timingSafeTokenEqual(supplied, expected)) {
    throw new Error("Invalid Partners admin service token.");
  }
}

function adminStatus(status: string): AdminPartnerAppRecord["status"] {
  if (status === "active") return "approved";
  if (status === "pending_review") return "pending";
  if (status === "suspended") return "suspended";
  if (status === "rejected") return "rejected";
  return "pending";
}

function toAdminRecord(app: {
  id: string;
  clientId: string;
  name: string;
  publisherName: string;
  homepageUrl?: string | null;
  iconUrl?: string | null;
  logoUrl?: string | null;
  clientType: string;
  redirectUris: string[];
  allowedScopes: string[];
  status: string;
  reviewNotes?: string | null;
  submittedAt?: Date | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminPartnerAppRecord {
  return {
    id: app.id,
    clientId: app.clientId,
    name: app.name,
    publisherName: app.publisherName,
    description: `${app.publisherName} partner app submitted from Partners.`,
    homepageUrl: app.homepageUrl,
    iconUrl: app.iconUrl,
    logoUrl: app.logoUrl,
    clientType: app.clientType === "confidential" ? "confidential" : "public",
    redirectUris: normalizeRedirectUris(app.redirectUris),
    allowedScopes: normalizeScopes(app.allowedScopes),
    status: adminStatus(app.status),
    reviewNotes: app.reviewNotes,
    submittedAt: app.submittedAt?.getTime() ?? null,
    reviewedAt: app.reviewedAt?.getTime() ?? null,
    createdAt: app.createdAt.getTime(),
    updatedAt: app.updatedAt.getTime(),
  };
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
      apps: page.map(toAdminRecord),
      nextCursor: apps.length > take ? apps[take]?.id : undefined,
      isDone: apps.length <= take,
    };
  },

  async get(appId: string) {
    const app = await prisma.partnerApp.findUnique({ where: { id: appId } });
    return app ? toAdminRecord(app) : null;
  },

  async review(appId: string, input: PartnerReviewRequest, reviewer: string) {
    const app = await prisma.partnerApp.findUnique({ where: { id: appId } });
    if (!app) throw new Error("Partner app not found.");
    const nextStatus = input.status === "approved" ? "active" : input.status;
    const updated = await prisma.$transaction(async (tx) => {
      const record = await tx.partnerApp.update({
        where: { id: app.id },
        data: {
          status: nextStatus,
          reviewNotes: input.reviewNotes,
          reviewedAt: new Date(),
          workspaceSyncStatus: nextStatus === "active" ? "synced" : "not_synced",
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
    const record = toAdminRecord(updated);
    await publishWorkspaceRuntimeBestEffort(record, input.status);
    return record;
  },
};

async function publishWorkspaceRuntimeBestEffort(app: AdminPartnerAppRecord, status: PartnerReviewRequest["status"]) {
  const config = qentrahWorkspaceConfig();
  if (!config.baseUrl || !config.serviceToken) return;

  try {
    const projection = buildOAuthRuntimeProjectionInput({
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
    });
    await fetch(`${config.baseUrl}/api/v1/admin/oauth-client-runtime-sync`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${config.serviceToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(projection),
    });
  } catch (error) {
    console.warn("Workspace OAuth runtime projection publish failed.", error);
  }
}
