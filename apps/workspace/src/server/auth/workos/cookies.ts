import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { workosRuntimeConfig } from "@/packages/config";

export const WORKOS_ACCESS_TOKEN_COOKIE = "qentrah_workos_access";
export const WORKOS_REFRESH_TOKEN_COOKIE = "qentrah_workos_refresh";
export const WORKOS_STATE_COOKIE = "qentrah_workos_state";
export const WORKOS_CODE_VERIFIER_COOKIE = "qentrah_workos_code_verifier";
export const WORKOS_RETURN_TO_COOKIE = "qentrah_workos_return_to";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: workosRuntimeConfig.cookieSecure,
  path: "/",
  ...(workosRuntimeConfig.cookieDomain ? { domain: workosRuntimeConfig.cookieDomain } : {}),
} satisfies Partial<ResponseCookie>;

export function workosSessionCookieOptions(maxAge: number) {
  return {
    ...baseCookieOptions,
    maxAge,
  };
}

export function workosTransientCookieOptions(maxAge = 600) {
  return {
    ...baseCookieOptions,
    maxAge,
  };
}

export function expiredWorkOSCookieOptions() {
  return {
    ...baseCookieOptions,
    maxAge: 0,
  };
}

export function readCookieFromHeader(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return "";
  const cookies = cookieHeader.split(";").map((part) => part.trim());
  for (const cookie of cookies) {
    const index = cookie.indexOf("=");
    if (index <= 0) continue;
    if (cookie.slice(0, index) === name) {
      return decodeURIComponent(cookie.slice(index + 1));
    }
  }
  return "";
}
