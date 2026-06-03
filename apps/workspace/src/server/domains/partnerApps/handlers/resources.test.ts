import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "@convex/_generated/dataModel";
import {
  handlePartnerInboundWebhook,
} from "./resources";
import {
  requirePartnerResourceAccess,
} from "../services/partner-resource-access";
import {
  acceptInboundWebhook,
} from "../services/resources";

vi.mock("../services/partner-resource-access", async (importOriginal) => ({
  ...await importOriginal<typeof import("../services/partner-resource-access")>(),
  requirePartnerResourceAccess: vi.fn(),
}));

vi.mock("../services/resources", () => ({
  acceptInboundWebhook: vi.fn(),
}));

const requirePartnerResourceAccessMock = vi.mocked(requirePartnerResourceAccess);
const acceptInboundWebhookMock = vi.mocked(acceptInboundWebhook);

function appForWebhookTests() {
  const app = new Hono();
  app.post("/organizations/:organizationId/webhooks/inbound", handlePartnerInboundWebhook);
  return app;
}

const webhookPayload = {
  eventId: "evt_1",
  eventType: "client.created",
  occurredAt: 1780419000,
  data: { clientId: "client_1" },
};

describe("partner resource handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts inbound webhooks from validated WorkOS partner app keys", async () => {
    requirePartnerResourceAccessMock.mockResolvedValueOnce({
      type: "workosPartnerApiKey",
      token: "sk_live_secret",
      organizationId: "org_1",
      partnerId: "partner_1",
      partnerClientId: "partners_client_1",
      partnersAppId: "partners_app_1",
      partnersClientId: "partners_client_1",
      connectionId: "connection_1" as Id<"organizationPartnerConnections">,
      apiKeyId: "workos_key_1" as Id<"workosPartnerApiKeys">,
      workosApiKeyId: "api_key_1",
      workosOwnerOrganizationId: "org_workos_1",
      name: "CRM bridge",
      scopes: ["client:create"],
    });
    acceptInboundWebhookMock.mockResolvedValueOnce({ accepted: true });

    const response = await appForWebhookTests().request("/organizations/org_1/webhooks/inbound", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": "idem_1",
      },
      body: JSON.stringify(webhookPayload),
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ result: { accepted: true } });
    expect(requirePartnerResourceAccessMock).toHaveBeenCalledWith(expect.anything(), "client", "create");
    expect(acceptInboundWebhookMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "partnerApp",
        partnerAppId: "partners_app_1",
      }),
      {
        ...webhookPayload,
        idempotencyKey: "idem_1",
      },
    );
  });

  it("rejects inbound webhooks from organization API keys", async () => {
    requirePartnerResourceAccessMock.mockResolvedValueOnce({
      type: "apiKey",
      token: "qentrah_org_secret",
      organizationId: "org_1",
      apiKeyId: "api_key_1" as Id<"organizationApiKeys">,
      keyId: "component_key_1",
      name: "Workspace key",
      scopes: ["client:create"],
    });

    const response = await appForWebhookTests().request("/organizations/org_1/webhooks/inbound", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "Organization API keys cannot call inbound webhook endpoints.",
    });
    expect(acceptInboundWebhookMock).not.toHaveBeenCalled();
  });
});
