import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/session", () => ({
  clearTokenSession: vi.fn(),
  readTokenSession: vi.fn(),
}));

vi.mock("@/lib/workspace-api", () => ({
  deleteQentrahClient: vi.fn(async () => ({ data: { deleted: true } })),
  loadQentrahMedia: vi.fn(async () => ({ data: [] })),
  sendQentrahWebhook: vi.fn(async () => ({ ok: true })),
}));

describe("demo resource API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns missing_bearer without a demo session", async () => {
    const { readTokenSession } = await import("@/lib/session");
    const { GET } = await import("../app/api/qentrah/me/route");
    vi.mocked(readTokenSession).mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "missing_bearer" });
  });

  it("clears and rejects expired demo sessions before Workspace calls", async () => {
    const { clearTokenSession, readTokenSession } = await import("@/lib/session");
    const { GET } = await import("../app/api/qentrah/me/route");
    vi.mocked(readTokenSession).mockResolvedValue({
      access_token: "expired",
      token_type: "Bearer" as const,
      expires_in: 1,
      obtained_at: Date.now() - 10_000,
      organizationId: "org_1",
    });

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: "token_expired" });
    expect(clearTokenSession).toHaveBeenCalled();
  });

  it("forwards client delete through the stored session", async () => {
    const { readTokenSession } = await import("@/lib/session");
    const { deleteQentrahClient } = await import("@/lib/workspace-api");
    const { DELETE } = await import("../app/api/qentrah/clients/[clientId]/route");
    const session = {
      access_token: "access",
      token_type: "Bearer" as const,
      expires_in: 3600,
      obtained_at: Date.now(),
      organizationId: "org_1",
    };
    vi.mocked(readTokenSession).mockResolvedValue(session);

    const response = await DELETE(new Request("http://localhost/api/qentrah/clients/client_1") as never, {
      params: Promise.resolve({ clientId: "client_1" }),
    });

    expect(response.status).toBe(200);
    expect(deleteQentrahClient).toHaveBeenCalledWith(session, "client_1");
  });

  it("requires media resource filters", async () => {
    const { readTokenSession } = await import("@/lib/session");
    const { GET } = await import("../app/api/qentrah/media/route");
    vi.mocked(readTokenSession).mockResolvedValue({
      access_token: "access",
      token_type: "Bearer" as const,
      expires_in: 3600,
      obtained_at: Date.now(),
      organizationId: "org_1",
    });

    const response = await GET(new Request("http://localhost/api/qentrah/media") as never);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "media_filter_required" });
  });

  it("forwards webhook lifecycle events through the stored session", async () => {
    const { readTokenSession } = await import("@/lib/session");
    const { sendQentrahWebhook } = await import("@/lib/workspace-api");
    const { POST } = await import("../app/api/qentrah/webhooks/route");
    const session = {
      access_token: "access",
      token_type: "Bearer" as const,
      expires_in: 3600,
      obtained_at: Date.now(),
      organizationId: "org_1",
    };
    vi.mocked(readTokenSession).mockResolvedValue(session);
    const body = { eventType: "client.created", eventId: "evt_1", data: { id: "client_1" } };

    const response = await POST(new Request("http://localhost/api/qentrah/webhooks", {
      method: "POST",
      body: JSON.stringify(body),
    }) as never);

    expect(response.status).toBe(200);
    expect(sendQentrahWebhook).toHaveBeenCalledWith(session, body);
  });
});
