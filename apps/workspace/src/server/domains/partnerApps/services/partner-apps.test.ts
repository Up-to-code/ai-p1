import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/convex-workos/server";
import {
  authorizePartnerConnection,
  createWorkOSPartnerApiKey,
  listPartnerConnections,
  updatePartnerConnection,
} from "./partner-apps";
import { verifyPartnerAuthorization, listPublishedPartnerApps } from "./partners-platform";

vi.mock("@convex/_generated/api", () => ({
  api: {
    partnerApps: {
      apps: {
        authorizeConnectionFromHono: "partnerApps.apps.authorizeConnectionFromHono",
        listConnections: "partnerApps.apps.listConnections",
        updateConnectionFromHono: "partnerApps.apps.updateConnectionFromHono",
      },
      webhooks: {
        createEndpointFromHono: "partnerApps.webhooks.createEndpointFromHono",
      },
    },
    workosAuth: {
      resolveOrganizationForPartnerKey: "workosAuth.resolveOrganizationForPartnerKey",
    },
    workosPartnerApiKeys: {
      recordIssued: "workosPartnerApiKeys.recordIssued",
    },
  },
}));

vi.mock("@/server/auth/convex-workos/server", () => ({
  fetchAuthMutation: vi.fn(),
  fetchAuthQuery: vi.fn(),
}));

vi.mock("./partners-platform", () => ({
  verifyPartnerAuthorization: vi.fn(),
  listPublishedPartnerApps: vi.fn(),
}));

const createOrganizationApiKeyMock = vi.fn();

vi.mock("@/server/auth/workos/client", () => ({
  getWorkOSClient: () => ({
    apiKeys: {
      createOrganizationApiKey: createOrganizationApiKeyMock,
    },
  }),
}));

const fetchAuthMutationMock = vi.mocked(fetchAuthMutation);
const fetchAuthQueryMock = vi.mocked(fetchAuthQuery);
const verifyPartnerAuthorizationMock = vi.mocked(verifyPartnerAuthorization);
const listPublishedPartnerAppsMock = vi.mocked(listPublishedPartnerApps);

