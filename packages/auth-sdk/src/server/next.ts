import { createServerCsrfToken, DEFAULT_CSRF_COOKIE_NAME } from "./csrf";
import { serializeSecureCookie } from "./cookies";
import { sanitizeAuthContext, type ResolvedAuthSession } from "./session";

export type AuthSdkSessionResponse = {
  authenticated: boolean;
  context: ReturnType<typeof sanitizeAuthContext> | null;
  accessToken?: string;
  expiresAtMs?: number | null;
  scopes?: string[];
  csrfToken?: string;
};

export function createSessionResponse(session: ResolvedAuthSession | null, options: {
  includeAccessToken?: boolean;
  csrfCookieName?: string;
  csrfMaxAgeSeconds?: number;
} = {}): Response {
  const csrfToken = createServerCsrfToken();
  const body: AuthSdkSessionResponse = session
    ? {
        authenticated: true,
        context: sanitizeAuthContext(session.context),
        accessToken: options.includeAccessToken ? session.token : undefined,
        expiresAtMs: null,
        scopes: session.context.scopes,
        csrfToken,
      }
    : {
        authenticated: false,
        context: null,
        csrfToken,
      };
  return Response.json(body, {
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": serializeSecureCookie({
        name: options.csrfCookieName ?? DEFAULT_CSRF_COOKIE_NAME,
        value: csrfToken,
        maxAgeSeconds: options.csrfMaxAgeSeconds ?? 60 * 30,
        httpOnly: false,
        secure: true,
        sameSite: "Lax",
      }),
    },
  });
}
