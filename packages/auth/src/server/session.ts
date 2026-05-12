import { createNextAuthBridge } from "@anan/platform-core/auth-next";
import type { SessionContext } from "@anan/platform-core/session";
import { AuthError, type AuthContext } from "../types";
import { authContextFromSessionContext } from "./claims";

export { resolveAuthBridgeConfig } from "@anan/platform-core/auth-next";

export type ResolvedAuthSession = {
  token: string;
  context: SessionContext;
};

export type AuthSessionResolver = () => Promise<ResolvedAuthSession | null>;

export type AnanAuthServerOptions = {
  appId: "web" | "admin" | "external-apps" | string;
  getOptionalSessionContext?: AuthSessionResolver;
};

export function createAnanAuthServer(options: AnanAuthServerOptions) {
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

export function createAnanAuthBridge() {
  return createNextAuthBridge();
}

export async function requireAuth(args: { getOptionalSessionContext: AuthSessionResolver }): Promise<AuthContext> {
  const session = await args.getOptionalSessionContext();
  if (!session) {
    throw new AuthError("UNAUTHORIZED", "Authentication required");
  }
  return authContextFromSessionContext(session.context, session.token);
}
