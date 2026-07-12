import { createNextAuthBridge } from "@qentrah/platform-core/auth-next";
import type { SessionContext } from "@qentrah/platform-core/session";
import { AuthError, type AuthContext } from "../types/index.js";
import { authContextFromSessionContext } from "./claims.js";

export { resolveAuthBridgeConfig } from "@qentrah/platform-core/auth-next";

export type ResolvedAuthSession = {
  token: string;
  context: SessionContext;
};

export type AuthSessionResolver = () => Promise<ResolvedAuthSession | null>;

export type QentrahAuthServerOptions = {
  appId: "web" | "admin" | "external-apps" | string;
  getOptionalSessionContext?: AuthSessionResolver;
};

export function createQentrahAuthServer(options: QentrahAuthServerOptions) {
  const bridge = createNextAuthBridge();

  async function getOptionalAuth(): Promise<AuthContext | null> {
    if (!options.getOptionalSessionContext) {
      return null;
    }
    const session = await options.getOptionalSessionContext();
    return session ? authContextFromSessionContext(session.context, session.token) : null;
  }

  async function requireAuth(): Promise<AuthContext> {
    const context = await getOptionalAuth();
    if (!context) {
      throw new AuthError("UNAUTHORIZED", "Authentication required");
    }
    return context;
  }

  return {
    appId: options.appId,
    bridge,
    getOptionalAuth,
    requireAuth,
  };
}

export function createQentrahAuthBridge() {
  return createNextAuthBridge();
}

export async function requireAuth(args: { getOptionalSessionContext: AuthSessionResolver }): Promise<AuthContext> {
  const session = await args.getOptionalSessionContext();
  if (!session) {
    throw new AuthError("UNAUTHORIZED", "Authentication required");
  }
  return authContextFromSessionContext(session.context, session.token);
}
