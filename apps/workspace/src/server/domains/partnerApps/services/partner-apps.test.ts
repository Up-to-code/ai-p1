import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/auth-request";
import { authorizePartnerConnection, listPartnerConnections, updatePartnerConnection } from "./partner-apps";
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
  },
}));

vi.mock("@/server/auth/auth-request", () => ({
  fetchAuthMutation: vi.fn(),
  fetchAuthQuery: vi.fn(),
}));

vi.mock("./partners-platform", () => ({
  verifyPartnerAuthorization: vi.fn(),
  listPublishedPartnerApps: vi.fn(),
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
});
