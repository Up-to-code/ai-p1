import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AnanAuthorizationError,
  buildAuthorizeUrl,
  createAnanAuthorizationClient,
  createPkcePair,
  exchangeCode,
  refreshToken,
  revokeToken,
} from "./index";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

function stubWindow(args: {
  open: () => unknown;
  onMessageListener?: (listener: (event: MessageEvent) => void) => void;
}) {
  const locationAssign = vi.fn();
  const removeEventListener = vi.fn();
  const addEventListener = vi.fn((type: string, listener: (event: MessageEvent) => void) => {
    if (type === "message") {
      args.onMessageListener?.(listener);
    }
  });
  vi.stubGlobal("window", {
    screenX: 0,
    screenY: 0,
    outerWidth: 1200,
    outerHeight: 800,
    open: vi.fn(args.open),
    addEventListener,
    removeEventListener,
    location: {
      assign: locationAssign,
    },
  });
  return { addEventListener, locationAssign, removeEventListener };
}

describe("@anan/authorization", () => {
  it("generates PKCE material", async () => {
    const pair = await createPkcePair();

    expect(pair.method).toBe("S256");
    expect(pair.verifier).toHaveLength(64);
    expect(pair.challenge).toMatch(/^[A-Za-z0-9_-]+$/u);
  });

  it("builds an authorization URL with PKCE and scopes", () => {
    const url = new URL(buildAuthorizeUrl({
      issuer: "https://auth.anan.test/",
      clientId: "client-1",
      redirectUri: "https://external.test/callback",
      scopes: ["clients:read_own", "offline_access"],
      state: "state-1",
      codeChallenge: "challenge-1",
      sourceApp: "web",
    }));

    expect(url.origin).toBe("https://auth.anan.test");
    expect(url.pathname).toBe("/authorize");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("scope")).toBe("clients:read_own offline_access");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("app")).toBe("web");
  });

  it("resolves popup authorization results from the configured issuer origin", async () => {
    const popup = { closed: false, close: vi.fn() };
    stubWindow({
      open: () => popup,
      onMessageListener: (listener) => {
        queueMicrotask(() => listener({
          origin: "https://auth.anan.test",
          data: {
            type: "anan.authorization.result",
            code: "code-1",
            state: "state-1",
            redirectUri: "https://external.test/callback",
          },
        } as MessageEvent));
      },
    });

    const client = createAnanAuthorizationClient({
      issuer: "https://auth.anan.test",
      clientId: "client-1",
      redirectUri: "https://external.test/callback",
      scopes: ["clients:read_own"],
    });
    const result = await client.authorize({ state: "state-1" });

    expect(result.code).toBe("code-1");
    expect(result.codeVerifier).toHaveLength(64);
    expect(popup.close).toHaveBeenCalled();
  });

  it("rejects denied popup authorization results", async () => {
    const popup = { closed: false, close: vi.fn() };
    stubWindow({
      open: () => popup,
      onMessageListener: (listener) => {
        queueMicrotask(() => listener({
          origin: "https://auth.anan.test",
          data: {
            type: "anan.authorization.result",
            error: "access_denied",
            error_description: "Denied",
          },
        } as MessageEvent));
      },
    });

    const client = createAnanAuthorizationClient({
      issuer: "https://auth.anan.test",
      clientId: "client-1",
      redirectUri: "https://external.test/callback",
      scopes: ["clients:read_own"],
    });

    await expect(client.authorize({ state: "state-1" })).rejects.toMatchObject({ code: "access_denied" });
  });

  it("rejects when popup closes before authorization completes", async () => {
    const popup = { closed: false, close: vi.fn() };
    stubWindow({ open: () => popup });
    const client = createAnanAuthorizationClient({
      issuer: "https://auth.anan.test",
      clientId: "client-1",
      redirectUri: "https://external.test/callback",
      scopes: ["clients:read_own"],
    });

    const promise = client.authorize({ state: "state-1", popup: { timeoutMs: 2_000 } });
    await new Promise((resolve) => setTimeout(resolve, 0));
    popup.closed = true;

    await expect(promise).rejects.toMatchObject({ code: "access_denied" });
  });

  it("falls back to redirect when popup is blocked", async () => {
    const { locationAssign } = stubWindow({ open: () => null });
    const client = createAnanAuthorizationClient({
      issuer: "https://auth.anan.test",
      clientId: "client-1",
      redirectUri: "https://external.test/callback",
      scopes: ["clients:read_own"],
    });

    await expect(client.authorize({ state: "state-1" })).rejects.toBeInstanceOf(AnanAuthorizationError);
    expect(locationAssign).toHaveBeenCalledWith(expect.stringContaining("client_id=client-1"));
  });

  it("rejects invalid origin or invalid state messages", async () => {
    const popup = { closed: false, close: vi.fn() };
    stubWindow({
      open: () => popup,
      onMessageListener: (listener) => {
        listener({
          origin: "https://evil.example",
          data: {
            type: "anan.authorization.result",
            code: "code-1",
            state: "state-1",
            redirectUri: "https://external.test/callback",
          },
        } as MessageEvent);
      },
    });
    const client = createAnanAuthorizationClient({
      issuer: "https://auth.anan.test",
      clientId: "client-1",
      redirectUri: "https://external.test/callback",
      scopes: ["clients:read_own"],
    });

    const ignoredOrigin = client.authorize({ state: "state-1", popup: { timeoutMs: 10 } });
    await expect(ignoredOrigin).rejects.toMatchObject({ code: "popup_blocked" });

    stubWindow({
      open: () => popup,
      onMessageListener: (listener) => {
        listener({
          origin: "https://auth.anan.test",
          data: {
            type: "anan.authorization.result",
            code: "code-1",
            state: "wrong-state",
            redirectUri: "https://external.test/callback",
          },
        } as MessageEvent);
      },
    });
    await expect(client.authorize({ state: "state-1" })).rejects.toMatchObject({ code: "invalid_state" });
  });

  it("posts authorization code exchanges without exposing browser-only secrets", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      access_token: "access",
      token_type: "Bearer",
      expires_in: 900,
      scope: "clients:read_own",
    })));
    vi.stubGlobal("fetch", fetchMock);

    const token = await exchangeCode({
      issuer: "https://auth.anan.test",
      clientId: "client-1",
      code: "code-1",
      redirectUri: "https://external.test/callback",
      codeVerifier: "verifier-1",
    });

    expect(token.accessToken).toBe("access");
    const requestBody = fetchMock.mock.calls[0]?.[1]?.body as URLSearchParams;
    expect(requestBody.get("client_id")).toBe("client-1");
    expect(requestBody.get("code_verifier")).toBe("verifier-1");
  });

  it("uses basic auth for confidential refresh and revoke helpers", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      access_token: "access",
      token_type: "Bearer",
      expires_in: 900,
      scope: "offline_access",
      refresh_token: "next",
    })));
    vi.stubGlobal("fetch", fetchMock);

    await refreshToken({
      issuer: "https://auth.anan.test",
      clientId: "client-1",
      clientSecret: "secret-1",
      refreshToken: "refresh-1",
    });
    await revokeToken({
      issuer: "https://auth.anan.test",
      clientId: "client-1",
      clientSecret: "secret-1",
      token: "refresh-1",
    });

    expect((fetchMock.mock.calls[0]?.[1]?.headers as Headers).get("Authorization")).toMatch(/^Basic /);
    expect((fetchMock.mock.calls[1]?.[1]?.headers as Headers).get("Authorization")).toMatch(/^Basic /);
  });
});
