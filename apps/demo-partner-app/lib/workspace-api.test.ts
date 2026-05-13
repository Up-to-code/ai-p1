import { describe, expect, it, vi, beforeEach } from "vitest";
import { WorkspaceApiError, createAnanClient, loadAnanClients, updateAnanClient } from "./workspace-api";
import type { TokenSession } from "./session";

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const session: TokenSession = {
  access_token: "access",
  token_type: "Bearer",
  expires_in: 3600,
  obtained_at: 1,
  organizationId: "org_123",
};

describe("Workspace Hono API wrappers", () => {
  beforeEach(() => {
    process.env.ANAN_WORKSPACE_API_URL = "http://localhost:3000";
    process.env.ANAN_CLIENT_ID = "partners_client_123";
    process.env.PARTNER_APP_URL = "http://localhost:3004";
    process.env.DEMO_ACCESS_TOKEN = "demo-token";
    process.env.SESSION_SECRET = "abcdefghijklmnopqrstuvwxyz123456";
  });

  it("loads clients through Workspace partner APIs, not Convex", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: [{ id: "client_1" }] }));

    await expect(loadAnanClients(session, fetcher)).resolves.toEqual({ data: [{ id: "client_1" }] });
    expect(String(fetcher.mock.calls[0][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/clients");
    expect(fetcher.mock.calls[0][1]?.headers).toMatchObject({ authorization: "Bearer access" });
  });

  it("sends safe client create payloads", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: { id: "client_2" } }));

    await createAnanClient(session, { name: "Demo Buyer" }, fetcher);

    expect(fetcher.mock.calls[0][1]?.method).toBe("POST");
    expect(fetcher.mock.calls[0][1]?.body).toBe(JSON.stringify({ name: "Demo Buyer" }));
  });

  it("sends safe client update payloads", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ data: { id: "client_2" } }));

    await updateAnanClient(session, "client_2", { name: "Updated" }, fetcher);

    expect(String(fetcher.mock.calls[0][0])).toBe("http://localhost:3000/api/v1/partner/organizations/org_123/clients/client_2");
    expect(fetcher.mock.calls[0][1]?.method).toBe("PATCH");
  });

  it("maps Workspace expired connection errors", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: "connection_expired",
      message: "Reconnect this organization.",
    }, 401));

    await expect(loadAnanClients(session, fetcher)).rejects.toMatchObject(
      new WorkspaceApiError("Reconnect this organization.", "connection_expired", 401),
    );
  });

  it("maps Workspace scope denied errors", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({
      error: "scope_denied",
      message: "Scope is missing.",
    }, 403));

    await expect(loadAnanClients(session, fetcher)).rejects.toMatchObject(
      new WorkspaceApiError("Scope is missing.", "scope_denied", 403),
    );
  });
});
