import { beforeEach, describe, expect, it } from "vitest";
import { parsePartnerKeyCallbackPayload, partnerKeySessionFromCallback, workspacePartnerAuthorizationUrl } from "./partner-key-auth";

describe("WorkOS partner key auth helpers", () => {
  beforeEach(() => {
    process.env.QENTRAH_WORKSPACE_API_URL = "http://localhost:3000";
    process.env.QENTRAH_CLIENT_ID = "partners_client_123";
    process.env.PARTNER_APP_URL = "http://localhost:3004";
    process.env.DEMO_ACCESS_TOKEN = "demo-token";
    process.env.SESSION_SECRET = "abcdefghijklmnopqrstuvwxyz123456";
  });

  it("builds a Workspace integration handoff URL", () => {
    const url = new URL(workspacePartnerAuthorizationUrl());

    expect(url.origin).toBe("http://localhost:3000");
    expect(url.pathname).toBe("/en/integrations");
    expect(url.searchParams.get("partnerClientId")).toBe("partners_client_123");
    expect(url.searchParams.get("returnTo")).toBe("http://localhost:3004/api/auth/qentrah/callback");
    expect(url.searchParams.get("scopes")).toContain("client:read");
  });

  it("parses the Workspace partner key callback payload", () => {
    expect(parsePartnerKeyCallbackPayload({
      organization_id: "org_123",
      key: "sk_live_partner",
      key_id: "key_123",
      key_last4: "abcd",
      scopes: "client:read asset:read",
      expires_at: "1790000000000",
    })).toEqual({
      organizationId: "org_123",
      partnerKey: "sk_live_partner",
      keyId: "key_123",
      keyLast4: "abcd",
      scope: "client:read asset:read",
      expiresAt: 1790000000000,
    });
  });

  it("converts callback data into a server-side token session", () => {
    const session = partnerKeySessionFromCallback({
      organizationId: "org_123",
      partnerKey: "sk_live_partner",
      scope: "client:read",
    });

    expect(session).toMatchObject({
      accessToken: "sk_live_partner",
      tokenType: "WorkOSPartnerApiKey",
      organizationId: "org_123",
      scope: "client:read",
    });
    expect(session.obtainedAt).toBeGreaterThan(0);
  });

  it("requires both organization and key", () => {
    expect(() => parsePartnerKeyCallbackPayload({ key: "sk_live_partner" })).toThrow("Missing organizationId");
    expect(() => parsePartnerKeyCallbackPayload({ organizationId: "org_123" })).toThrow("Missing WorkOS partner API key");
  });
});
