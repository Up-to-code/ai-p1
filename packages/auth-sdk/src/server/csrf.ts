import { constantTimeEqual, randomToken } from "../internal/crypto";
import { AuthSdkError } from "../errors";

export const DEFAULT_CSRF_COOKIE_NAME = "__Host-anan_csrf";
export const DEFAULT_CSRF_HEADER_NAME = "x-anan-csrf";

export function createServerCsrfToken(): string {
  return randomToken(32);
}

export function readCookieHeader(cookieHeader: string | null | undefined, name: string): string | null {
  if (!cookieHeader) return null;
  const prefix = `${encodeURIComponent(name)}=`;
  const match = cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}

export function assertCsrfRequest(request: Request, options: {
  cookieName?: string;
  headerName?: string;
} = {}): void {
  const cookieName = options.cookieName ?? DEFAULT_CSRF_COOKIE_NAME;
  const headerName = options.headerName ?? DEFAULT_CSRF_HEADER_NAME;
  const cookieToken = readCookieHeader(request.headers.get("cookie"), cookieName);
  const headerToken = request.headers.get(headerName);
  if (!cookieToken || !headerToken || !constantTimeEqual(cookieToken, headerToken)) {
    throw new AuthSdkError("CSRF_INVALID", "Invalid CSRF token", 403);
  }
}
