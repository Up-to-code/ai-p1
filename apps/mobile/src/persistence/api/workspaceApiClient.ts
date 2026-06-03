function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const productionWorkspaceApiUrl = "https://app.qentrah.com";

let fallbackInstallationId: string | null = null;
let installationHashPromise: Promise<string> | null = null;

function getRuntimeWorkspaceApiUrl() {
  try {
    const runtime = require("@/runtime/expoRuntime") as {
      getAuthUrl?: () => string;
      getWorkspaceApiUrl?: () => string;
    };
    return runtime.getWorkspaceApiUrl?.() || runtime.getAuthUrl?.() || "";
  } catch {
    return "";
  }
}

function getWorkspaceApiBaseUrl() {
  return trimTrailingSlash(
    getRuntimeWorkspaceApiUrl()
      || process.env.EXPO_PUBLIC_WORKSPACE_API_URL
      || process.env.EXPO_PUBLIC_AUTH_URL
      || productionWorkspaceApiUrl,
  );
}

function isNativeRuntime() {
  return typeof navigator !== "undefined" && navigator.product === "ReactNative";
}

function getPlatformName() {
  try {
    const native = require("react-native") as { Platform?: { OS?: string } };
    return native.Platform?.OS ?? "unknown";
  } catch {
    return "web";
  }
}

function getAppVersion() {
  try {
    const constants = require("expo-constants") as {
      default?: { expoConfig?: { version?: string } };
      expoConfig?: { version?: string };
    };
    return constants.default?.expoConfig?.version ?? constants.expoConfig?.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

function createRequestId() {
  const random = globalThis.crypto && "randomUUID" in globalThis.crypto
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `mobile-${random}`;
}

function createInstallationId() {
  const random = globalThis.crypto && "randomUUID" in globalThis.crypto
    ? globalThis.crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 18)}`;
  return `qentrah-${random}`;
}

function stableHash(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return `v1_${(hash >>> 0).toString(36)}`;
}

async function getStoredInstallationId() {
  if (fallbackInstallationId) return fallbackInstallationId;

  if (isNativeRuntime()) {
    try {
      const secureStore = require("expo-secure-store") as {
        getItemAsync?: (key: string) => Promise<string | null>;
        setItemAsync?: (key: string, value: string) => Promise<void>;
      };
      const key = "qentrah.mobile.installationId";
      const existing = await secureStore.getItemAsync?.(key);
      if (existing) return existing;
      const created = createInstallationId();
      await secureStore.setItemAsync?.(key, created);
      return created;
    } catch {
      // Fall through to an in-memory id for non-native tests or restricted storage.
    }
  }

  try {
    const key = "qentrah.mobile.installationId";
    const existing = globalThis.localStorage?.getItem(key);
    if (existing) return existing;
    const created = createInstallationId();
    globalThis.localStorage?.setItem(key, created);
    return created;
  } catch {
    // Fall through to an in-memory id.
  }

  fallbackInstallationId = createInstallationId();
  return fallbackInstallationId;
}

async function getInstallationIdHash() {
  installationHashPromise ??= getStoredInstallationId().then(stableHash);
  return installationHashPromise;
}

function getStoredAuthCookie() {
  if (!isNativeRuntime()) {
    return "";
  }

  try {
    const auth = require("@/auth/authClient") as { authClient?: { getCookie?: () => string } };
    return auth.authClient?.getCookie?.() ?? "";
  } catch {
    return "";
  }
}

function withWorkspaceAuthHeaders(headers: HeadersInit | undefined) {
  const nextHeaders = new Headers(headers);
  const cookie = getStoredAuthCookie();
  if (cookie && !nextHeaders.has("cookie")) {
    nextHeaders.set("cookie", cookie);
  }
  return nextHeaders;
}

async function withMobileRequestHeaders(headers: HeadersInit | undefined) {
  const nextHeaders = withWorkspaceAuthHeaders(headers);
  if (!nextHeaders.has("x-qentrah-client")) nextHeaders.set("x-qentrah-client", "mobile");
  if (!nextHeaders.has("x-request-id")) nextHeaders.set("x-request-id", createRequestId());
  if (!nextHeaders.has("x-qentrah-platform")) nextHeaders.set("x-qentrah-platform", getPlatformName());
  if (!nextHeaders.has("x-qentrah-app-version")) nextHeaders.set("x-qentrah-app-version", getAppVersion());
  if (!nextHeaders.has("x-qentrah-installation-id")) {
    nextHeaders.set("x-qentrah-installation-id", await getInstallationIdHash());
  }
  return nextHeaders;
}

export function buildWorkspaceApiUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = getWorkspaceApiBaseUrl();
  return baseUrl ? `${baseUrl}${path}` : path;
}

export function isNativeWorkspaceRuntime() {
  return isNativeRuntime();
}

export async function buildWorkspaceApiRequest(path: string, init: RequestInit = {}) {
  return {
    url: buildWorkspaceApiUrl(path),
    init: {
      ...init,
      credentials: init.credentials ?? "include",
      headers: await withMobileRequestHeaders(init.headers),
    },
  };
}

export async function workspaceApiFetch(path: string, init: RequestInit = {}) {
  const request = await buildWorkspaceApiRequest(path, init);
  return fetch(request.url, request.init);
}
