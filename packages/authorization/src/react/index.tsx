"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { createAnanAuthorizationClient } from "../client";
import type { AnanAuthorizationClientOptions, AnanAuthorizeCodeResult, AnanAuthorizeOptions } from "../types";

const AuthorizationContext = createContext<ReturnType<typeof createAnanAuthorizationClient> | null>(null);

export function AnanAuthorizationProvider({
  options,
  children,
}: {
  options: AnanAuthorizationClientOptions;
  children: ReactNode;
}) {
  const client = useMemo(() => createAnanAuthorizationClient(options), [options]);
  return <AuthorizationContext.Provider value={client}>{children}</AuthorizationContext.Provider>;
}

export function useAnanAuthorization() {
  const client = useContext(AuthorizationContext);
  if (!client) {
    throw new Error("useAnanAuthorization must be used inside AnanAuthorizationProvider");
  }
  return client;
}

export function AnanAuthorizeButton({
  children = "Connect with Anan",
  options,
  className,
  onSuccess,
  onError,
}: {
  children?: ReactNode;
  options?: AnanAuthorizeOptions;
  className?: string;
  onSuccess?: (result: AnanAuthorizeCodeResult) => void;
  onError?: (error: unknown) => void;
}) {
  const client = useAnanAuthorization();
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          const result = await client.authorize(options);
          onSuccess?.(result);
        } catch (error) {
          onError?.(error);
        } finally {
          setPending(false);
        }
      }}
    >
      {pending ? "Opening Anan..." : children}
    </button>
  );
}
