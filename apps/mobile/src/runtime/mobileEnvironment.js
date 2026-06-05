const PRODUCTION_WORKSPACE_URL = "https://app.qentrah.com";
const DEFAULT_DEV_WORKSPACE_URL = PRODUCTION_WORKSPACE_URL;

function normalizeUrlEnvValue(value) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (/^=+https?:\/\//.test(trimmed)) {
    return trimmed.replace(/^=+/, "");
  }

  return trimmed;
}

function firstValue(...values) {
  for (const value of values) {
    const normalized = normalizeUrlEnvValue(value);
    if (normalized) return normalized;
  }
  return "";
}

function classifyEnvironment(value) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;
  if (["dev", "development", "local"].includes(normalized)) return "development";
  if (["prod", "production", "release", "store", "app-store", "appstore"].includes(normalized)) {
    return "production";
  }
  return null;
}

function resolveMobileEnvironmentName(env = process.env) {
  const explicit = classifyEnvironment(env.QENTRAH_MOBILE_ENV)
    ?? classifyEnvironment(env.EXPO_PUBLIC_QENTRAH_MOBILE_ENV)
    ?? classifyEnvironment(env.APP_VARIANT);
  if (explicit) return explicit;

  const easProfile = classifyEnvironment(env.EAS_BUILD_PROFILE);
  if (easProfile) return easProfile;

  if (env.NODE_ENV === "production") return "production";
  return "development";
}

function resolveMobileEnvironmentConfig(env = process.env) {
  const environment = resolveMobileEnvironmentName(env);

  if (environment === "production") {
    const workspaceApiUrl = firstValue(
      env.EXPO_PUBLIC_PRODUCTION_WORKSPACE_API_URL,
      PRODUCTION_WORKSPACE_URL,
    );
    const authUrl = firstValue(
      env.EXPO_PUBLIC_PRODUCTION_AUTH_URL,
      workspaceApiUrl,
      PRODUCTION_WORKSPACE_URL,
    );
    const clerkPublishableKey = firstValue(
      env.EXPO_PUBLIC_PRODUCTION_CLERK_PUBLISHABLE_KEY,
      env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    );
    return { environment, workspaceApiUrl, authUrl, clerkPublishableKey };
  }

  const workspaceApiUrl = firstValue(
    env.EXPO_PUBLIC_DEV_WORKSPACE_API_URL,
    DEFAULT_DEV_WORKSPACE_URL,
  );
  const authUrl = firstValue(
    env.EXPO_PUBLIC_DEV_AUTH_URL,
    workspaceApiUrl,
  );
  const clerkPublishableKey = firstValue(
    env.EXPO_PUBLIC_DEV_CLERK_PUBLISHABLE_KEY,
  );

  return { environment, workspaceApiUrl, authUrl, clerkPublishableKey };
}

function isLocalUrl(value) {
  try {
    const url = new URL(value);
    return ["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)
      || url.hostname.endsWith(".local");
  } catch {
    return false;
  }
}

function getHostFromExpoHostUri(hostUri) {
  if (!hostUri) return "";
  const normalized = hostUri.includes("://") ? hostUri : `http://${hostUri}`;
  try {
    return new URL(normalized).hostname;
  } catch {
    return "";
  }
}

function resolveReachableDevUrl(value, hostUri) {
  const host = getHostFromExpoHostUri(hostUri);
  if (!host) return value;

  try {
    const url = new URL(value);
    if (!["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) {
      return value;
    }
    url.hostname = host;
    return url.toString().replace(/\/$/, "");
  } catch {
    return value;
  }
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function isClerkPublishableKey(value) {
  return /^pk_(test|live)_[A-Za-z0-9_-]+$/.test(value || "");
}

function getMobileEnvironmentIssues(config) {
  const issues = [];

  if (config.environment !== "production") {
    return issues;
  }

  if (!isHttpsUrl(config.workspaceApiUrl)) {
    issues.push("Production mobile builds require an HTTPS Workspace API URL.");
  }
  if (!isHttpsUrl(config.authUrl)) {
    issues.push("Production mobile builds require an HTTPS auth URL.");
  }
  if (!isClerkPublishableKey(config.clerkPublishableKey)) {
    issues.push("Production mobile builds require a valid EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY.");
  }
  if (isLocalUrl(config.workspaceApiUrl)) {
    issues.push("Production mobile builds cannot use a local Workspace API URL.");
  }
  if (isLocalUrl(config.authUrl)) {
    issues.push("Production mobile builds cannot use a local auth URL.");
  }
  return issues;
}

module.exports = {
  getMobileEnvironmentIssues,
  resolveReachableDevUrl,
  isHttpsUrl,
  isLocalUrl,
  isClerkPublishableKey,
  normalizeUrlEnvValue,
  resolveMobileEnvironmentConfig,
  resolveMobileEnvironmentName,
};
