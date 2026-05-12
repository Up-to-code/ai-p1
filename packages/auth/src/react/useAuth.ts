"use client";

import { AuthError } from "../types";
import { useAuthProviderValue } from "./AuthProvider";

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
