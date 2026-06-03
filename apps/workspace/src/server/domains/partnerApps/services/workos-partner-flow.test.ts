import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { fetchAuthMutation, fetchAuthQuery } from "@/server/auth/convex-workos/server";
import { convexCalls } from "@/server/convex/http-client";
import {
  authorizePartnerConnection,
  createWorkOSPartnerApiKey,
} from "./partner-apps";
import {
  requireWorkOSPartnerApiKeyAccess,
} from "./workos-partner-api-key-access";
import {
  writeAuthorizedPartnerResource,
} from "./partner-resource-access";
import { verifyPartnerAuthorization } from "./partners-platform";
import { writePartnerResource } from "./resources";

vi.mock("@convex/_generated/api", () => ({
  api: {
    partnerApps: {
      apps: {
        authorizeConnectionFromHono: "partnerApps.apps.authorizeConnectionFromHono",
        listConnections: "partnerApps.apps.listConnections",
      },
    },
    workosAuth: {
      resolveOrganizationForPartnerKey: "workosAuth.resolveOrganizationForPartnerKey",
    },
    workosPartnerApiKeys: {
      recordIssued: "workosPartnerApiKeys.recordIssued",
      validateGrant: "workosPartnerApiKeys.validateGrant",
    },
  },
}));

vi.mock("@/server/auth/convex-workos/server", () => ({
  fetchAuthMutation: vi.fn(),
  fetchAuthQuery: vi.fn(),
}));

vi.mock("@/server/convex/http-client", () => ({
  convexCalls: {
    mutation: vi.fn(),
  },
}));

vi.mock("./partners-platform", () => ({
  verifyPartnerAuthorization: vi.fn(),
}));

vi.mock("./resources", () => ({
  writePartnerResource: vi.fn(),
}));

const createOrganizationApiKeyMock = vi.fn();
const createValidationMock = vi.fn();

vi.mock("@/server/auth/workos/client", () => ({
  getWorkOSClient: () => ({
    apiKeys: {
      createOrganizationApiKey: createOrganizationApiKeyMock,
      createValidation: createValidationMock,
    },
  }),
}));

const fetchAuthMutationMock = vi.mocked(fetchAuthMutation);
const fetchAuthQueryMock = vi.mocked(fetchAuthQuery);
const convexMutationMock = vi.mocked(convexCalls.mutation);
const verifyPartnerAuthorizationMock = vi.mocked(verifyPartnerAuthorization);
const writePartnerResourceMock = vi.mocked(writePartnerResource);

describe("WorkOS partner app authorization flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("authorizes a partner app, issues a WorkOS key, validates it, and writes as a partner app actor", async () => {
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
        allowedScopes: ["client:read", "client:update"],
        status: "active",
        updatedAt: 1,
      },
    });
    fetchAuthMutationMock.mockResolvedValueOnce({ id: "connection_1" });

    await authorizePartnerConnection("org_1", {
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_1",
      redirectUri: "https://partner.example.com/callback",
      scopes: ["client:read", "client:update"],
    });

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
      permissions: ["client:update"],
    });
    fetchAuthMutationMock.mockResolvedValueOnce({ id: "workos_key_1" });

    await expect(createWorkOSPartnerApiKey("org_1", {
      connectionId: "connection_1",
      partnerId: "partner_1",
      partnerClientId: "partners_client_1",
      name: "CRM bridge",
      permissions: ["client:update"],
    })).resolves.toMatchObject({
      id: "workos_key_1",
      workosApiKeyId: "api_key_1",
      key: "sk_test_secret_1234",
      permissions: ["client:update"],
    });

    createValidationMock.mockResolvedValueOnce({
      apiKey: {
        id: "api_key_1",
        owner: { id: "org_workos_1" },
        permissions: ["client:update"],
      },
    });
    convexMutationMock.mockResolvedValueOnce({
      ok: true,
      organizationId: "org_1",
      partnerId: "partner_1",
      partnerClientId: "partners_client_1",
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_1",
      connectionId: "connection_1" as Id<"organizationPartnerConnections">,
      apiKeyId: "workos_key_1" as Id<"workosPartnerApiKeys">,
      permissions: ["client:update"],
      name: "CRM bridge",
    });

    const request = new Request("https://workspace.test/organizations/org_1/clients/client_1", {
      headers: { authorization: "Bearer sk_test_secret_1234" },
    });
    const access = await requireWorkOSPartnerApiKeyAccess({
      req: {
        header: (name: string) => request.headers.get(name) ?? undefined,
      },
    } as never, "org_1", "client", "update");

    writePartnerResourceMock.mockResolvedValueOnce({ ok: true });
    await expect(writeAuthorizedPartnerResource(access, "client", "update", {
      clientId: "client_1",
      name: "Updated client",
    })).resolves.toEqual({ ok: true });

    expect(fetchAuthMutationMock).toHaveBeenNthCalledWith(1, api.partnerApps.apps.authorizeConnectionFromHono, {
      organizationId: "org_1",
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_1",
      scopes: ["client:read", "client:update"],
      verifiedAt: expect.any(Number),
    });
    expect(createOrganizationApiKeyMock).toHaveBeenCalledWith({
      organizationId: "org_workos_1",
      name: "CRM bridge",
      permissions: ["client:update"],
    });
    expect(fetchAuthMutationMock).toHaveBeenNthCalledWith(2, api.workosPartnerApiKeys.recordIssued, expect.objectContaining({
      organizationId: "org_1",
      connectionId: "connection_1",
      partnerId: "partner_1",
      partnerClientId: "partners_client_1",
      workosApiKeyId: "api_key_1",
      permissions: ["client:update"],
    }));
    expect(convexMutationMock).toHaveBeenCalledWith(api.workosPartnerApiKeys.validateGrant, {
      organizationId: "org_1",
      workosApiKeyId: "api_key_1",
      workosOwnerOrganizationId: "org_workos_1",
      permissions: ["client:update"],
      resource: "client",
      action: "update",
    });
    expect(writePartnerResourceMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "partnerApp",
        partnerAppId: "partners_app_1",
        connectionId: "connection_1",
        scopes: ["client:update"],
      }),
      "client",
      "update",
      { clientId: "client_1", name: "Updated client" },
    );
  });
});
