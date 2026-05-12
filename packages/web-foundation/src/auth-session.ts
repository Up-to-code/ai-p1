import { toSessionUser, type SessionContext, type SessionUser } from "@anan/platform-core/session";

export type OptionalSessionResult = {
  token: string;
  context: SessionContext;
} | null;

export type AuthenticatedSessionProjection = {
  token: string | null;
  user: SessionUser | null;
  role: string | null;
  isAdmin?: boolean;
};

export function isAuthConfigurationError(error: unknown) {
  return Boolean(
    error
      && typeof error === "object"
      && "code" in error
      && error.code === "AUTH_CONFIGURATION_ERROR",
  );
}

export async function projectAuthenticatedSession(
  getOptionalSessionContext: () => Promise<OptionalSessionResult>,
): Promise<AuthenticatedSessionProjection> {
  let session;
  try {
    session = await getOptionalSessionContext();
  } catch (error) {
    if (isAuthConfigurationError(error)) {
      return { token: null, user: null, role: null };
    }
    throw error;
  }

  if (!session) {
    return { token: null, user: null, role: null };
  }

  return {
    token: session.token,
    user: toSessionUser(session.context),
    role: session.context.role ?? null,
    isAdmin: session.context.isAdmin ?? false,
  };
}

export function sanitizeInternalReturnTo(returnTo?: string | null, fallback = "/") {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return fallback;
  }

  if (returnTo.startsWith("/signin")) {
    return fallback;
  }

  return returnTo;
}
