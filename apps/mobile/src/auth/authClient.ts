/* eslint-disable max-lines */
import { useEffect, useSyncExternalStore } from "react";
import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";

import { getAuthUrl, getWorkspaceApiUrl } from "@/runtime/expoRuntime";
import { getMobileAuthCallbackUrl } from "@/auth/mobileAuthCallback";

export const FALLBACK_AUTH_URL = "https://placeholder.workspace.invalid";

const accessTokenKey = "qentrah.workos.accessToken";
const refreshTokenKey = "qentrah.workos.refreshToken";
const sealedSessionKey = "qentrah.workos.sealedSession";
const sealedSessionChunkCountKey = `${sealedSessionKey}.chunkCount`;
const oauthTransactionKey = "qentrah.workos.oauthTransaction";
const secureStoreChunkSize = 1800;

type WorkOSMobileTokens = {
  accessToken: string;
  refreshToken?: string;
};

type WorkOSMobileCredential =
  | { type: "tokens"; accessToken: string; refreshToken?: string }
  | { type: "sealedSession"; sealedSession: string };

type WorkOSMobileSession = {
  user: {
    id: string;
    workosUserId?: string;
    name?: string;
    email?: string;
    image?: string | null;
  };
  organization: {
    id: string;
    workosOrganizationId?: string;
    name?: string;
    role?: string;
    roles?: string[];
    permissions?: string[];
  };
};

type EmailVerificationChallenge = {
  code: "email_verification_required";
  email: string;
  emailVerificationId?: string;
  pendingAuthenticationToken: string;
};

type AuthState = {
  isPending: boolean;
  data: { user: WorkOSMobileSession["user"]; session: { id: string }; organization: WorkOSMobileSession["organization"] } | null;
  error: Error | null;
};

type MobileOAuthTransaction = {
  codeVerifier: string;
  state: string;
};

const listeners = new Set<() => void>();
let state: AuthState = { isPending: true, data: null, error: null };
let loaded = false;
let cachedCredential: WorkOSMobileCredential | null = null;
let activeOAuthTransaction: MobileOAuthTransaction | null = null;

function emit() {
  for (const listener of listeners) listener();
}

function setState(next: AuthState) {
  state = next;
  emit();
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/u, "");
}

function getAuthBaseUrl() {
  return trimTrailingSlash(getAuthUrl() || getWorkspaceApiUrl() || FALLBACK_AUTH_URL);
}

function mobileAuthCallbackUrl() {
  if (isNativeRuntime()) return getMobileAuthCallbackUrl();
  return Linking.createURL("auth-callback");
}

export function isWorkspaceAuthConfigured() {
  return Boolean(getAuthUrl() || getWorkspaceApiUrl());
}

export function isAuthConfigured() {
  return isWorkspaceAuthConfigured();
}

function isNativeRuntime() {
  return Platform.OS !== "web";
}

async function secureGet(key: string) {
  if (!isNativeRuntime()) return globalThis.localStorage?.getItem(key) ?? null;
  return SecureStore.getItemAsync(key);
}

