"use client";

import { createContext, useContext, type ReactElement, type ReactNode } from "react";
import type { AuthContext } from "../types";

export type AuthProviderValue = {
  context: AuthContext | null;
  token?: string | null;
};

const AuthProviderContext = createContext<AuthProviderValue>({ context: null, token: null });

export function AuthProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: AuthProviderValue;
}): ReactElement {
  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  );
}

export function useAuthProviderValue() {
  return useContext(AuthProviderContext);
}
