import { describe, expect, it, vi } from "vitest";
import {
  createPartnerConnectionGrant,
  fetchPartnerCatalogApps,
  fetchPartnerConnections,
  partnerCatalogFilters,
  revokePartnerConnection,
  updatePartnerConnectionStatus,
} from "./integrations-runtime";
import type { PartnerCatalogApp, PartnerConnection } from "./store/integrations.types";

const app: PartnerCatalogApp = {
  id: "partners_app_1",
  partnersClientId: "partners_client_1",
  name: "Partner CRM",
  publisherName: "Partner Co",
  description: "CRM integration",
  homepageUrl: "https://partner.example.com",
  allowedScopes: ["client:read"],
  redirectUris: ["https://partner.example.com/callback"],
  status: "approved",
  updatedAt: 1,
};

const connection: PartnerConnection = {
  id: "connection_1",
  organizationId: "org 1",
  partnersAppId: "partners_app_1",
  partnersClientId: "partners_client_1",
  status: "active",
  scopes: ["client:read"],
  updatedAt: 2,
  partnerApp: app,
};

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

describe("integrations runtime", () => {
  it("owns catalog and connection list route calls", async () => {
    const fetcher = vi.fn(async (url: string) => {
      if (url === "/api/v1/integrations/partner-apps") {
        return jsonResponse({ apps: [app] });
      }
      return jsonResponse({ connections: [connection] });
    }) as unknown as typeof fetch;

    await expect(fetchPartnerCatalogApps(fetcher)).resolves.toEqual([app]);
    await expect(fetchPartnerConnections("org 1", fetcher)).resolves.toEqual([connection]);

    expect(fetcher).toHaveBeenCalledWith("/api/v1/integrations/partner-apps");
    expect(fetcher).toHaveBeenCalledWith("/api/v1/organizations/org%201/partner-connections");
  });

  it("keeps empty payload fallback and shared catalog filters", async () => {
    const fetcher = vi.fn(async () => jsonResponse({})) as unknown as typeof fetch;

    await expect(fetchPartnerCatalogApps(fetcher)).resolves.toEqual([]);
    await expect(fetchPartnerConnections("org_1", fetcher)).resolves.toEqual([]);
    expect(partnerCatalogFilters).toEqual(["all", "connected", "available"]);
  });

  it("patches and revokes partner connections through encoded organization routes", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ ok: true })) as unknown as typeof fetch;

    await updatePartnerConnectionStatus("org 1", "connection/1", "paused", fetcher);
    await revokePartnerConnection("org 1", "connection/1", fetcher);

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "/api/v1/organizations/org%201/partner-connections/connection%2F1",
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      },
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      "/api/v1/organizations/org%201/partner-connections/connection%2F1",
      { method: "DELETE" },
    );
  });

  it("creates partner connection grants with requested resource scopes", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ ok: true })) as unknown as typeof fetch;

    await createPartnerConnectionGrant(
      "org 1",
      {
        partnersAppId: "partners_app_1",
        partnersClientId: "partners_client_1",
        scopes: ["client:read"],
      },
      fetcher,
    );

    expect(fetcher).toHaveBeenCalledWith(
      "/api/v1/organizations/org%201/partner-connections",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partnersAppId: "partners_app_1",
          partnersClientId: "partners_client_1",
          scopes: ["client:read"],
        }),
      },
    );
  });

  it("preserves current error messages for catalog reads and organization action errors", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ error: "nope" }, { status: 500 })) as unknown as typeof fetch;

    await expect(fetchPartnerCatalogApps(fetcher)).rejects.toThrow("Partner apps could not be loaded.");
    await expect(fetchPartnerConnections("org_1", fetcher)).rejects.toThrow("Partner connections could not be loaded.");
    await expect(updatePartnerConnectionStatus("org_1", "connection_1", "active", fetcher)).rejects.toThrow("nope");
    await expect(revokePartnerConnection("org_1", "connection_1", fetcher)).rejects.toThrow("nope");
  });
});
