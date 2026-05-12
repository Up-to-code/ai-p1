import { AuthSdkError } from "../errors";
import { fetchJson } from "../internal/fetch";
import { createRefreshScheduler } from "./refresh-scheduler";
import { createMemoryTokenStore, type MemoryTokenSet, type MemoryTokenStore } from "./token-store";

export type AuthSdkSessionPayload<TContext = unknown> = {
  authenticated: boolean;
  context: TContext | null;
  accessToken?: string;
  expiresAtMs?: number | null;
  scopes?: string[];
  csrfToken?: string;
};

export type AuthBrowserClientOptions = {
  sessionUrl?: string;
  refreshUrl?: string;
  fetchTimeoutMs?: number;
  initialTokenSet?: MemoryTokenSet | null;
  initialCsrfToken?: string | null;
};

export function createAuthBrowserClient<TContext = unknown>(options: AuthBrowserClientOptions = {}) {
  const sessionUrl = options.sessionUrl ?? "/api/auth-sdk/session";
  const refreshUrl = options.refreshUrl ?? "/api/auth-sdk/refresh";
  const tokenStore = createMemoryTokenStore(options.initialTokenSet ?? null);
  let csrfToken = options.initialCsrfToken ?? null;
  let refreshPromise: Promise<AuthSdkSessionPayload<TContext>> | null = null;

  async function loadSession(): Promise<AuthSdkSessionPayload<TContext>> {
    const session = await fetchJson<AuthSdkSessionPayload<TContext>>(sessionUrl, {
      credentials: "include",
      timeoutMs: options.fetchTimeoutMs,
    });
    csrfToken = session.csrfToken ?? csrfToken;
    if (session.accessToken) {
      tokenStore.set({
        accessToken: session.accessToken,
        tokenType: "Bearer",
        expiresAtMs: session.expiresAtMs ?? null,
        scopes: session.scopes ?? [],
      });
    }
    return session;
  }

  async function refresh(): Promise<AuthSdkSessionPayload<TContext>> {
    if (refreshPromise) return refreshPromise;
    refreshPromise = fetchJson<AuthSdkSessionPayload<TContext>>(refreshUrl, {
      method: "POST",
      credentials: "include",
      timeoutMs: options.fetchTimeoutMs,
      headers: {
        "Content-Type": "application/json",
        ...(csrfToken ? { "x-anan-csrf": csrfToken } : {}),
      },
    })
      .then((session) => {
        csrfToken = session.csrfToken ?? csrfToken;
        if (session.accessToken) {
          tokenStore.set({
            accessToken: session.accessToken,
            tokenType: "Bearer",
            expiresAtMs: session.expiresAtMs ?? null,
            scopes: session.scopes ?? [],
          });
        } else if (!session.authenticated) {
          tokenStore.clear();
        }
        return session;
      })
      .catch((error) => {
        tokenStore.clear();
        throw new AuthSdkError("REFRESH_FAILED", error instanceof Error ? error.message : "Unable to refresh session", 401);
      })
      .finally(() => {
        refreshPromise = null;
      });
    return refreshPromise;
  }

  const scheduler = createRefreshScheduler({
    refresh,
    onError: () => tokenStore.clear(),
  });

  tokenStore.subscribe((tokenSet) => scheduler.schedule(tokenSet?.expiresAtMs));

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    });
  }

  return {
    getToken: () => tokenStore.get()?.accessToken ?? null,
    getTokenSet: tokenStore.get,
    loadSession,
    refresh,
    tokenStore: tokenStore as MemoryTokenStore,
    clear: tokenStore.clear,
  };
}
