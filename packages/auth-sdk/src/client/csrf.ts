import { randomToken } from "../internal/crypto";

export type CsrfTokenPair = {
  cookieToken: string;
  headerToken: string;
};

export function createCsrfTokenPair(): CsrfTokenPair {
  const token = randomToken(32);
  return {
    cookieToken: token,
    headerToken: token,
  };
}

export function readCookie(name: string, cookieSource = globalThis.document?.cookie ?? ""): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  const match = cookieSource
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : null;
}
