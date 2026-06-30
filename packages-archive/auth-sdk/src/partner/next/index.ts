import {
  completeQentrahPartnerAuthorization,
  createQentrahPartnerAuthorizationRedirect,
  DEFAULT_QENTRAH_PARTNER_ERROR_PATH,
  DEFAULT_QENTRAH_PARTNER_SUCCESS_PATH,
} from "../core.js";
import { isQentrahPartnerAuthError } from "../errors.js";
import type { QentrahPartnerAuthConfig } from "../types.js";

function redirectUrl(request: Request, target: string, error?: string) {
  const url = new URL(target, request.url);
  if (error) url.searchParams.set("qentrah_error", error);
  return url;
}

export function createQentrahPartnerAuthHandlers(config: QentrahPartnerAuthConfig) {
  return {
    async start(request: Request) {
      return Response.redirect(await createQentrahPartnerAuthorizationRedirect(request, config), 302);
    },
    async callback(request: Request) {
      try {
        await completeQentrahPartnerAuthorization(request, config);
        return Response.redirect(redirectUrl(request, config.afterSuccessRedirect ?? DEFAULT_QENTRAH_PARTNER_SUCCESS_PATH), 302);
      } catch (error) {
        const message = isQentrahPartnerAuthError(error)
          ? error.message
          : error instanceof Error
            ? error.message
            : "Qentrah authorization failed.";
        return Response.redirect(redirectUrl(request, config.afterErrorRedirect ?? DEFAULT_QENTRAH_PARTNER_ERROR_PATH, message), 302);
      }
    },
  };
}
