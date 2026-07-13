import { describe, expect, it, vi } from "vitest";

import { createAuthHttpClient, AuthHttpRequestError } from "./auth-http-client.js";

describe("auth HTTP client", () => {
  it("centralizes query, JSON, credentials, and no-store request policy", async () => {
    const fetchImplementation = vi.fn(async () => Response.json({ id: "member_1" }));
    const client = createAuthHttpClient({
      baseUrl: "https://app.example.test/api/auth/",
      credentialProvider: () => ({ kind: "session", token: "secret", cookieName: "better-auth.session_token", cookie: "better-auth.session_token=secret" }),
      fetch: fetchImplementation,
    });

    const result = await client.request("/organization/update-member", {
      query: { organizationId: "org_1", includeDeleted: false, omitted: undefined },
      body: { role: "admin" },
      parse(value) {
        if (!value || typeof value !== "object" || !("id" in value) || typeof value.id !== "string") {
          throw new Error("Invalid member response");
        }
        return { id: value.id };
      },
    });

    expect(result).toEqual({ id: "member_1" });
    expect(fetchImplementation).toHaveBeenCalledOnce();
    const [url, init] = fetchImplementation.mock.calls[0]!;
    expect(String(url)).toBe("https://app.example.test/api/auth/organization/update-member?organizationId=org_1&includeDeleted=false");
    expect(init?.method).toBe("POST");
    expect(new Headers(init?.headers).get("cookie")).toBe("better-auth.session_token=secret");
    expect(new Headers(init?.headers).get("content-type")).toBe("application/json");
    expect(init?.body).toBe(JSON.stringify({ role: "admin" }));
    expect(init?.cache).toBe("no-store");
  });

  it("normalizes structured failures without exposing response bodies or credentials", async () => {
    const client = createAuthHttpClient({
      baseUrl: "https://app.example.test/api/auth",
      credentialProvider: () => ({ kind: "bearer", token: "never-log-this" }),
      fetch: async () => Response.json({ message: "Session expired", secret: "never-log-this" }, { status: 401 }),
    });

    const error = await client.request("get-session").catch((reason: unknown) => reason);
    expect(error).toEqual(expect.objectContaining<Partial<AuthHttpRequestError>>({
      name: "AuthHttpRequestError",
      message: "Session expired",
      status: 401,
      code: "AUTH_HTTP_ERROR",
    }));
    expect(String(error)).not.toContain("never-log-this");
  });

  it("extracts a safe structured error when an auth proxy omits content-type", async () => {
    const client = createAuthHttpClient({
      baseUrl: "https://app.example.test/api/auth",
      fetch: async () => new Response(JSON.stringify({ message: "Session expired" }), { status: 401 }),
    });

    await expect(client.request("get-session")).rejects.toEqual(expect.objectContaining({
      message: "Session expired",
      status: 401,
    }));
  });

  it("reports invalid JSON as a stable typed error", async () => {
    const client = createAuthHttpClient({
      baseUrl: "https://app.example.test/api/auth",
      fetch: async () => new Response("not-json", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    });

    await expect(client.request("get-session")).rejects.toEqual(expect.objectContaining({
      code: "AUTH_INVALID_RESPONSE",
      status: 200,
    }));
  });

  it("reports timeouts without leaking request data", async () => {
    const client = createAuthHttpClient({
      baseUrl: "https://app.example.test/api/auth",
      timeoutMs: 5,
      fetch: (_input, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      }),
    });

    await expect(client.request("get-session")).rejects.toEqual(expect.objectContaining({
      code: "AUTH_REQUEST_TIMEOUT",
      status: 408,
    }));
  });

  it("rejects absolute request paths to keep calls on the configured auth origin", async () => {
    const client = createAuthHttpClient({
      baseUrl: "https://app.example.test/api/auth",
      fetch: vi.fn(),
    });

    await expect(client.request("https://evil.example/get-session")).rejects.toThrow(/relative/u);
  });
});
