import { describe, expect, it } from "vitest";
import {
  buildIntegrationHeaders,
  parseAnanIntegrationPayload,
  partnerAppRegistrationSyncSchema,
  workspaceAuthorizationStatusSchema,
} from "./contracts";

describe("Anan integration contracts", () => {
  it("accepts partner app registration sync payloads", () => {
    const payload = partnerAppRegistrationSyncSchema.parse({
      contract: "partner.app_registration_sync.v1",
      idempotencyKey: "sync-123456",
      partnerAppId: "app_123",
      clientId: "partners_client_123",
      name: "Valuation App",
      publisherName: "Partner Studio",
      homepageUrl: "https://partner.example.com",
      clientType: "confidential",
      redirectUris: ["https://partner.example/callback"],
      allowedScopes: ["workspace:read"],
      trusted: true,
      isActive: true,
      occurredAt: 1_776_000_000_000,
    });

    expect(parseAnanIntegrationPayload(payload).contract).toBe("partner.app_registration_sync.v1");
    expect(Object.keys(payload).sort()).toEqual([
      "allowedScopes",
      "clientId",
      "clientType",
      "contract",
      "idempotencyKey",
      "isActive",
      "name",
      "occurredAt",
      "partnerAppId",
      "publisherName",
      "homepageUrl",
      "redirectUris",
      "trusted",
    ].sort());
  });

  it("rejects partner-owned lifecycle metadata in Anan app sync payloads", () => {
    expect(() =>
      partnerAppRegistrationSyncSchema.parse({
        contract: "partner.app_registration_sync.v1",
        idempotencyKey: "sync-123456",
        partnerAppId: "app_123",
        clientId: "partners_client_123",
        name: "Valuation App",
        publisherName: "Partner Studio",
        clientType: "confidential",
        redirectUris: ["https://partner.example/callback"],
        allowedScopes: ["workspace:read"],
        trusted: true,
        isActive: true,
        status: "pending_review",
        reviewNotes: "Partners-only review data",
        occurredAt: 1_776_000_000_000,
      }),
    ).toThrow();
  });

  it("rejects unknown authorization states before they reach Anan", () => {
    expect(() =>
      workspaceAuthorizationStatusSchema.parse({
        contract: "workspace.authorization_status.v1",
        workspaceId: "ws_123",
        clientId: "partners_client_123",
        status: "maybe",
        grantedScopes: [],
      }),
    ).toThrow();
  });

  it("builds service-authenticated integration headers", () => {
    expect(buildIntegrationHeaders({ serviceToken: "secret", idempotencyKey: "event-123456" })).toEqual({
      authorization: "Bearer secret",
      "content-type": "application/json",
      "x-anan-source": "partners",
      "idempotency-key": "event-123456",
    });
  });
});
