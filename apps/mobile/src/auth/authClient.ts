import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";
import { expoClient } from "@better-auth/expo/client";
import { lastLoginMethodClient } from "@better-auth/expo/plugins";
import * as SecureStore from "expo-secure-store";
import { getAuthUrl } from "@/runtime/expoRuntime";

export const authClient = createAuthClient({
  baseURL: getAuthUrl(),
  plugins: [
    expoClient({ scheme: "qentrah", storagePrefix: "qentrah", storage: SecureStore }),
    organizationClient(),
    emailOTPClient(),
    lastLoginMethodClient({
      storagePrefix: "qentrah",
      storage: {
        setItem: (key, value) => SecureStore.setItem(key, value),
        getItem: (key) => SecureStore.getItem(key),
        deleteItemAsync: (key) => SecureStore.deleteItemAsync(key),
      },
    }),
  ],
});

export function isAuthConfigured() {
  return isWorkspaceAuthConfigured();
}

export function isWorkspaceAuthConfigured() {
  try {
    const url = new URL(getAuthUrl());
    return url.protocol === "https:" || url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
