import { afterEach, describe, expect, it, vi } from "vitest";
import type { PartnerAppSummary } from "./partnerApps";
import { qentrahWorkspaceConfig, normalizeWorkspaceScopes, submitPartnerAppRegistration } from "./qentrahWorkspace";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Qentrah Workspace registration config", () => {
  it("uses the explicit platform service token and normalizes URLs", () => {
    expect(qentrahWorkspaceConfig({
      QENTRAH_WORKSPACE_API_URL: "localhost:3000/",
      QENTRAH_PLATFORM_SERVICE_TOKEN: " platform-secret ",
      SITE_URL: "http://localhost:3002/",
    })).toEqual({
      baseUrl: "https://localhost:3000",
      serviceToken: "platform-secret",
      callbackBaseUrl: "http://localhost:3002",
    });
  });

  it("uses the workspace service token when no platform token is configured", () => {
    expect(qentrahWorkspaceConfig({
      QENTRAH_WORKSPACE_API_URL: "http://localhost:3000",
      QENTRAH_WORKSPACE_SERVICE_TOKEN: "workspace-secret",
    }).serviceToken).toBe("workspace-secret");
  });

  it("prefers configured brand env names for workspace sync", () => {
    expect(qentrahWorkspaceConfig({
      QENTRAH_WORKSPACE_API_URL: "http://workspace.localhost:3000",
      QENTRAH_PLATFORM_SERVICE_TOKEN: "platform-secret",
    })).toMatchObject({
      baseUrl: "http://workspace.localhost:3000",
      serviceToken: "platform-secret",
    });
  });

  it("maps legacy Partners scopes to Workspace API scopes and drops auth-only scopes", () => {
    expect(normalizeWorkspaceScopes([
      "openid",
      "clients:read_own",
      "properties:read_own",
      "organization:read_own",
      "client:read",
      "offline_access",
    ])).toEqual(["client:read", "property:read", "organization:read"]);
  });

  it("submits created partner apps to the Workspace registration endpoint for review", async () => {
    vi.stubEnv("QENTRAH_WORKSPACE_API_URL", "https://app.qentrah.com/");
    vi.stubEnv("QENTRAH_PLATFORM_SERVICE_TOKEN", "service-token");
    vi.stubEnv("SITE_URL", "https://partners.qentrah.com/");
    const fetchMock = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => Response.json({
      app: {
        id: "workspace_app_123",
        oauthClientId: "workspace_oauth_123",
        status: "pending",
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await submitPartnerAppRegistration({
      id: "partners_app_123",
      clientId: "partners_client_123",
      name: "Launch Desk",
      publisherName: "Qentrah Labs",
      homepageUrl: "https://partner.example.com",
      iconUrl: "https://partner.example.com/icon.png",
      logoUrl: null,
      clientType: "confidential",
      status: "pending_review",
      workspacePartnerAppId: null,
      workspaceOauthClientId: null,
      workspaceSyncStatus: "pending",
      workspaceSyncError: null,
      redirectUris: ["https://partner.example.com/oauth/callback"],
      allowedScopes: ["openid", "organization:read_own", "client:read", "property:read"],
      authorizationExpiresAfterDays: 14,
      reviewNotes: null,
      submittedAt: Date.UTC(2026, 4, 14),
      reviewedAt: null,
      createdAt: Date.UTC(2026, 4, 14),
      updatedAt: Date.UTC(2026, 4, 14),
    } satisfies PartnerAppSummary);

    expect(result).toEqual({
      id: "workspace_app_123",
      oauthClientId: "workspace_oauth_123",
      status: "pending",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.qentrah.com/api/v1/admin/partner-app-registrations",
      expect.objectContaining({
        method: "POST",
        headers: {
          authorization: "Bearer service-token",
          "content-type": "application/json",
        },
      }),
    );
    const [, requestInit] = fetchMock.mock.calls[0]!;
    if (!requestInit) throw new Error("Expected Workspace registration fetch options.");
    expect(JSON.parse(String(requestInit.body))).toMatchObject({
      partnersAppId: "partners_app_123",
      partnersClientId: "partners_client_123",
      name: "Launch Desk",
      publisherName: "Qentrah Labs",
      homepageUrl: "https://partner.example.com",
      logoUrl: "https://partner.example.com/icon.png",
      redirectUris: ["https://partner.example.com/oauth/callback"],
      allowedScopes: ["organization:read", "client:read", "property:read"],
      clientType: "confidential",
      callbackUrl: "https://partners.qentrah.com/api/qentrah-review-callback",
    });
  });
});
