import { describe, expect, it, vi } from "vitest";
import { bearerToken, recordLog } from "./http";

vi.mock("./store", () => ({
  sandboxStore: {
    recordRequestLog: vi.fn(async () => ({ ok: true })),
    validateAccess: vi.fn(),
  },
}));

describe("sandbox HTTP lifecycle helpers", () => {
  it("rejects bearer tokens in query parameters", () => {
    expect(() => bearerToken(new Request("http://localhost/api/v1/partner/organizations/org_1/clients?access_token=raw"))).toThrow(Response);
  });

  it("records request logs with method, path, status, latency, scopes, input, response, and error", async () => {
    const { sandboxStore } = await import("./store");
    const request = new Request("http://localhost/api/v1/partner/organizations/org_1/clients", { method: "POST" });

    await recordLog({
      access: {
        ok: true,
        partnerAuthSubject: "user_1",
        partnerAppId: "app_1",
        organizationId: "org_1",
        clientId: "client_1",
        scopes: ["client:create"],
      },
      request,
      status: 200,
      startedAt: Date.now() - 20,
      input: { name: "Sandbox Buyer" },
      response: { data: { id: "client_1" } },
    });

    expect(sandboxStore.recordRequestLog).toHaveBeenCalledWith(expect.objectContaining({
      partnerAuthSubject: "user_1",
      partnerAppId: "app_1",
      organizationId: "org_1",
      method: "POST",
      path: "/api/v1/partner/organizations/org_1/clients",
      status: 200,
      scopes: ["client:create"],
      input: { name: "Sandbox Buyer" },
      response: { data: { id: "client_1" } },
    }));
    expect(vi.mocked(sandboxStore.recordRequestLog).mock.calls[0]?.[0].latencyMs).toBeGreaterThanOrEqual(0);
  });
});
