import { prisma } from "@/lib/prisma";
import { DEFAULT_AUTHORIZATION_EXPIRY_DAYS } from "@/lib/partner-authorization";
import {
  assertPartnerAppEditable,
  assertPartnerOwnsApp,
  normalizeRedirectUris,
  normalizeScopes,
} from "@/server/partnerAppPolicies";
import {
  toPartnerAppSummary,
  type PartnerAppClientType,
  type PartnerAppStatus,
  type PartnerAppSummary,
} from "@/server/partnerAppCatalog";
import { auditPartnerEvent, ensurePartnerProfile, randomToken } from "@/server/partnerRuntime";

export type { PartnerAppClientType, PartnerAppStatus, PartnerAppSummary };

async function requireOwnedApp(authSubject: string, appId: string) {
  const app = await prisma.partnerApp.findFirst({
    where: { OR: [{ id: appId }, { clientId: appId }] },
  });
  assertPartnerOwnsApp(app, authSubject);
  if (!app) throw new Error("Partner app not found");
  return app;
}

export const partnerAppsRepository = {
  async list(authSubject: string) {
    const apps = await prisma.partnerApp.findMany({
      where: { partnerAuthSubject: authSubject },
      orderBy: { updatedAt: "desc" },
    });
    return apps.map(toPartnerAppSummary);
  },

  async getById(authSubject: string, appId: string) {
    const app = await prisma.partnerApp.findFirst({
      where: {
        partnerAuthSubject: authSubject,
        OR: [{ id: appId }, { clientId: appId }],
      },
    });
    return app ? toPartnerAppSummary(app) : null;
  },

  async create(
    authSubject: string,
    input: {
      name: string;
      publisherName: string;
      homepageUrl: string;
      iconUrl?: string;
      logoUrl?: string;
      clientType: PartnerAppClientType;
      redirectUris: string[];
      allowedScopes: string[];
    },
  ) {
    await ensurePartnerProfile({ subject: authSubject });
    const partnerOrganization = await prisma.programmerOrganization.findUnique({
      where: { ownerAuthSubject: authSubject },
    });
    const clientId = randomToken("partners_client", 18);
    const clientSecret = input.clientType === "confidential" ? randomToken("partners_secret", 32) : undefined;
    const app = await prisma.partnerApp.create({
      data: {
        partnerAuthSubject: authSubject,
        partnerOrganizationId: partnerOrganization?.id,
        clientId,
        clientSecretHash: clientSecret,
        name: input.name.trim(),
        publisherName: input.publisherName.trim(),
        homepageUrl: input.homepageUrl.trim(),
        iconUrl: input.iconUrl?.trim() || undefined,
        logoUrl: input.logoUrl?.trim() || undefined,
        clientType: input.clientType,
        redirectUris: normalizeRedirectUris(input.redirectUris),
        allowedScopes: normalizeScopes(input.allowedScopes),
        status: "draft",
        workspaceSyncStatus: "not_synced",
        authorizationExpiresAfterDays: DEFAULT_AUTHORIZATION_EXPIRY_DAYS,
      },
    });
    await auditPartnerEvent({
      actorAuthSubject: authSubject,
      appId: app.id,
      eventType: "partner_app.created",
      payload: { clientId, clientType: input.clientType },
    });
    return { appId: app.id, clientId, clientSecret };
  },

  async update(
    authSubject: string,
    input: {
      appId: string;
      name: string;
      publisherName: string;
      homepageUrl: string;
      iconUrl?: string;
      logoUrl?: string;
      redirectUris: string[];
      allowedScopes: string[];
    },
  ) {
    const app = await requireOwnedApp(authSubject, input.appId);
    assertPartnerAppEditable(app.status);
    await prisma.partnerApp.update({
      where: { id: app.id },
      data: {
        name: input.name.trim(),
        publisherName: input.publisherName.trim(),
        homepageUrl: input.homepageUrl.trim(),
        iconUrl: input.iconUrl?.trim() || undefined,
        logoUrl: input.logoUrl?.trim() || undefined,
        redirectUris: normalizeRedirectUris(input.redirectUris),
        allowedScopes: normalizeScopes(input.allowedScopes),
        status: app.status === "rejected" ? "draft" : app.status,
        reviewNotes: null,
        workspaceSyncStatus: "not_synced",
        workspaceSyncError: null,
      },
    });
    await auditPartnerEvent({ actorAuthSubject: authSubject, appId: app.id, eventType: "partner_app.updated" });
    return { ok: true as const };
  },

  async submitForReview(authSubject: string, appId: string) {
    const app = await requireOwnedApp(authSubject, appId);
    assertPartnerAppEditable(app.status);
    await prisma.$transaction([
      prisma.partnerApp.update({
        where: { id: app.id },
        data: {
          status: "pending_review",
          submittedAt: new Date(),
          reviewNotes: null,
          workspaceSyncStatus: "pending",
          workspaceSyncError: null,
        },
      }),
      prisma.partnerAppReview.create({
        data: { appId: app.id, status: "pending_review" },
      }),
    ]);
    await auditPartnerEvent({ actorAuthSubject: authSubject, appId: app.id, eventType: "partner_app.submitted" });
    return { ok: true as const };
  },

  async delete(authSubject: string, appId: string) {
    const app = await requireOwnedApp(authSubject, appId);
    await prisma.partnerApp.delete({
      where: { id: app.id },
    });
    await auditPartnerEvent({
      actorAuthSubject: authSubject,
      eventType: "partner_app.deleted",
      payload: { appId: app.id, clientId: app.clientId, status: app.status },
    });
    return { ok: true as const };
  },

};
