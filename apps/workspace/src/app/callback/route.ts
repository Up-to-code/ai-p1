import { handleAuth } from "@workos-inc/authkit-nextjs";
import { workosRuntimeConfig } from "@/packages/config";
import { ensureWorkOSProjectedSession, verifyWorkOSAccessToken } from "@/server/auth/workos/session";

function callbackBaseUrl() {
  try {
    return new URL(workosRuntimeConfig.callbackUrl).origin;
  } catch {
    return undefined;
  }
}

function postLoginPathname() {
  try {
    const url = new URL(workosRuntimeConfig.postLoginUrl);
    return `${url.pathname}${url.search}`;
  } catch {
    return "/en";
  }
}

export const GET = handleAuth({
  baseURL: callbackBaseUrl(),
  returnPathname: postLoginPathname(),
  onSuccess: async ({ accessToken, user, organizationId }) => {
    if (!organizationId) return;

    try {
      const claims = await verifyWorkOSAccessToken(accessToken);
      await ensureWorkOSProjectedSession({
        email: typeof user.email === "string" ? user.email : undefined,
        workosUserId: user.id,
        workosOrganizationId: organizationId,
        role: claims.role,
        roles: claims.roles,
        permissions: claims.permissions,
        sessionId: claims.sid,
      });
    } catch (error) {
      console.error("WorkOS callback projection failed", error);
    }
  },
});
