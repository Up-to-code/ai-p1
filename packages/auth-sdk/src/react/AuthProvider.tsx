"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthContext } from "@anan/auth/server";
import {
  createAuthBrowserClient,
  type AuthSdkSessionPayload,
  type AuthBrowserClientOptions,
} from "../client";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "error";

export type AuthProviderState = {
  status: AuthStatus;
  context: AuthContext | null;
  accessToken: string | null;
  error: Error | null;
  refresh: () => Promise<void>;
  signOut: (redirectTo?: string) => void;
};

const AuthContextValue = createContext<AuthProviderState | null>(null);
const DEFAULT_AUTH_PROVIDER_VALUE: AuthProviderState = {
  status: "unauthenticated",
  context: null,
  accessToken: null,
  error: null,
  refresh: async () => undefined,
  signOut: (redirectTo = "/signin") => {
    if (typeof window !== "undefined") {
      window.location.assign(redirectTo);
    }
  },
};

export function AuthProvider({
  children,
  initialSession,
  clientOptions,
}: {
  children: ReactNode;
  initialSession?: AuthSdkSessionPayload<AuthContext> | null;
  clientOptions?: AuthBrowserClientOptions;
}) {
  const clientRef = useRef(createAuthBrowserClient<AuthContext>({
    ...clientOptions,
    initialCsrfToken: initialSession?.csrfToken ?? clientOptions?.initialCsrfToken ?? null,
    initialTokenSet: initialSession?.accessToken
      ? {
          accessToken: initialSession.accessToken,
          tokenType: "Bearer",
          expiresAtMs: initialSession.expiresAtMs ?? null,
          scopes: initialSession.scopes ?? [],
        }
      : clientOptions?.initialTokenSet ?? null,
  }));
  const [status, setStatus] = useState<AuthStatus>(
    initialSession?.authenticated ? "authenticated" : initialSession ? "unauthenticated" : "loading",
  );
  const [context, setContext] = useState<AuthContext | null>(initialSession?.context ?? null);
  const [accessToken, setAccessToken] = useState<string | null>(initialSession?.accessToken ?? null);
  const [error, setError] = useState<Error | null>(null);

  const applySession = useCallback((session: AuthSdkSessionPayload<AuthContext>) => {
    setContext(session.context);
    setAccessToken(session.accessToken ?? null);
    setStatus(session.authenticated ? "authenticated" : "unauthenticated");
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      applySession(await clientRef.current.refresh());
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught : new Error("Authentication refresh failed"));
    }
  }, [applySession]);

  useEffect(() => {
    if (initialSession?.csrfToken) return;
    let cancelled = false;
    clientRef.current.loadSession()
      .then((session) => {
        if (!cancelled) applySession(session);
      })
      .catch((caught) => {
        if (!cancelled) {
          setStatus("error");
          setError(caught instanceof Error ? caught : new Error("Unable to load session"));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [applySession, initialSession]);

  const value = useMemo<AuthProviderState>(() => ({
    status,
    context,
    accessToken,
    error,
    refresh,
    signOut(redirectTo = "/signin") {
      clientRef.current.clear();
      window.location.assign(redirectTo);
    },
  }), [accessToken, context, error, refresh, status]);

  return <AuthContextValue.Provider value={value}>{children}</AuthContextValue.Provider>;
}

export function useAuthProviderValue(): AuthProviderState {
  const value = useContext(AuthContextValue);
  return value ?? DEFAULT_AUTH_PROVIDER_VALUE;
}