describe("partner app organization authorization service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("stores only requested and verified user-approved scopes", async () => {
    verifyPartnerAuthorizationMock.mockResolvedValueOnce({
      allowed: true,
      app: {
        id: "partners_app_1",
        clientId: "partners_client_1",
        name: "CRM",
        publisherName: "Partner",
        description: "CRM partner.",
        clientType: "public",
        redirectUris: ["https://partner.example.com/callback"],
        allowedScopes: ["client:read"],
        status: "active",
        updatedAt: 1,
      },
    });
    fetchAuthMutationMock.mockResolvedValueOnce({ id: "connection_1" });

    await authorizePartnerConnection("org_1", {
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_1",
      redirectUri: "https://partner.example.com/callback",
      scopes: ["client:read"],
    });

    expect(fetchAuthMutationMock).toHaveBeenCalledWith(api.partnerApps.apps.authorizeConnectionFromHono, {
      organizationId: "org_1",
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_1",
      scopes: ["client:read"],
      verifiedAt: expect.any(Number),
    });
  });

  it("does not use legacy partner connection field fallbacks when listing", async () => {
    fetchAuthQueryMock.mockResolvedValueOnce([
      {
        id: "connection_1",
        partnersAppId: "partners_app_1",
        partnersClientId: "partners_client_1",
        scopes: ["client:read"],
      },
    ]);
    listPublishedPartnerAppsMock.mockResolvedValueOnce([
      {
        id: "partners_app_1",
        clientId: "partners_client_1",
        name: "CRM",
        publisherName: "Partner",
        description: "CRM partner.",
        clientType: "public",
        redirectUris: ["https://partner.example.com/callback"],
        allowedScopes: ["client:read"],
        status: "active",
        updatedAt: 1,
      },
    ]);

    await expect(listPartnerConnections("org_1")).resolves.toEqual([
      expect.objectContaining({
        id: "connection_1",
        partnerApp: expect.objectContaining({ id: "partners_app_1" }),
      }),
    ]);
  });

  it("reauthorizes active connections with canonical partners ids", async () => {
    fetchAuthQueryMock.mockResolvedValueOnce([
      {
        id: "connection_1",
        partnersAppId: "partners_app_1",
        partnersClientId: "partners_client_1",
        scopes: ["client:read"],
      },
    ]);
    verifyPartnerAuthorizationMock.mockResolvedValueOnce({ allowed: true });
    fetchAuthMutationMock.mockResolvedValueOnce({ id: "connection_1" });

    await updatePartnerConnection("org_1", "connection_1", { status: "active" });

    expect(verifyPartnerAuthorizationMock).toHaveBeenCalledWith({
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_1",
      scopes: ["client:read"],
    });
  });

  it("emits opt-in debug records for connection updates", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.stubEnv("QENTRAH_OAUTH_DEBUG", "1");
    fetchAuthMutationMock.mockResolvedValueOnce({ id: "connection_1" });

    await updatePartnerConnection("org_1", "connection_1", { status: "paused" });

    expect(info).toHaveBeenCalledWith(
      "[qentrah:oauth:workspace]",
      JSON.stringify({
        event: "workspace.partner_apps.connection.update.start",
        organizationId: "org_1",
        connectionId: "connection_1",
        status: "paused",
      }),
    );
    expect(info).toHaveBeenCalledWith(
      "[qentrah:oauth:workspace]",
      JSON.stringify({
        event: "workspace.partner_apps.connection.update.success",
        organizationId: "org_1",
        connectionId: "connection_1",
        status: "paused",
      }),
    );
  });

  it("issues WorkOS partner API keys from an active authorized connection", async () => {
    fetchAuthQueryMock
      .mockResolvedValueOnce([
        {
          id: "connection_1",
          partnersAppId: "partners_app_1",
          partnersClientId: "partners_client_1",
          scopes: ["client:read", "client:update"],
          status: "active",
          effectiveStatus: "active",
        },
      ])
      .mockResolvedValueOnce({ workosOrganizationId: "org_workos_1" });
    createOrganizationApiKeyMock.mockResolvedValueOnce({
      id: "api_key_1",
      value: "sk_test_secret_1234",
      owner: { id: "org_workos_1" },
      permissions: ["client:read"],
    });
    fetchAuthMutationMock.mockResolvedValueOnce({ id: "workos_key_1" });

    await expect(createWorkOSPartnerApiKey("org_1", {
      connectionId: "connection_1",
      partnerId: "partner_1",
      partnerClientId: "partners_client_1",
      name: "CRM bridge",
      permissions: ["client:read"],
    })).resolves.toEqual({
      id: "workos_key_1",
      workosApiKeyId: "api_key_1",
      key: "sk_test_secret_1234",
      keyLast4: "1234",
      permissions: ["client:read"],
    });

    expect(createOrganizationApiKeyMock).toHaveBeenCalledWith({
      organizationId: "org_workos_1",
      name: "CRM bridge",
      permissions: ["client:read"],
    });
    expect(fetchAuthMutationMock).toHaveBeenCalledWith(api.workosPartnerApiKeys.recordIssued, {
      organizationId: "org_1",
      connectionId: "connection_1",
      partnerId: "partner_1",
      partnerClientId: "partners_client_1",
      workosApiKeyId: "api_key_1",
      workosOwnerOrganizationId: "org_workos_1",
      keyLast4: "1234",
      name: "CRM bridge",
      permissions: ["client:read"],
      expiresAt: undefined,
    });
  });

  it("rejects WorkOS partner API key issuance when the requested partner client does not match the grant", async () => {
    fetchAuthQueryMock.mockResolvedValueOnce([
      {
        id: "connection_1",
        partnersAppId: "partners_app_1",
        partnersClientId: "partners_client_1",
        scopes: ["client:read"],
        status: "active",
        effectiveStatus: "active",
      },
    ]);

    await expect(createWorkOSPartnerApiKey("org_1", {
      connectionId: "connection_1",
      partnerId: "partner_1",
      partnerClientId: "different_client",
      name: "CRM bridge",
      permissions: ["client:read"],
    })).rejects.toThrow("Partner client id does not match the authorized connection.");

    expect(createOrganizationApiKeyMock).not.toHaveBeenCalled();
  });
});
