import { Hono } from "hono";
import { z } from "zod/v4";
import {
  copySetCookieHeaders,
  getJsonMessage,
  isExistingAccountResponse,
  readJsonBody,
  resolveBridgeSecret,
  safeResponseJson,
} from "@qentrah/web-foundation/api";
import { partnerReviewRequestSchema } from "@qentrah/partner-workspace-sync";
import { requireCurrentPartnerSubject } from "@/lib/auth-server";
import { validatePartnerOrganizationInput, validatePartnerSignupInput, type PartnerOrganizationInput } from "@/lib/partner-signup";
import { assertPartnersProductionEnv } from "@/security/production-env";
import { buildSameOriginAuthHeaders, buildTrustedSignupHeaders } from "@/trust/auth-request";
import { appendPartnerAuthRateLimitHeaders, checkPartnerAuthRateLimit, partnerAuthJson, partnerAuthRateLimitedResponse } from "@/app/api/partner-auth-rate-limit";
import { adminPartnerAppsRepository, assertPartnersAdminServiceToken } from "@/server/adminPartnerApps";
import { createProgrammerOrganizationForCurrentPartner, ensureCurrentPartnerProfile, isExistingPartnerOrganizationError } from "@/server/partnerOrganizations";
import { assertPlatformServiceToken, platformPartnerAppsRepository } from "@/server/platformApi";
import { sandboxPartnerApiApp, sandboxOAuthApp } from "@/server/sandbox/app";
import { partnerMcpConnectionsRepository } from "@/server/mcp/connections";
import { handleMcpMethodNotAllowed, handlePartnerMcp } from "@/server/mcp/transport";
import { partnerMcpConnectionInputSchema, partnerMcpConnectionUpdateSchema } from "@/server/mcp/permissions";
import { jsonError, originFromContext, parseJson } from "./http";

const LOCAL_PARTNER_SIGNUP_BRIDGE_SECRET = "local-qentrah-partner-signup-bridge-secret";

function authRequestContext(request: Request) {
  return {
    headers: request.headers,
    nextUrl: new URL(request.url),
    url: request.url,
  };
}

function isLocalDevelopmentEnv() {
  return process.env.NODE_ENV === "development" && process.env.VERCEL_ENV !== "production";
}

function readBridgeSecret() {
  return resolveBridgeSecret(
    [
      { header: "x-qentrah-partner-signup-secret", value: process.env.PARTNER_SIGNUP_BRIDGE_SECRET },
      {
        header: "x-qentrah-partner-signup-secret",
        value: isLocalDevelopmentEnv() ? LOCAL_PARTNER_SIGNUP_BRIDGE_SECRET : undefined,
      },
    ],
    "PARTNER_SIGNUP_BRIDGE_SECRET is not configured.",
  );
}

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

async function callBetterAuthSignup(request: Request, path: "sign-up" | "sign-in", body: Record<string, unknown>) {
  const bridge = readBridgeSecret();
  return fetch(new URL(`/api/auth/${path}/email`, request.url), {
    method: "POST",
    headers: buildTrustedSignupHeaders({
      request: authRequestContext(request),
      bridgeHeader: bridge.header,
      bridgeSecret: bridge.value,
    }),
    body: JSON.stringify(body),
  });
}

async function callBetterAuthSignIn(request: Request, body: Record<string, unknown>) {
  return fetch(new URL("/api/auth/sign-in/email", request.url), {
    method: "POST",
    headers: buildSameOriginAuthHeaders(authRequestContext(request)),
    body: JSON.stringify(body),
  });
}

export const partnersHonoApp = new Hono();

partnersHonoApp.post("/api/partner-signin", async (c) => {
  try {
    assertPartnersProductionEnv();
    const body = await readJsonBody<Record<string, unknown>>(c.req.raw);
    const email = readString(body.email).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return c.json({ error: "PARTNER_SIGNIN_INVALID", message: "Enter your email and password." }, 400);

    const rateLimit = checkPartnerAuthRateLimit("partner-signin", c.req.raw as never, email);
    if (!rateLimit.allowed) {
      return partnerAuthRateLimitedResponse(rateLimit, {
        error: "PARTNER_SIGNIN_RATE_LIMITED",
        message: "Too many sign in attempts. Try again shortly.",
      });
    }

    const authResponse = await callBetterAuthSignIn(c.req.raw, { email, password, rememberMe: true });
    const authPayload = await safeResponseJson(authResponse, {});
    if (!authResponse.ok) {
      return partnerAuthJson({
        error: "PARTNER_SIGNIN_FAILED",
        message: getJsonMessage(authPayload, "Could not sign in. Check the email and password."),
      }, { status: authResponse.status }, rateLimit);
    }

    const response = Response.json({ ok: true });
    copySetCookieHeaders(authResponse, response as never);
    appendPartnerAuthRateLimitHeaders(response as never, rateLimit);
    return response;
  } catch (error) {
    return c.json({ error: "PARTNER_SIGNIN_FAILED", message: error instanceof Error ? error.message : "Partner sign in failed." }, 400);
  }
});

