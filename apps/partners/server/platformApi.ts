import { timingSafeEqual } from "node:crypto";
import {
  type PartnerAuthorizationVerificationRequest,
  type PublishedPartnerApp,
  PartnerSyncError,
} from "@qentrah/partner-workspace-sync";
import { prisma } from "@/lib/prisma";
import { normalizeRedirectUris, normalizeScopes } from "@/server/partnerAppPolicies";

type PlatformEnv = Record<string, string | undefined>;

export function platformServiceTokenFromEnv(env: PlatformEnv = process.env) {
  return (
    env.PARTNERS_PLATFORM_SERVICE_TOKEN?.trim() ||
    env.QENTRAH_PLATFORM_SERVICE_TOKEN?.trim() ||
    env.WORKSPACE_SERVICE_TOKEN?.trim() ||
    ""
  );
}

function timingSafeTokenEqual(supplied: string, expected: string) {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export function assertPlatformServiceToken(headers: Headers, env: PlatformEnv = process.env) {
  const expected = platformServiceTokenFromEnv(env);
  const authorization = headers.get("authorization");
  const supplied = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ||
    headers.get("x-qentrah-platform-token")?.trim() ||
    "";
  if (!expected || !supplied || !timingSafeTokenEqual(supplied, expected)) {
    throw new PartnerSyncError("PartnerCatalogUnavailable", "Invalid Partners platform service token.");
  }
}

function toPublishedApp(app: {
  id: string;
  clientId: string;
  name: string;
  publisherName: string;
  description?: string | null;
  homepageUrl?: string | null;
  iconUrl?: string | null;
  logoUrl?: string | null;
  clientType: string;
  redirectUris: string[];
  allowedScopes: string[];
  status: string;
  updatedAt: Date;
}): PublishedPartnerApp {
  return {
    id: app.id,
    clientId: app.clientId,
    name: app.name,
    publisherName: app.publisherName,
    description: app.description || `${app.publisherName} partner app.`,
    homepageUrl: app.homepageUrl,
    iconUrl: app.iconUrl,
    logoUrl: app.logoUrl,
    clientType: app.clientType === "confidential" ? "confidential" : "public",
    redirectUris: normalizeRedirectUris(app.redirectUris),
    allowedScopes: normalizeScopes(app.allowedScopes),
    status: "active",
    updatedAt: app.updatedAt.getTime(),
  };
}

export const platformPartnerAppsRepository = {
  async listPublished(input: { limit?: number; cursor?: string; updatedSince?: number } = {}) {
    const take = Math.max(1, Math.min(input.limit ?? 100, 200));
    const apps = await prisma.partnerApp.findMany({
      where: {
        status: "active",
        updatedAt: input.updatedSince ? { gt: new Date(input.updatedSince) } : undefined,
      },
      orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
      take: take + 1,
      cursor: input.cursor ? { id: input.cursor } : undefined,
      skip: input.cursor ? 1 : 0,
    });
    const page = apps.slice(0, take);
    return {
      apps: page.map(toPublishedApp),
      nextCursor: apps.length > take ? apps[take]?.id : undefined,
      isDone: apps.length <= take,
    };
  },

  async getPublished(appId: string) {
    const app = await prisma.partnerApp.findUnique({ where: { id: appId } });
    if (!app || app.status !== "active") return null;
    return toPublishedApp(app);
  },

  async verifyAuthorization(input: PartnerAuthorizationVerificationRequest) {
    const app = await this.getPublished(input.partnersAppId);
    if (!app) {
      return { allowed: false as const, reason: "app_not_published" };
    }
    if (app.clientId !== input.partnersClientId) {
      return { allowed: false as const, reason: "client_mismatch" };
    }
    if (input.redirectUri && !app.redirectUris.includes(input.redirectUri)) {
      return { allowed: false as const, reason: "redirect_uri_mismatch" };
    }
    const allowedScopes = new Set(app.allowedScopes);
    const requestedScopes = normalizeScopes(input.scopes);
    if (requestedScopes.some((scope) => !allowedScopes.has(scope))) {
      return { allowed: false as const, reason: "scope_denied" };
    }
    return { allowed: true as const, app: { ...app, allowedScopes: requestedScopes } };
  },
};
