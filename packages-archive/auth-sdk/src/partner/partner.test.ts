import { describe, expect, it, vi } from "vitest";
import { mountQentrahAuthorizeButton } from "./browser";
import { createQentrahPartnerAuthHandlers } from "./next";
import type { QentrahPartnerPendingAuthorization } from "./types";
import { createQentrahServiceAppClient } from "./service-app";
import { createQentrahWebhookHandler, verifyQentrahWebhook } from "./webhooks";
import { qentrahPartnerAuthorityFromEnv } from "./core";
import {
  buildQentrahPartnerOAuthLifecycle,
  buildQentrahPartnerResourceSearchParams,
  createQentrahPartnerConsoleService,
  qentrahMissingScopes,
  qentrahPartnerRenderRows,
  qentrahPartnerSectionIds,
  qentrahScopesNeedReauthorization,
  qentrahSectionCanRun,
  qentrahPartnerSections,
  runQentrahPartnerResourceOperation,
  sanitizeQentrahPartnerPayload,
} from "./harness";

const encoder = new TextEncoder();

function unsignedJwt(claims: Record<string, unknown>) {
  const encode = (value: unknown) => btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
  return `${encode({ alg: "none", typ: "JWT" })}.${encode(claims)}.`;
}

async function webhookSignature(secret: string, timestamp: number, body: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${body}`));
  return `v1=${Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function installButtonDom() {
  const listeners = new Map<string, EventListener>();
  const element = {
    textContent: "",
    disabled: false,
    attributes: new Map<string, string>(),
    setAttribute(name: string, value: string) {
      this.attributes.set(name, value);
    },
    addEventListener(name: string, listener: EventListener) {
      listeners.set(name, listener);
    },
    removeEventListener(name: string) {
      listeners.delete(name);
    },
  };
  const assign = vi.fn();
  vi.stubGlobal("HTMLButtonElement", Object);
  vi.stubGlobal("document", { getElementById: (id: string) => id === "qentrah-authorize" ? element : null });
  vi.stubGlobal("window", { location: { assign } });
  return { element, listeners, assign };
}

describe("@qentrah/auth-sdk partner browser", () => {
  it("mounts by id, sets labels, disables button, and redirects to the start URL", () => {
    const dom = installButtonDom();
    const mounted = mountQentrahAuthorizeButton({
      buttonId: "qentrah-authorize",
      startUrl: "/connect/qentrah",
      label: "Connect Qentrah",
      disabledLabel: "Opening...",
    });

    expect(mounted.mounted).toBe(true);
    expect(dom.element.textContent).toBe("Connect Qentrah");
    dom.listeners.get("click")?.({ preventDefault: vi.fn() } as unknown as Event);
    expect(dom.element.disabled).toBe(true);
    expect(dom.element.textContent).toBe("Opening...");
    expect(dom.assign).toHaveBeenCalledWith("/connect/qentrah");
  });

  it("reports missing button ids without throwing", () => {
    installButtonDom();
    const onError = vi.fn();
    const mounted = mountQentrahAuthorizeButton({ buttonId: "missing", onError });
    expect(mounted.mounted).toBe(false);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe("@qentrah/auth-sdk partner oauth handlers", () => {
  it("builds public partner authority config from environment variables", () => {
    expect(qentrahPartnerAuthorityFromEnv({
      QENTRAH_WORKSPACE_BASE_URL: "app.qentrah.com/",
      QENTRAH_PARTNER_CLIENT_ID: " partners_client_123 ",
      QENTRAH_PARTNER_REDIRECT_URI: "https://partner.example.com/api/qentrah/callback",
      QENTRAH_PARTNER_SCOPES: "organization:read,client:read",
    })).toMatchObject({
      workspaceBaseUrl: "https://app.qentrah.com",
      partnersClientId: "partners_client_123",
      scopes: ["organization:read", "client:read"],
    });
  });

  it("starts OAuth, stores pending authorization, and redirects to Qentrah authorize", async () => {
    let pending: QentrahPartnerPendingAuthorization | null = null;
    const handlers = createQentrahPartnerAuthHandlers({
      workspaceBaseUrl: "https://app.qentrah.com",
      clientId: "partners_client_123",
      redirectUri: "https://partner.example.com/api/qentrah/callback",
      scopes: ["organization:read"],
      sessionStore: {
        savePendingAuthorization: ({ pending: next }) => {
          pending = next;
        },
        loadPendingAuthorization: () => pending,
        clearPendingAuthorization: () => {
          pending = null;
        },
      },
      tokenStore: { saveTokens: vi.fn() },
    });

    const response = await handlers.start(new Request("https://partner.example.com/api/qentrah/start"));
    const location = response.headers.get("location");
    expect(response.status).toBe(302);
    expect(pending?.state).toBeTruthy();
    expect(location).toContain("https://app.qentrah.com/oauth/authorize");
    expect(location).toContain("resource=https%3A%2F%2Fapp.qentrah.com%2Fapi%2Fv1%2Fpartner");
  });

  it("exchanges callback codes, saves tokens, and clears pending state", async () => {
    let pending: QentrahPartnerPendingAuthorization | null = {
      state: "state_123",
      codeVerifier: "verifier",
      redirectUri: "https://partner.example.com/api/qentrah/callback",
      scopes: ["organization:read"],
      createdAtMs: Date.now(),
    };
    const saveTokens = vi.fn();
    const fetcher = vi.fn(async () => Response.json({
      access_token: "access-token",
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: "refresh-token",
    }));
    const handlers = createQentrahPartnerAuthHandlers({
      workspaceBaseUrl: "https://app.qentrah.com",
      clientId: "partners_client_123",
      redirectUri: "https://partner.example.com/api/qentrah/callback",
      scopes: ["organization:read"],
      sessionStore: {
        savePendingAuthorization: vi.fn(),
        loadPendingAuthorization: () => pending,
        clearPendingAuthorization: () => {
          pending = null;
        },
      },
      tokenStore: { saveTokens },
      afterSuccessRedirect: "/connected",
      fetcher,
    });

    const response = await handlers.callback(new Request("https://partner.example.com/api/qentrah/callback?code=code_123&state=state_123&organization_id=org_123"));
    expect(response.headers.get("location")).toBe("https://partner.example.com/connected");
    expect(saveTokens).toHaveBeenCalledWith(expect.objectContaining({ organizationId: "org_123" }));
    expect(pending).toBeNull();
    const [, init] = fetcher.mock.calls[0]!;
    expect(String(init?.body)).toContain("resource=https%3A%2F%2Fapp.qentrah.com%2Fapi%2Fv1%2Fpartner");
  });

  it("uses the access token organization claim when the callback query omits organization_id", async () => {
    let pending: QentrahPartnerPendingAuthorization | null = {
      state: "state_123",
      codeVerifier: "verifier",
      redirectUri: "https://partner.example.com/api/qentrah/callback",
      scopes: ["organization:read"],
      createdAtMs: Date.now(),
    };
    const saveTokens = vi.fn();
    const fetcher = vi.fn(async () => Response.json({
      access_token: unsignedJwt({ organization_id: "org_from_token" }),
      token_type: "Bearer",
      expires_in: 3600,
    }));
    const handlers = createQentrahPartnerAuthHandlers({
      workspaceBaseUrl: "https://app.qentrah.com",
      clientId: "partners_client_123",
      redirectUri: "https://partner.example.com/api/qentrah/callback",
      scopes: ["organization:read"],
      sessionStore: {
        savePendingAuthorization: vi.fn(),
        loadPendingAuthorization: () => pending,
        clearPendingAuthorization: () => {
          pending = null;
        },
      },
      tokenStore: { saveTokens },
      afterSuccessRedirect: "/connected",
      fetcher,
    });

    const response = await handlers.callback(new Request("https://partner.example.com/api/qentrah/callback?code=code_123&state=state_123"));
    expect(response.headers.get("location")).toBe("https://partner.example.com/connected");
    expect(saveTokens).toHaveBeenCalledWith(expect.objectContaining({ organizationId: "org_from_token" }));
    expect(pending).toBeNull();
  });

  it("redirects callback errors for invalid state and denied consent", async () => {
    const handlers = createQentrahPartnerAuthHandlers({
      workspaceBaseUrl: "https://app.qentrah.com",
      clientId: "partners_client_123",
      redirectUri: "https://partner.example.com/api/qentrah/callback",
      scopes: ["organization:read"],
      sessionStore: {
        savePendingAuthorization: vi.fn(),
        loadPendingAuthorization: () => null,
        clearPendingAuthorization: vi.fn(),
      },
      tokenStore: { saveTokens: vi.fn() },
      afterErrorRedirect: "/error",
    });

    const invalid = await handlers.callback(new Request("https://partner.example.com/api/qentrah/callback?code=code&state=bad&organization_id=org"));
    const denied = await handlers.callback(new Request("https://partner.example.com/api/qentrah/callback?error=access_denied"));
    expect(invalid.headers.get("location")).toContain("/error?qentrah_error=Qentrah+authorization+state+did+not+match.");
    expect(denied.headers.get("location")).toContain("/error?qentrah_error=Qentrah+authorization+was+denied.");
  });
});

describe("@qentrah/auth-sdk partner webhooks", () => {
  it("verifies signed webhooks and dispatches typed handlers", async () => {
    const body = JSON.stringify({ id: "evt_123", type: "client.created", organizationId: "org_123", createdAt: 1, data: { id: "client_123" } });
    const timestamp = Date.now();
    const signature = await webhookSignature("whsec_test", timestamp, body);
    const request = new Request("https://partner.example.com/api/qentrah/webhook", {
      method: "POST",
      headers: {
        "Qentrah-Signature": signature,
        "Qentrah-Timestamp": String(timestamp),
        "Qentrah-Event-Id": "evt_123",
        "Qentrah-Event-Type": "client.created",
        "Qentrah-Delivery-Id": "delivery_123",
      },
      body,
    });

    const event = await verifyQentrahWebhook(request.clone(), { signingSecret: "whsec_test" });
    expect(event.deliveryId).toBe("delivery_123");
    const handler = vi.fn();
    const response = await createQentrahWebhookHandler({
      signingSecret: "whsec_test",
      handlers: { "client.created": handler },
    })(request);
    expect(response.status).toBe(200);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: "client.created" }));
  });

  it("rejects stale timestamps, empty raw bodies, and bad signatures", async () => {
    const baseHeaders = {
      "Qentrah-Signature": "v1=bad",
      "Qentrah-Timestamp": String(Date.now() - 600_000),
      "Qentrah-Event-Id": "evt_123",
      "Qentrah-Event-Type": "client.created",
      "Qentrah-Delivery-Id": "delivery_123",
    };
    await expect(verifyQentrahWebhook(new Request("https://x.test", { method: "POST", headers: baseHeaders, body: "{}" }), { signingSecret: "whsec_test" })).rejects.toThrow(/timestamp/i);
    await expect(verifyQentrahWebhook(new Request("https://x.test", { method: "POST", headers: { ...baseHeaders, "Qentrah-Timestamp": String(Date.now()) } }), { signingSecret: "whsec_test" })).rejects.toThrow(/raw request body/i);
    await expect(verifyQentrahWebhook(new Request("https://x.test", { method: "POST", headers: { ...baseHeaders, "Qentrah-Timestamp": String(Date.now()) }, body: "{}" }), { signingSecret: "whsec_test" })).rejects.toThrow(/signature/i);
  });
});

describe("@qentrah/auth-sdk partner service app", () => {
  it("calls read, write, and inbound webhook APIs with auth and idempotency", async () => {
    const fetcher = vi.fn(async () => Response.json({ ok: true }));
    const client = createQentrahServiceAppClient({
      workspaceBaseUrl: "https://app.qentrah.com",
      accessToken: "access-token",
      fetcher,
    });

    await client.read({ organizationId: "org_123", resource: "client", input: { limit: 5 } });
    await client.write({ organizationId: "org_123", resource: "client", action: "create", input: { name: "Nora" }, idempotencyKey: "idem_123" });
    await client.sendWebhook({ organizationId: "org_123", eventType: "client.upsert", eventId: "evt_123", data: { externalId: "crm_1" }, idempotencyKey: "idem_456" });

    expect(String(fetcher.mock.calls[0]?.[0])).toBe("https://app.qentrah.com/api/v1/partner/organizations/org_123/resources/client/read");
    expect(fetcher.mock.calls[1]?.[1]?.headers).toMatchObject({ authorization: "Bearer access-token", "idempotency-key": "idem_123" });
    expect(String(fetcher.mock.calls[2]?.[0])).toBe("https://app.qentrah.com/api/v1/partner/organizations/org_123/webhooks/inbound");
  });

  it("calls REST-style partner resources and client mutations", async () => {
    const fetcher = vi.fn(async () => Response.json({ ok: true }));
    const client = createQentrahServiceAppClient({
      workspaceBaseUrl: "https://app.qentrah.com",
      accessToken: "access-token",
      fetcher,
    });

    await client.me({ organizationId: "org_123" });
    await client.listClients({ organizationId: "org_123", options: { limit: 10, search: "Nora", type: "Buyer", indexStart: 24, indexEnd: 27 } });
    await client.listMedia({ organizationId: "org_123", options: { limit: 25, resourceType: "client", resourceId: "client_1" } });
    await client.createClient({ organizationId: "org_123", input: { name: "Nora" } });
    await client.updateClient({ organizationId: "org_123", clientId: "client_1", input: { name: "Nora 2" } });
    await client.deleteClient({ organizationId: "org_123", clientId: "client_1" });

    expect(String(fetcher.mock.calls[0]?.[0])).toBe("https://app.qentrah.com/api/v1/partner/organizations/org_123/me");
    expect(String(fetcher.mock.calls[1]?.[0])).toBe("https://app.qentrah.com/api/v1/partner/organizations/org_123/clients?limit=10&search=Nora&type=Buyer&indexStart=24&indexEnd=27");
    expect(String(fetcher.mock.calls[2]?.[0])).toBe("https://app.qentrah.com/api/v1/partner/organizations/org_123/media?limit=25&resourceType=client&resourceId=client_1");
    expect(fetcher.mock.calls[3]?.[1]?.method).toBe("POST");
    expect(fetcher.mock.calls[4]?.[1]?.method).toBe("PATCH");
    expect(fetcher.mock.calls[5]?.[1]?.method).toBe("DELETE");
  });
});

describe("@qentrah/auth-sdk partner harness", () => {
  it("registers every headless console section", () => {
    expect(qentrahPartnerSectionIds).toEqual([
      "overview",
      "flow",
      "credentials",
      "organization",
      "clients",
      "assets",
      "projects",
      "tasks",
      "calendar",
      "media",
      "webhooks",
      "results",
    ]);
  });

  it("marks client delete unavailable without the delete scope", () => {
    const clients = qentrahPartnerSections.find((section) => section.id === "clients")!;
    expect(clients.operations).toEqual(["read", "create", "update", "delete"]);
    expect(qentrahSectionCanRun(clients, ["client:read", "client:create", "client:update"])).toBe(false);
    expect(qentrahMissingScopes(clients.requiredScopes, ["client:read", "client:create", "client:update"])).toEqual(["client:delete"]);
    expect(qentrahScopesNeedReauthorization(["client:read", "client:delete"], ["client:read"])).toBe(true);
  });

  it("redacts credential-looking values", () => {
    expect(sanitizeQentrahPartnerPayload({
      access_token: "raw-access",
      nested: { authorization: "Bearer abc123", name: "Demo" },
      text: "mcp_secret_supersecret",
    })).toEqual({
      access_token: "[redacted]",
      nested: { authorization: "[redacted]", name: "Demo" },
      text: "[redacted]",
    });
  });

  it("builds OAuth lifecycle metadata", () => {
    const lifecycle = buildQentrahPartnerOAuthLifecycle({
      workspaceBaseUrl: "https://app.qentrah.com",
      redirectUri: "https://partner.example.com/api/callback",
      requestedScopes: ["organization:read"],
    });
    expect(lifecycle.endpoints.authorize).toBe("https://app.qentrah.com/oauth/authorize");
    expect(lifecycle.endpoints.resource).toBe("https://app.qentrah.com/api/v1/partner");
    expect(lifecycle.phases).toHaveLength(5);
  });

  it("builds filter params and ready-to-render rows", () => {
    const params = buildQentrahPartnerResourceSearchParams("clients", {
      limit: 25,
      search: "Nora",
      type: "Buyer",
      indexStart: 2,
      indexEnd: 2,
    });
    expect(params.toString()).toBe("limit=25&search=Nora&type=Buyer&indexStart=2&indexEnd=2");
    expect(qentrahPartnerRenderRows({
      data: { data: [{ id: "client_1", name: "A" }, { id: "client_2", name: "B", access_token: "secret" }] },
      section: { label: "Clients" },
      indexStart: 2,
      indexEnd: 2,
    })).toEqual([{
      key: "client_2",
      title: "B",
      fields: [
        { key: "id", value: "client_2" },
        { key: "name", value: "B" },
        { key: "access_token", value: "[redacted]" },
      ],
    }]);
  });

  it("creates a configured console service after authorization setup", () => {
    const service = createQentrahPartnerConsoleService({
      workspaceBaseUrl: "https://app.qentrah.com",
      redirectUri: "https://partner.example.com/callback",
      requestedScopes: ["client:read", "client:delete"],
      grantedScopes: ["client:read"],
    });
    expect(service.missingScopes("clients")).toContain("client:delete");
    expect(service.needsReauthorization()).toBe(true);
    expect(service.lifecycle().endpoints.resource).toBe("https://app.qentrah.com/api/v1/partner");
  });

  it("normalizes missing session and successful resource operation results", async () => {
    await expect(runQentrahPartnerResourceOperation({
      workspaceBaseUrl: "https://app.qentrah.com",
      session: null,
      sectionId: "clients",
      path: "/api/qentrah/clients",
    })).resolves.toMatchObject({ ok: false, status: 401, error: "missing_bearer" });

    const fetcher = vi.fn(async () => Response.json({ data: [] }));
    await expect(runQentrahPartnerResourceOperation({
      workspaceBaseUrl: "https://app.qentrah.com",
      session: {
        access_token: "access-token",
        organizationId: "org_123",
        scope: "client:read client:create client:update client:delete",
      },
      sectionId: "clients",
      resource: "client",
      path: "/api/qentrah/clients",
      fetcher,
    })).resolves.toMatchObject({ ok: true, status: 200, responseSummary: "data" });
  });
});