async function secureSet(key: string, value: string) {
  if (!isNativeRuntime()) {
    globalThis.localStorage?.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function secureDelete(key: string) {
  if (!isNativeRuntime()) {
    globalThis.localStorage?.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

function sealedSessionChunkKey(index: number) {
  return `${sealedSessionKey}.chunk.${index}`;
}

function parseChunkCount(value: string | null) {
  if (!value) return 0;
  const count = Number.parseInt(value, 10);
  return Number.isSafeInteger(count) && count > 0 ? count : 0;
}

async function clearSealedSession() {
  const chunkCount = parseChunkCount(await secureGet(sealedSessionChunkCountKey));
  await secureDelete(sealedSessionKey);
  await secureDelete(sealedSessionChunkCountKey);
  await Promise.all(
    Array.from({ length: chunkCount }, (_, index) => secureDelete(sealedSessionChunkKey(index))),
  );
}

async function readSealedSession() {
  const direct = await secureGet(sealedSessionKey);
  if (direct) return direct;

  const chunkCount = parseChunkCount(await secureGet(sealedSessionChunkCountKey));
  if (!chunkCount) return null;

  const chunks = await Promise.all(
    Array.from({ length: chunkCount }, (_, index) => secureGet(sealedSessionChunkKey(index))),
  );
  if (chunks.some((chunk) => !chunk)) {
    await clearSealedSession();
    return null;
  }
  return chunks.join("");
}

async function secureSetSealedSession(sealedSession: string) {
  await clearSealedSession();
  if (sealedSession.length <= secureStoreChunkSize) {
    await secureSet(sealedSessionKey, sealedSession);
    return;
  }

  const chunks = sealedSession.match(new RegExp(`.{1,${secureStoreChunkSize}}`, "gu")) ?? [];
  await Promise.all(chunks.map((chunk, index) => secureSet(sealedSessionChunkKey(index), chunk)));
  await secureSet(sealedSessionChunkCountKey, String(chunks.length));
}

async function readCredential() {
  if (cachedCredential) return cachedCredential;
  const sealedSession = await readSealedSession();
  if (sealedSession) {
    cachedCredential = { type: "sealedSession", sealedSession };
    return cachedCredential;
  }
  const accessToken = await secureGet(accessTokenKey);
  if (!accessToken) return null;
  cachedCredential = {
    type: "tokens",
    accessToken,
    refreshToken: await secureGet(refreshTokenKey) ?? undefined,
  };
  return cachedCredential;
}

async function storeTokens(tokens: WorkOSMobileTokens) {
  cachedCredential = { type: "tokens", ...tokens };
  await clearOAuthTransaction();
  await clearSealedSession();
  await secureSet(accessTokenKey, tokens.accessToken);
  if (tokens.refreshToken) await secureSet(refreshTokenKey, tokens.refreshToken);
}

async function storeSealedSession(sealedSession: string) {
  cachedCredential = { type: "sealedSession", sealedSession };
  await clearOAuthTransaction();
  await secureDelete(accessTokenKey);
  await secureDelete(refreshTokenKey);
  await secureSetSealedSession(sealedSession);
}

async function clearCredential() {
  cachedCredential = null;
  await clearOAuthTransaction();
  await secureDelete(accessTokenKey);
  await secureDelete(refreshTokenKey);
  await clearSealedSession();
}

async function storeOAuthTransaction(transaction: MobileOAuthTransaction) {
  activeOAuthTransaction = transaction;
  await secureSet(oauthTransactionKey, JSON.stringify(transaction));
}

async function readOAuthTransaction() {
  if (activeOAuthTransaction) return activeOAuthTransaction;
  const raw = await secureGet(oauthTransactionKey);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<MobileOAuthTransaction>;
    if (typeof parsed.state === "string" && typeof parsed.codeVerifier === "string") {
      activeOAuthTransaction = {
        codeVerifier: parsed.codeVerifier,
        state: parsed.state,
      };
      return activeOAuthTransaction;
    }
  } catch {
    // Clear malformed transient auth state below.
  }
  await secureDelete(oauthTransactionKey);
  return null;
}

async function clearOAuthTransaction() {
  activeOAuthTransaction = null;
  await secureDelete(oauthTransactionKey);
}

function sessionUrl() {
  return `${getAuthBaseUrl()}/api/auth/workos/session`;
}

function loginStartUrl(input: { callbackUrl: string; provider?: unknown; screenHint?: "sign-in" | "sign-up"; loginHint?: string }) {
  const url = new URL("/api/auth/workos/mobile/start", getAuthBaseUrl());
  url.searchParams.set("return_to", input.callbackUrl);
  if (input.provider === "apple" || input.provider === "google") url.searchParams.set("provider", input.provider);
  if (input.screenHint) url.searchParams.set("screen_hint", input.screenHint);
  if (input.loginHint) url.searchParams.set("login_hint", input.loginHint);
  return url.toString();
}

function passwordAuthUrl(path: "login" | "register" | "reset" | "reset/confirm" | "verify-email") {
  return `${getAuthBaseUrl()}/api/auth/workos/mobile/password/${path}`;
}

function completeOAuthUrl() {
  return `${getAuthBaseUrl()}/api/auth/workos/mobile/complete`;
}

function authorizationHeader(credential: WorkOSMobileCredential | null = cachedCredential) {
  if (!credential) return "";
  if (credential.type === "tokens") return `Bearer ${credential.accessToken}`;
  return `WorkOS-Session ${credential.sealedSession}`;
}

async function fetchSession() {
  const credential = await readCredential();
  if (!credential) {
    setState({ isPending: false, data: null, error: null });
    return null;
  }

  const response = await fetch(sessionUrl(), {
    headers: { authorization: authorizationHeader(credential) },
  });
  const payload = await response.json().catch(() => null) as { ok?: boolean; session?: WorkOSMobileSession; error?: string } | null;
  if (!response.ok || !payload?.ok || !payload.session) {
    await clearCredential();
    const error = new Error(payload?.error ?? "Qentrah session is required.");
    setState({ isPending: false, data: null, error });
    return null;
  }

  const next = {
    user: payload.session.user,
    organization: payload.session.organization,
    session: { id: payload.session.organization.workosOrganizationId || payload.session.organization.id || "workos-mobile" },
  };
  setState({ isPending: false, data: next, error: null });
  return next;
}

async function completeAuthCallback(url: string) {
  const parsed = Linking.parse(url);
  const accessToken = typeof parsed.queryParams?.accessToken === "string" ? parsed.queryParams.accessToken : "";
  const refreshToken = typeof parsed.queryParams?.refreshToken === "string" ? parsed.queryParams.refreshToken : undefined;
  const code = typeof parsed.queryParams?.code === "string" ? parsed.queryParams.code : "";
  const callbackState = typeof parsed.queryParams?.state === "string" ? parsed.queryParams.state : "";
  const error = typeof parsed.queryParams?.error === "string" ? parsed.queryParams.error : "";
  if (error) throw new Error(error);
  if (code || callbackState) {
    return completeOAuthCallback({ code, state: callbackState });
  }
  if (!accessToken) throw new Error("Qentrah mobile callback did not include an access token.");
  await storeTokens({ accessToken, refreshToken });
  return fetchSession();
}

type PasswordAuthResponse = {
  ok?: boolean;
  session?: { sealedSession?: string };
  error?: string;
  emailVerification?: EmailVerificationChallenge;
};

type SocialAuthStartResponse = {
  codeVerifier?: string;
  ok?: boolean;
  state?: string;
  url?: string;
  error?: string;
  emailVerification?: EmailVerificationChallenge;
};

type SocialAuthCompleteResponse = {
  accessToken?: string;
  emailVerification?: EmailVerificationChallenge;
  error?: string;
  ok?: boolean;
  refreshToken?: string;
  session?: { sealedSession?: string };
};

async function startSocialAuth(input: {
  callbackUrl: string;
  provider?: unknown;
  screenHint?: "sign-in" | "sign-up";
}) {
  const response = await fetch(loginStartUrl(input), {
    headers: { accept: "application/json" },
  });
  const payload = await response.json().catch(() => null) as SocialAuthStartResponse | null;
  if (!response.ok || !payload?.ok || !payload.url) {
    throw new Error(payload?.error ?? "Qentrah sign-in could not start.");
  }
  if (!payload.state || !payload.codeVerifier) {
    throw new Error("Qentrah sign-in could not start securely.");
  }
  await storeOAuthTransaction({
    codeVerifier: payload.codeVerifier,
    state: payload.state,
  });
  return payload.url;
}

async function completeOAuthCallback(input: { code: string; state: string }) {
  const transaction = await readOAuthTransaction();
  if (!input.code || !input.state || !transaction) {
    throw new Error("Qentrah sign-in could not verify this callback. Try signing in again.");
  }
  if (input.state !== transaction.state) {
    await clearOAuthTransaction();
    throw new Error("Qentrah sign-in could not verify this callback. Try signing in again.");
  }
  const { codeVerifier } = transaction;
  await clearOAuthTransaction();
  const response = await fetch(completeOAuthUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      code: input.code,
      codeVerifier,
    }),
  });
  const payload = await response.json().catch(() => null) as SocialAuthCompleteResponse | null;
  if (!response.ok || !payload?.ok || (!payload.session?.sealedSession && !payload.accessToken)) {
    const error = new Error(payload?.error ?? "Qentrah sign-in callback failed.") as Error & {
      emailVerification?: EmailVerificationChallenge;
    };
    if (payload?.emailVerification) error.emailVerification = payload.emailVerification;
    throw error;
  }
  if (payload.session?.sealedSession) {
    await storeSealedSession(payload.session.sealedSession);
    return fetchSession();
  }
  await storeTokens({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
  });
  return fetchSession();
}

