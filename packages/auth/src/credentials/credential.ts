export const BETTER_AUTH_SESSION_COOKIE_NAMES = [
  "__Host-better-auth.session_token",
  "__Secure-better-auth.session_token",
  "better-auth.session_token",
] as const;

export type BetterAuthSessionCookieName = typeof BETTER_AUTH_SESSION_COOKIE_NAMES[number];

export type AuthCredential =
  | { kind: "bearer"; token: string }
  | {
      kind: "session";
      token: string;
      cookieName: BetterAuthSessionCookieName;
      cookie: string;
    };

export type AuthCredentialSource = Headers | Request;

function sourceHeaders(source: AuthCredentialSource): Headers {
  return source instanceof Request ? source.headers : source;
}

function bearerToken(value: string | null): string | null {
  if (!value) return null;
  const match = /^Bearer\s+(.+)$/iu.exec(value.trim());
  return match?.[1]?.trim() || null;
}

function decodeOpaqueCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function sessionCookie(value: string | null): Extract<AuthCredential, { kind: "session" }> | null {
  if (!value) return null;

  const cookies = value.split(";");
  for (const preferredName of BETTER_AUTH_SESSION_COOKIE_NAMES) {
    for (const candidate of cookies) {
      const separator = candidate.indexOf("=");
      if (separator < 1) continue;
      const name = candidate.slice(0, separator).trim();
      const encodedToken = candidate.slice(separator + 1).trim();
      if (name !== preferredName || !encodedToken) continue;
      return {
        kind: "session",
        token: decodeOpaqueCookieValue(encodedToken),
        cookieName: preferredName,
        cookie: `${preferredName}=${encodedToken}`,
      };
    }
  }

  return null;
}

/** Reads a bearer token or Better Auth session cookie without logging secret material. */
export function readAuthCredential(source: AuthCredentialSource): AuthCredential | null {
  const headers = sourceHeaders(source);
  const token = bearerToken(headers.get("authorization"));
  if (token) return { kind: "bearer", token };
  return sessionCookie(headers.get("cookie"));
}

/** Creates the credential headers expected by an authentication endpoint. */
export function authCredentialHeaders(credential: AuthCredential | null | undefined): Headers {
  const headers = new Headers();
  if (!credential) return headers;
  if (credential.kind === "bearer") {
    headers.set("authorization", `Bearer ${credential.token}`);
  } else {
    headers.set("cookie", credential.cookie);
  }
  return headers;
}

/** Returns a safe diagnostic label that never contains the credential secret. */
export function redactAuthCredential(credential: AuthCredential | null | undefined): string {
  if (!credential) return "none";
  return credential.kind === "bearer"
    ? "Bearer [REDACTED]"
    : `${credential.cookieName}=[REDACTED]`;
}
