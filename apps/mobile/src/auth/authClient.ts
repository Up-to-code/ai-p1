import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { organizationClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";

import { getAuthUrl, getWorkspaceApiUrl } from "@/runtime/expoRuntime";

export const FALLBACK_AUTH_URL = "https://placeholder.workspace.invalid";

function getAuthScheme() {
  return typeof Constants.expoConfig?.scheme === "string"
    ? Constants.expoConfig.scheme
    : "qentrah";
}

function getAuthBaseUrl() {
  return getAuthUrl() || getWorkspaceApiUrl() || FALLBACK_AUTH_URL;
}

export function isAuthConfigured() {
  return isWorkspaceAuthConfigured();
}

export function isWorkspaceAuthConfigured() {
  return Boolean(getAuthUrl() || getWorkspaceApiUrl());
}

export const authClient: any = createAuthClient({
  baseURL: getAuthBaseUrl(),
  plugins: [
    organizationClient(),
    ...(Platform.OS === "web"
      ? []
      : [
          expoClient({
            scheme: getAuthScheme(),
            storagePrefix: getAuthScheme(),
            storage: SecureStore,
          }),
        ]),
  ],
} as any);
