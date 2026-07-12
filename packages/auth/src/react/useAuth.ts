"use client";

import { AuthError } from "../types/index.js";
import { useAuthProviderValue } from "./AuthProvider.js";

export function useAuth() {
  return useAuthProviderValue();
}

export function useRequiredAuth() {
  const value = useAuthProviderValue();
  if (!value.context) {
    throw new AuthError("UNAUTHORIZED", "Authentication required");
  }
  return value.context;
}
