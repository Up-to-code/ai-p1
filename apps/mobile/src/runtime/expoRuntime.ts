import Constants, { ExecutionEnvironment } from "expo-constants";

export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

type ExpoExtra = {
  convexUrl?: string;
  authUrl?: string;
};

function normalizeUrlEnvValue(value: string | undefined) {
  if (!value) {
    return value;
  }

  const trimmed = value.trim();
  if (/^=+https?:\/\//.test(trimmed)) {
    return trimmed.replace(/^=+/, "");
  }

  return trimmed;
}

function getExpoExtra() {
  return (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
}

export function getConvexUrl() {
  return (
    normalizeUrlEnvValue(process.env.EXPO_PUBLIC_CONVEX_URL) ??
    normalizeUrlEnvValue(getExpoExtra().convexUrl) ??
    ""
  );
}

export function getAuthUrl() {
  return (
    normalizeUrlEnvValue(process.env.EXPO_PUBLIC_AUTH_URL) ??
    normalizeUrlEnvValue(process.env.EXPO_PUBLIC_CONVEX_SITE_URL) ??
    normalizeUrlEnvValue(getExpoExtra().authUrl) ??
    ""
  );
}
