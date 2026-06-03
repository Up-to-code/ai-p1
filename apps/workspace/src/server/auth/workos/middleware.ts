import type { Context, Next } from "hono";
import { resolveWorkOSSessionFromHeaders, type WorkOSResolvedSession } from "./session";

const WORKOS_SESSION_KEY = "workosSession";

export type WorkOSSessionContext = {
  Variables: {
    [WORKOS_SESSION_KEY]: WorkOSResolvedSession;
  };
};

export async function workosSessionMiddleware(c: Context, next: Next) {
  try {
    const session = await resolveWorkOSSessionFromHeaders(c.req.raw.headers);
    c.set(WORKOS_SESSION_KEY, session);
    return next();
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "WorkOS session is invalid." }, 401);
  }
}

export function getWorkOSSession(c: Context) {
  return c.get(WORKOS_SESSION_KEY) as WorkOSResolvedSession | undefined;
}

export function requireWorkspacePermission(permission: string) {
  return async (c: Context, next: Next) => {
    const session = getWorkOSSession(c);
    if (!session) return c.json({ error: "WorkOS session is required." }, 401);
    if (!session.permissions.includes(permission)) {
      return c.json({ error: "Workspace permission denied." }, 403);
    }
    return next();
  };
}