async function postPasswordAuth(path: "login" | "register" | "reset" | "reset/confirm" | "verify-email", body: Record<string, string>) {
  const response = await fetch(passwordAuthUrl(path), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null) as PasswordAuthResponse | null;
  if (!response.ok || !payload?.ok) {
    return {
      error: {
        message: payload?.error ?? "Qentrah password authentication failed.",
        emailVerification: payload?.emailVerification,
      },
    };
  }
  return { data: payload };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const authClient = {
  useSession() {
    const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
    useEffect(() => {
      if (loaded) return;
      loaded = true;
      void fetchSession();
    }, []);
    return snapshot;
  },
  async getSession() {
    return fetchSession();
  },
  async signOut() {
    await clearCredential();
    setState({ isPending: false, data: null, error: null });
  },
  getAuthorizationHeader() {
    return authorizationHeader();
  },
  getMobileAuthCallbackUrl() {
    return mobileAuthCallbackUrl();
  },
  async completeMobileCallback(url: string) {
    return completeAuthCallback(url);
  },
  signIn: {
    async social(input: { provider?: unknown; callbackURL?: string; screenHint?: "sign-in" | "sign-up" }) {
      const callbackUrl = input.callbackURL || mobileAuthCallbackUrl();
      const authUrl = await startSocialAuth({
        callbackUrl,
        provider: input.provider,
        screenHint: input.screenHint,
      });
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        callbackUrl,
      );
      if (result.type === "success" && result.url) {
        await completeAuthCallback(result.url);
        return {};
      }
      await clearOAuthTransaction();
      if (result.type === "cancel") return { error: { message: "Sign in was cancelled." } };
      return { error: { message: "Unable to complete Qentrah sign in." } };
    },
    async password(input: { email: string; password: string; callbackURL?: string }) {
      const result = await postPasswordAuth("login", {
        email: input.email,
        password: input.password,
        returnTo: input.callbackURL || mobileAuthCallbackUrl(),
      });
      if (result.error) return { error: result.error };
      const sealedSession = result.data.session?.sealedSession;
      if (!sealedSession) return { error: { message: "Qentrah did not return a mobile session." } };
      await storeSealedSession(sealedSession);
      return {};
    },
  },
  signUp: {
    async emailPassword(input: { name: string; email: string; password: string; callbackURL?: string }) {
      const result = await postPasswordAuth("register", {
        name: input.name,
        email: input.email,
        password: input.password,
        returnTo: input.callbackURL || mobileAuthCallbackUrl(),
      });
      if (result.error) return { error: result.error };
      const sealedSession = result.data.session?.sealedSession;
      if (!sealedSession) return { error: { message: "Qentrah did not return a mobile session." } };
      await storeSealedSession(sealedSession);
      return {};
    },
  },
  async requestPasswordReset(input: { email: string }) {
    const result = await postPasswordAuth("reset", { email: input.email });
    if (result.error) return { error: result.error };
    return {};
  },
  async confirmPasswordReset(input: { token: string; newPassword: string }) {
    const result = await postPasswordAuth("reset/confirm", {
      token: input.token,
      newPassword: input.newPassword,
    });
    if (result.error) return { error: result.error };
    return {};
  },
  async confirmEmailVerification(input: { code: string; pendingAuthenticationToken: string }) {
    const result = await postPasswordAuth("verify-email", {
      code: input.code,
      pendingAuthenticationToken: input.pendingAuthenticationToken,
    });
    if (result.error) return { error: result.error };
    const sealedSession = result.data.session?.sealedSession;
    if (!sealedSession) return { error: { message: "Qentrah did not return a mobile session." } };
    await storeSealedSession(sealedSession);
    return {};
  },
  useActiveOrganization() {
    const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
    return { data: snapshot.data?.organization ?? null, isPending: snapshot.isPending, error: snapshot.error };
  },
  useListOrganizations() {
    const snapshot = useSyncExternalStore(subscribe, () => state, () => state);
    const organization = snapshot.data?.organization;
    return { data: organization?.id ? [organization] : [], isPending: snapshot.isPending, error: snapshot.error };
  },
  organization: {
    async setActive(input: { organizationId: string }) {
      const current = state.data?.organization;
      if (current?.id === input.organizationId) return { data: current };
      return { error: { message: "Switch workspace from Qentrah, then return to mobile." } };
    },
    async create() {
      return { error: { message: "Create the workspace in Qentrah Workspace, then sign in again." } };
    },
  },
};
