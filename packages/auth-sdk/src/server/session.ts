import {
  authContextFromSessionContext,
  type AuthContext,
} from "@anan/auth/server";
import type { SessionContext } from "@anan/platform-core/session";
import { AuthSdkError } from "../errors";

export type ResolvedAuthSession = {
  token?: string;
  context: AuthContext;
  session: SessionContext;
};

export type SessionResolverInput = {
  token?: string | null;
  session: SessionContext | null;
};

export function sanitizeAuthContext(context: AuthContext): AuthContext {
  const { token: _token, ...safe } = context;
  return safe;
}

export function resolveAuthSession(input: SessionResolverInput): ResolvedAuthSession | null {
  if (!input.session?.isActive) return null;
  return {
    token: input.token ?? undefined,
    context: authContextFromSessionContext(input.session, input.token ?? undefined),
    session: input.session,
  };
}

export function requireAuthContext(input: SessionResolverInput): ResolvedAuthSession {
  const session = resolveAuthSession(input);
  if (!session) {
    throw new AuthSdkError("AUTH_REQUIRED", "Authentication required", 401);
  }
  return session;
}
