import { describe, expect, it } from "vitest";
import {
  buildOAuthRuntimeProjectionInput,
  createIdempotencyKey,
  normalizeOAuthRuntimeScopes,
  partnerAuthorizationVerificationRequestSchema,
  projectOAuthRuntimeStatus,
  rateLimitKey,
  redactForPartnerSyncLog,
  retryDelayMs,
  signPayload,
  verifyPayloadSignature,
} from "./index";

describe("partner-workspace-sync", () => {
  it("signs and verifies payloads", () => {
    const signature = signPayload("{\"ok\":true}", "secret");
    expect(verifyPayloadSignature("{\"ok\":true}", signature, "secret")).toBe(true);
    expect(verifyPayloadSignature("{\"ok\":false}", signature, "secret")).toBe(false);
  });

  it("validates authorization verification requests", () => {
    expect(() => partnerAuthorizationVerificationRequestSchema.parse({
      partnersAppId: "app_1",
      partnersClientId: "client_1",
      scopes: ["client:read"],
    })).not.toThrow();
  });

  it("redacts sensitive log fields and query secrets", () => {
    expect(redactForPartnerSyncLog({
      authorization: "Bearer secret",
      url: "https://example.com/callback?code=abc&state=ok",
    })).toEqual({
      authorization: "[redacted]",
      url: "https://example.com/callback?code=[redacted]&state=[redacted]",
    });
  });

  it("builds idempotency and rate-limit helpers", () => {
    expect(createIdempotencyKey("webhook")).toMatch(/^webhook:/u);
    expect(rateLimitKey("partners", undefined, "verify", 1)).toBe("partners:verify:1");
    expect(retryDelayMs(3)).toBe(2000);
  });

  it("builds the OAuth runtime projection contract", () => {
    expect(projectOAuthRuntimeStatus("active")).toBe("approved");
    expect(projectOAuthRuntimeStatus("suspended")).toBe("suspended");
    expect(normalizeOAuthRuntimeScopes([
      "openid",
      "clients:read_own",
      "client:read",
      "offline_access",
    ])).toEqual(["client:read"]);

    expect(buildOAuthRuntimeProjectionInput({
      id: "app_1",
      clientId: "client_1",
      name: "Partner CRM",
      publisherName: "Partner Co",
      description: null,
      homepageUrl: "https://partner.example.com",
      iconUrl: "https://partner.example.com/icon.png",
      logoUrl: null,
      clientType: "public",
      redirectUris: ["https://partner.example.com/callback"],
      allowedScopes: ["organization:read_own", "client:read"],
      status: "active",
    })).toMatchObject({
      partnersAppId: "app_1",
      partnersClientId: "client_1",
      description: "Partner Co partner app.",
      logoUrl: "https://partner.example.com/icon.png",
      allowedScopes: ["organization:read", "client:read"],
      status: "approved",
    });
  });
});
