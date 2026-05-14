import { makeFunctionReference } from "convex/server";
import { timingSafeEqual } from "node:crypto";
import type { Id } from "@convex/_generated/dataModel";
import { convexHttp } from "@/server/convex/http-client";
import type {
  AdminReviewPartnerAppPayload,
  PartnerAppRegistrationPayload,
} from "../validation/admin-partner-app.schema";

const refs = {
  upsertFromPartnersService: makeFunctionReference<"mutation", { input: PartnerAppRegistrationPayload }, unknown>(
    "partnerApps/apps:upsertFromPartnersService",
  ),
  upsertOAuthClientFromPartnersService: makeFunctionReference<
    "action",
    { input: OAuthClientSyncInput },
    { clientId: string; created: boolean }
  >("partnerApps/oauthClients:upsertFromPartnersService"),
  listForAdminService: makeFunctionReference<"query", Record<string, never>, unknown[]>(
    "partnerApps/apps:listForAdminService",
  ),
  listApprovedCatalog: makeFunctionReference<"query", Record<string, never>, unknown[]>(
    "partnerApps/apps:listApprovedCatalog",
  ),
  reviewFromAdminService: makeFunctionReference<
    "mutation",
    { appId: Id<"partnerApps">; input: AdminReviewPartnerAppPayload },
    PartnerAppRecord
  >("partnerApps/apps:reviewFromAdminService"),
};

export type PartnerAppRecord = {
  id: string;
  partnersAppId?: string;
  partnersClientId?: string;
  oauthClientId: string;
  callbackUrl?: string;
  name: string;
  publisherName?: string;
  description: string;
  homepageUrl?: string;
  logoUrl?: string;
  redirectUris: string[];
  allowedScopes: string[];
  clientType?: "public" | "confidential";
  status: "pending" | "approved" | "rejected" | "suspended";
  reviewNotes?: string;
  reviewedAt?: number;
  createdAt: number;
  updatedAt: number;
};

type ServiceTokenEnv = Record<string, string | undefined>;
type OAuthClientSyncInput = {
  workspacePartnerAppId: string;
  clientId: string;
  clientType: "public" | "confidential";
  name: string;
  homepageUrl?: string;
  logoUrl?: string;
  redirectUris: string[];
  allowedScopes: string[];
  status: PartnerAppRecord["status"];
};

export function adminServiceTokenFromEnv(env: ServiceTokenEnv = process.env) {
  return env.WORKSPACE_ADMIN_SERVICE_TOKEN?.trim() || "";
}

export function partnersReviewCallbackTokenFromEnv(env: ServiceTokenEnv = process.env) {
  return env.PARTNERS_REVIEW_CALLBACK_TOKEN?.trim() || "";
}

function timingSafeTokenEqual(supplied: string, expected: string) {
  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export function assertAdminServiceToken(headers: Headers, env: ServiceTokenEnv = process.env) {
  const expected = adminServiceTokenFromEnv(env);
  const authorization = headers.get("authorization");
  const bearer = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
  const supplied = bearer || headers.get("x-workspace-admin-service-token")?.trim();
  if (!expected || !supplied || !timingSafeTokenEqual(supplied, expected)) {
    throw new Error("Invalid Workspace admin service token.");
  }
}

function normalizeOrigin(value: string | undefined) {
  return value?.trim().replace(/\/+$/u, "") ?? "";
}

export function trustedAdminOriginsFromEnv(env: ServiceTokenEnv = process.env) {
  return Array.from(new Set([
    normalizeOrigin(env.ADMIN_SITE_URL) || "https://admin.qentrah.com",
    env.NODE_ENV === "production" ? "" : "http://localhost:3003",
  ].filter(Boolean)));
}

export function assertTrustedAdminOrigin(headers: Headers, env: ServiceTokenEnv = process.env) {
  const supplied = normalizeOrigin(headers.get("origin") ?? headers.get("x-qentrah-admin-origin") ?? undefined);
  const trusted = trustedAdminOriginsFromEnv(env);
  if (!supplied || !trusted.includes(supplied)) {
    throw new Error("Invalid Workspace admin request origin.");
  }
}

export function upsertPartnerAppRegistration(input: PartnerAppRegistrationPayload) {
  return convexHttp.mutation(refs.upsertFromPartnersService, { input })
    .then(async (app) => {
      const partnerApp = app as PartnerAppRecord;
      await syncOAuthClientForPartnerApp(partnerApp);
      return partnerApp;
    });
}

export function listAdminPartnerApps() {
  return convexHttp.query(refs.listForAdminService, {}) as Promise<PartnerAppRecord[]>;
}

export function listApprovedPartnerApps() {
  return convexHttp.query(refs.listApprovedCatalog, {}) as Promise<PartnerAppRecord[]>;
}

async function notifyPartnersReview(app: PartnerAppRecord, input: AdminReviewPartnerAppPayload) {
  if (!app.callbackUrl || !app.partnersAppId) return { delivered: false };
  const serviceToken = partnersReviewCallbackTokenFromEnv();
  if (!serviceToken) return { delivered: false };

  const response = await fetch(app.callbackUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${serviceToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      appId: app.partnersAppId,
      status: input.status,
      workspacePartnerAppId: app.id,
      workspaceOauthClientId: app.oauthClientId,
      reviewNotes: input.reviewNotes,
    }),
  });

  return { delivered: response.ok, status: response.status };
}

export async function reviewAdminPartnerApp(appId: string, input: AdminReviewPartnerAppPayload) {
  const app = await convexHttp.mutation(refs.reviewFromAdminService, {
    appId: appId as Id<"partnerApps">,
    input,
  }) as PartnerAppRecord;
  await syncOAuthClientForPartnerApp(app);
  const callback = await notifyPartnersReview(app, input);
  return { app, callback };
}

export function syncOAuthClientForPartnerApp(app: PartnerAppRecord) {
  const clientId = app.partnersClientId || app.oauthClientId;
  return convexHttp.action(refs.upsertOAuthClientFromPartnersService, {
    input: {
      workspacePartnerAppId: app.id,
      clientId,
      clientType: app.clientType ?? "public",
      name: app.name,
      homepageUrl: app.homepageUrl,
      logoUrl: app.logoUrl,
      redirectUris: app.redirectUris,
      allowedScopes: app.allowedScopes,
      status: app.status,
    },
  });
}
