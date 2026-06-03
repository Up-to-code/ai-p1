import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  WorkspaceApiError,
  createQentrahClient,
  deleteQentrahClient,
  loadQentrahCalendar,
  loadQentrahClients,
  loadQentrahMedia,
  loadQentrahProjects,
  loadQentrahProperties,
  loadQentrahTasks,
  sendQentrahWebhook,
  updateQentrahClient,
} from "./workspace-api";
import type { TokenSession } from "./session";

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const session: TokenSession = {
  accessToken: "workos_partner_key",
  tokenType: "WorkOSPartnerApiKey",
  obtainedAt: 1,
  organizationId: "org_123",
};

describe("Workspace Hono API wrappers", () => {
  beforeEach(() => {
    process.env.QENTRAH_WORKSPACE_API_URL = "http://localhost:3000";
    process.env.QENTRAH_CLIENT_ID = "partners_client_123";
    process.env.PARTNER_APP_URL = "http://localhost:3004";
    process.env.DEMO_ACCESS_TOKEN = "demo-token";
    process.env.SESSION_SECRET = "abcdefghijklmnopqrstuvwxyz123456";
  });

  it("loads clients through Workspace partner APIs, not Convex", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: [{ id: "client_1" }] }));

    await expect(loadQentrahClients(session, { limit: 10, search: "Nora", type: "Buyer", indexStart: 24, indexEnd: 27 }, fetcher)).resolves.toEqual({ data: [{ id: "client_1" }] });
    expect(String(fetcher.mock.calls[0][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/clients?limit=10&search=Nora&type=Buyer&indexStart=24&indexEnd=27");
    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ authorization: "Bearer workos_partner_key" });
  });

  it("builds read URLs for every resource section", async () => {
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => jsonResponse({ data: [] }));

    await loadQentrahProperties(session, { limit: 25 }, fetcher);
    await loadQentrahProjects(session, { limit: 25 }, fetcher);
    await loadQentrahTasks(session, { limit: 25 }, fetcher);
    await loadQentrahCalendar(session, { limit: 25 }, fetcher);
    await loadQentrahMedia(session, { limit: 25, resourceType: "client", resourceId: "client_1" }, fetcher);

    expect(String(fetcher.mock.calls[0][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/properties?limit=25");
    expect(String(fetcher.mock.calls[1][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/projects?limit=25");
    expect(String(fetcher.mock.calls[2][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/tasks?limit=25");
    expect(String(fetcher.mock.calls[3][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/calendar?limit=25");
    expect(String(fetcher.mock.calls[4][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/media?limit=25&resourceType=client&resourceId=client_1");
  });

  it("sends safe client create payloads", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: { id: "client_2" } }));

    await createQentrahClient(session, { name: "Demo Buyer" }, fetcher);

    expect(fetcher.mock.calls[0][1]?.method).toBe("POST");
    expect(fetcher.mock.calls[0][1]?.body).toBe(JSON.stringify({ name: "Demo Buyer" }));
  });

  it("sends safe client update payloads", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: { id: "client_2" } }));

    await updateQentrahClient(session, "client_2", { name: "Updated" }, fetcher);

    expect(String(fetcher.mock.calls[0][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/clients/client_2");
    expect(fetcher.mock.calls[0][1]?.method).toBe("PATCH");
  });

  it("sends safe client delete requests", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: { deleted: true } }));

    await deleteQentrahClient(session, "client_2", fetcher);

    expect(String(fetcher.mock.calls[0][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/clients/client_2");
    expect(fetcher.mock.calls[0][1]?.method).toBe("DELETE");
  });

  it("sends client lifecycle webhooks", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ ok: true }));

    await sendQentrahWebhook(session, {
      eventType: "client.created",
      eventId: "evt_1",
      data: { id: "client_1" },
      idempotencyKey: "evt_1",
    }, fetcher);

    expect(String(fetcher.mock.calls[0][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/webhooks/inbound");
    expect(fetcher.mock.calls[0][1]?.method).toBe("POST");
    expect(String(fetcher.mock.calls[0][1]?.body)).toContain("client.created");
  });

  it("maps Workspace expired connection errors", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: "connection_expired",
      message: "Reconnect this organization.",
    }, 401));

    await expect(loadQentrahClients(session, fetcher)).rejects.toMatchObject(
      new WorkspaceApiError("Reconnect this organization.", "connection_expired", 401),
    );
  });

  it("maps Workspace scope denied errors", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: "scope_denied",
      message: "Scope is missing.",
    }, 403));

    await expect(loadQentrahClients(session, fetcher)).rejects.toMatchObject(
      new WorkspaceApiError("Scope is missing.", "scope_denied", 403),
    );
  });
});
