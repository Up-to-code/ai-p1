import { gateCookieName } from "./cookies";
import { signValue, verifySignedValue } from "./crypto";

const gateCookieValue = "unlocked";

export function isPublicPath(pathname: string) {
  return (
    pathname === "/unlock" ||
    pathname === "/api/unlock" ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname.match(/\.[a-zA-Z0-9]+$/u) !== null
  );
}

export async function createGateCookie(secret: string) {
  return signValue(gateCookieValue, secret);
}

export async function isValidGateCookie(cookieValue: string | undefined, secret: string) {
  return (await verifySignedValue(cookieValue, secret)) === gateCookieValue;
}

export function gateCookieHeader(cookieHeader: string | null) {
  if (!cookieHeader) return undefined;
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${gateCookieName}=`))
    ?.slice(gateCookieName.length + 1);
}
