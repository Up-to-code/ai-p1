import Constants, { ExecutionEnvironment } from "expo-constants";

import { Platform } from "react-native";

import { normalizeUrlEnvValue, resolveReachableDevUrl } from "./mobileEnvironment";

export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type ExpoExtra = {
  authUrl?: string;
  workspaceApiUrl?: string;
  mobileEnvironment?: string;
};

function getExpoExtra() {
  return (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
}

function getExpoHostUri() {
  const constants = Constants as typeof Constants & {
    expoGoConfig?: { debuggerHost?: string };
    manifest?: { debuggerHost?: string };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };
  return (
    Constants.expoConfig?.hostUri ||
    constants.manifest2?.extra?.expoClient?.hostUri ||
    constants.expoGoConfig?.debuggerHost ||
    constants.manifest?.debuggerHost ||
    ""
  );
}

function normalizeRuntimeUrl(value: string) {
  const normalized = normalizeUrlEnvValue(value);
  if (!normalized || Platform.OS === "web") return normalized;
  return resolveReachableDevUrl(normalized, getExpoHostUri());
}

export function getAuthUrl() {
  return normalizeRuntimeUrl(
    normalizeUrlEnvValue(getExpoExtra().authUrl) ||
    normalizeUrlEnvValue(process.env.EXPO_PUBLIC_AUTH_URL) ||
    "",
  );
}

export function getWorkspaceApiUrl() {
  return normalizeRuntimeUrl(
    normalizeUrlEnvValue(getExpoExtra().workspaceApiUrl) ||
    normalizeUrlEnvValue(process.env.EXPO_PUBLIC_WORKSPACE_API_URL) ||
    getAuthUrl(),
  );
}

export function getMobileEnvironment() {
  return getExpoExtra().mobileEnvironment ?? "development";
}
