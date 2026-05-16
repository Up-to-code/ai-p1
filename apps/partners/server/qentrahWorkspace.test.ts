import { afterEach, describe, expect, it, vi } from "vitest";
import type { PartnerAppSummary } from "./partnerApps";
import { qentrahWorkspaceConfig, normalizeWorkspaceScopes, syncOAuthClientRuntimeProjection } from "./qentrahWorkspace";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Qentrah Workspace registration config", () => {
  it("uses the explicit platform service token and normalizes URLs", () => {
    expect(qentrahWorkspaceConfig({
      QENTRAH_WORKSPACE_API_URL: "localhost:3000/",
      QENTRAH_PLATFORM_SERVICE_TOKEN: " platform-secret ",
    })).toEqual({
      baseUrl: "https://localhost:3000",
      serviceToken: "platform-secret",
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

  it("syncs approved partner apps to the Workspace OAuth runtime endpoint", async () => {
    vi.stubEnv("QENTRAH_WORKSPACE_API_URL", "https://app.qentrah.com/");
    vi.stubEnv("QENTRAH_PLATFORM_SERVICE_TOKEN", "service-token");
    const fetchMock = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) => Response.json({
      runtime: {
        partnersAppId: "partners_app_123",
        clientId: "partners_client_123",
        status: "approved",
      },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await syncOAuthClientRuntimeProjection({
      id: "partners_app_123",
      clientId: "partners_client_123",
      name: "Launch Desk",
      publisherName: "Qentrah Labs",
      homepageUrl: "https://partner.example.com",
      iconUrl: "https://partner.example.com/icon.png",
      logoUrl: null,
      clientType: "confidential",
      status: "active",
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
      partnersAppId: "partners_app_123",
      clientId: "partners_client_123",
      status: "approved",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://app.qentrah.com/api/v1/admin/oauth-client-runtime-sync",
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
      status: "approved",
    });
  });
});