partnersHonoApp.post("/api/partner-signup", async (c) => {
  try {
    assertPartnersProductionEnv();
    const body = await readJsonBody<Parameters<typeof validatePartnerSignupInput>[0]>(c.req.raw);
    const parsed = validatePartnerSignupInput(body);
    if (!parsed.ok) return c.json({ error: "PARTNER_SIGNUP_INVALID", message: parsed.message }, 400);

    const rateLimit = checkPartnerAuthRateLimit("partner-signup", c.req.raw as never, parsed.value.email);
    if (!rateLimit.allowed) {
      return partnerAuthRateLimitedResponse(rateLimit, {
        error: "PARTNER_SIGNUP_RATE_LIMITED",
        message: "Too many signup attempts. Try again shortly.",
      });
    }

    const authBody = { email: parsed.value.email, password: parsed.value.password, name: parsed.value.name };
    let authResponse = await callBetterAuthSignup(c.req.raw, "sign-up", authBody);
    let authPayload = await safeResponseJson(authResponse, {});
    const accountAlreadyExists = !authResponse.ok && isExistingAccountResponse(authResponse.status, authPayload);

    if (accountAlreadyExists) {
      authResponse = await callBetterAuthSignup(c.req.raw, "sign-in", {
        email: parsed.value.email,
        password: parsed.value.password,
        rememberMe: true,
      });
      authPayload = await safeResponseJson(authResponse, {});
    }

    if (!authResponse.ok) {
      return partnerAuthJson({
        error: accountAlreadyExists ? "PARTNER_ACCOUNT_EXISTS" : "PARTNER_SIGNUP_AUTH_FAILED",
        message: accountAlreadyExists
          ? "An account with this email already exists. Sign in with the password used when the account was created."
          : getJsonMessage(authPayload, "Could not create or sign in the partner programmer account."),
        redirectTo: accountAlreadyExists ? "/signin?returnTo=%2Fdashboard" : undefined,
      }, { status: accountAlreadyExists ? 409 : authResponse.status }, rateLimit);
    }

    const response = Response.json({ ok: true, redirectTo: "/dashboard" });
    copySetCookieHeaders(authResponse, response as never);
    appendPartnerAuthRateLimitHeaders(response as never, rateLimit);
    return response;
  } catch (error) {
    return c.json({ error: "PARTNER_SIGNUP_FAILED", message: error instanceof Error ? error.message : "Partner programmer signup failed." }, 400);
  }
});

partnersHonoApp.post("/api/partner-organization", async (c) => {
  try {
    const body = await c.req.json<PartnerOrganizationInput>().catch(() => ({} as PartnerOrganizationInput));
    const parsed = validatePartnerOrganizationInput(body);
    if (!parsed.ok) return c.json({ error: "PARTNER_ORGANIZATION_INVALID", message: parsed.message }, 400);
    const token = await requireCurrentPartnerSubject(c.req.raw.headers);
    try {
      await ensureCurrentPartnerProfile(token);
      const result = await createProgrammerOrganizationForCurrentPartner(token, parsed.value);
      return c.json({ ok: true, result }, 201);
    } catch (error) {
      if (isExistingPartnerOrganizationError(error)) return c.json({ ok: true, alreadyExists: true });
      throw error;
    }
  } catch {
    return c.json({ error: "PARTNER_ORGANIZATION_FAILED", message: "Could not create the programmer organization. Please try again." }, 400);
  }
});

partnersHonoApp.get("/api/admin/partner-apps", async (c) => {
  try {
    assertPartnersAdminServiceToken(c.req.raw.headers);
    return c.json(await adminPartnerAppsRepository.list({
      limit: Number(c.req.query("limit") || "100"),
      cursor: c.req.query("cursor") || undefined,
      search: c.req.query("search") || undefined,
    }));
  } catch (error) {
    return jsonError(c, error, "Partners admin API failed.");
  }
});

partnersHonoApp.get("/api/admin/partner-apps/:appId", async (c) => {
  try {
    assertPartnersAdminServiceToken(c.req.raw.headers);
    const app = await adminPartnerAppsRepository.get(c.req.param("appId"));
    if (!app) return c.json({ error: "Partner app not found." }, 404);
    return c.json({ app });
  } catch (error) {
    return jsonError(c, error, "Partners admin API failed.");
  }
});

