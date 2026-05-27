import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { convexClient, crossDomainClient } from "@convex-dev/better-auth/client/plugins";

import { getAuthUrl, getConvexUrl } from "@/runtime/expoRuntime";

export const FALLBACK_CONVEX_URL = "https://placeholder.convex.invalid";

function getAuthScheme() {
  return typeof Constants.expoConfig?.scheme === "string"
    ? Constants.expoConfig.scheme
    : "qentrah";
}

function getAuthBaseUrl() {
  return getAuthUrl() || FALLBACK_CONVEX_URL;
}

export function isAuthConfigured() {
  return Boolean(getConvexUrl() && getAuthUrl());
}

export const authClient: any = createAuthClient({
  baseURL: getAuthBaseUrl(),
  plugins: [
    convexClient(),
    ...(Platform.OS === "web"
      ? [crossDomainClient()]
      : [
          expoClient({
            scheme: getAuthScheme(),
            storagePrefix: getAuthScheme(),
            storage: SecureStore,
          }),
        ]),
  ],
} as any);
