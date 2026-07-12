"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { brandLabel } from "@qentrah/brand-identity";
import { createQentrahAuthorizationClient } from "../authorization/client.js";
import type { QentrahAuthorizationClientOptions, QentrahAuthorizeCodeResult, QentrahAuthorizeOptions } from "../authorization/types.js";

const AuthorizationContext = createContext<ReturnType<typeof createQentrahAuthorizationClient> | null>(null);

export function QentrahAuthorizationProvider({
  options,
  children,
}: {
  options: QentrahAuthorizationClientOptions;
  children: ReactNode;
}) {
  const client = useMemo(() => createQentrahAuthorizationClient(options), [options]);
  return <AuthorizationContext.Provider value={client}>{children}</AuthorizationContext.Provider>;
}

export function useQentrahAuthorization() {
  const client = useContext(AuthorizationContext);
  if (!client) {
    throw new Error("useQentrahAuthorization must be used inside QentrahAuthorizationProvider");
  }
  return client;
}

export function QentrahAuthorizeButton({
  children = `Connect with ${brandLabel("en")}`,
  options,
  className,
  onSuccess,
  onError,
}: {
  children?: ReactNode;
  options?: QentrahAuthorizeOptions;
  className?: string;
  onSuccess?: (result: QentrahAuthorizeCodeResult) => void;
  onError?: (error: unknown) => void;
}) {
  const client = useQentrahAuthorization();
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
      {pending ? `Opening ${brandLabel("en")}...` : children}
    </button>
  );
}