partnersHonoApp.patch("/api/admin/partner-apps/:appId/review", async (c) => {
  try {
    assertPartnersAdminServiceToken(c.req.raw.headers);
    const reviewer = c.req.header("x-qentrah-admin-actor")?.trim() || "admin";
    const input = partnerReviewRequestSchema.parse(await c.req.json());
    return c.json({ app: await adminPartnerAppsRepository.review(c.req.param("appId"), input, reviewer) });
  } catch (error) {
    return jsonError(c, error, "Partners admin API failed.");
  }
});

partnersHonoApp.get("/api/platform/published-apps", async (c) => {
  try {
    assertPlatformServiceToken(c.req.raw.headers);
    return c.json(await platformPartnerAppsRepository.listPublished({
      limit: Number(c.req.query("limit") || "100"),
      cursor: c.req.query("cursor") || undefined,
      updatedSince: c.req.query("updatedSince") ? Number(c.req.query("updatedSince")) : undefined,
    }));
  } catch (error) {
    return jsonError(c, error, "Partner catalog unavailable.");
  }
});

partnersHonoApp.get("/api/platform/published-apps/:appId", async (c) => {
  try {
    assertPlatformServiceToken(c.req.raw.headers);
    const app = await platformPartnerAppsRepository.getPublished(c.req.param("appId"));
    if (!app) return c.json({ error: "Partner app not found." }, 404);
    return c.json({ app });
  } catch (error) {
    return jsonError(c, error, "Partner catalog unavailable.");
  }
});

partnersHonoApp.post("/api/platform/verify-authorization", async (c) => {
  try {
    assertPlatformServiceToken(c.req.raw.headers);
    return c.json(await platformPartnerAppsRepository.verifyAuthorization(await c.req.json()));
  } catch (error) {
    return jsonError(c, error, "Partner authorization verification failed.");
  }
});

partnersHonoApp.get("/api/search", async (c) => {
  const [{ createFromSource }, { source }] = await Promise.all([
    import("fumadocs-core/search/server"),
    import("@/lib/source"),
  ]);
  return createFromSource(source).GET(c.req.raw);
});

partnersHonoApp.get("/api/v1/mcp-connections", async (c) => {
  try {
    const subject = await requireCurrentPartnerSubject(c.req.raw.headers);
    return c.json({ connections: await partnerMcpConnectionsRepository.list(subject) });
  } catch (error) {
    return jsonError(c, error, "MCP links could not be loaded.");
  }
});

partnersHonoApp.post("/api/v1/mcp-connections", async (c) => {
  try {
    const subject = await requireCurrentPartnerSubject(c.req.raw.headers);
    const input = await parseJson(c, partnerMcpConnectionInputSchema);
    return c.json(await partnerMcpConnectionsRepository.create(subject, input, originFromContext(c)), 201);
  } catch (error) {
    return jsonError(c, error, "MCP link could not be created.");
  }
});

partnersHonoApp.patch("/api/v1/mcp-connections/:connectionId", async (c) => {
  try {
    const subject = await requireCurrentPartnerSubject(c.req.raw.headers);
    const input = await parseJson(c, partnerMcpConnectionUpdateSchema);
    return c.json({ connection: await partnerMcpConnectionsRepository.update(subject, c.req.param("connectionId"), input) });
  } catch (error) {
    return jsonError(c, error, "MCP link could not be updated.");
  }
});

partnersHonoApp.delete("/api/v1/mcp-connections/:connectionId", async (c) => {
  try {
    const subject = await requireCurrentPartnerSubject(c.req.raw.headers);
    return c.json(await partnerMcpConnectionsRepository.revoke(subject, c.req.param("connectionId")));
  } catch (error) {
    return jsonError(c, error, "MCP link could not be revoked.");
  }
});

partnersHonoApp.post("/api/v1/mcp-connections/:connectionId/rotate", async (c) => {
  try {
    const subject = await requireCurrentPartnerSubject(c.req.raw.headers);
    return c.json(await partnerMcpConnectionsRepository.rotate(subject, c.req.param("connectionId"), originFromContext(c)));
  } catch (error) {
    return jsonError(c, error, "MCP link could not be rotated.");
  }
});

partnersHonoApp.get("/api/mcp/partner/:publicId/:secret", handleMcpMethodNotAllowed);
partnersHonoApp.delete("/api/mcp/partner/:publicId/:secret", handleMcpMethodNotAllowed);
partnersHonoApp.post("/api/mcp/partner/:publicId/:secret", handlePartnerMcp);
partnersHonoApp.route("/", sandboxPartnerApiApp);
partnersHonoApp.route("/", sandboxOAuthApp);

partnersHonoApp.notFound((c) => c.json({ error: "Not Found" }, 404));
partnersHonoApp.onError((error, c) => c.json({ error: error.message || "Internal Server Error" }, 500));

export type PartnersHonoAppType = typeof partnersHonoApp;
