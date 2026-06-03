import { assertWorkOSConfigured, getWorkOSClient } from "@/server/auth/workos";
import { workosRuntimeConfig } from "@/packages/config";

type MobileWorkOSProvider = "authkit" | "AppleOAuth" | "GoogleOAuth";
type MobileOAuthResult = {
  accessToken: string;
  refreshToken?: string;
};

export function workosMobileProvider(value: string | null): MobileWorkOSProvider {
  if (value === "apple") return "AppleOAuth";
  if (value === "google") return "GoogleOAuth";
  return "authkit";
}

export function safeMobileReturnTo(value: string | null | undefined) {
  if (!value) return "qentrah:///auth-callback";
  try {
    const url = new URL(value);
    if (url.protocol === "qentrah:" && url.hostname === "" && url.pathname === "/auth-callback") return url.toString();
    if (url.protocol === "qentrah:" && url.hostname === "auth-callback") return url.toString();
  } catch {
    // Fall through to the default app callback.
  }
  return "qentrah:///auth-callback";
}

export async function startMobileOAuth(input: {
  loginHint?: string;
  organizationId?: string;
  provider?: string | null;
  returnTo?: string | null;
  screenHint?: "sign-in" | "sign-up";
}) {
  assertWorkOSConfigured();
  const provider = workosMobileProvider(input.provider ?? null);
  const redirectUri = safeMobileReturnTo(input.returnTo);
  const auth = await getWorkOSClient().userManagement.getAuthorizationUrlWithPKCE({
    provider,
    clientId: workosRuntimeConfig.clientId,
    redirectUri,
    organizationId: input.organizationId,
    loginHint: input.loginHint,
    ...(provider === "authkit" ? { screenHint: input.screenHint ?? "sign-in" } : {}),
  });

  return auth;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function completeMobileOAuth(input: {
  code?: unknown;
  codeVerifier?: unknown;
  ipAddress?: string;
  userAgent?: string;
}): Promise<MobileOAuthResult> {
  assertWorkOSConfigured();
  const code = stringValue(input.code);
  const codeVerifier = stringValue(input.codeVerifier);
  if (!code || !codeVerifier) {
    throw new Error("Qentrah sign-in could not verify this callback. Try signing in again.");
  }

  const auth = await getWorkOSClient().userManagement.authenticateWithCode({
    clientId: workosRuntimeConfig.clientId,
    code,
    codeVerifier,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  return {
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
  };
}
