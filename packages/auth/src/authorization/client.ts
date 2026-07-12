import { brandLabel } from "@qentrah/brand-identity";

import { QentrahAuthorizationError } from "./errors.js";
import { createPkcePair, createRandomString } from "../client/pkce.js";
import type {
  QentrahAuthorizationClientOptions,
  QentrahAuthorizeOptions,
  QentrahAuthorizeCodeResult,
  QentrahAuthorizeResult,
} from "./types.js";
import { buildAuthorizeUrl, normalizeIssuer } from "./url.js";

type PendingAuthorization = {
  state: string;
  redirectUri: string;
  resolve: (result: QentrahAuthorizeResult) => void;
  reject: (error: unknown) => void;
  popup: Window | null;
  timer: ReturnType<typeof setTimeout>;
};

function getPopupFeatures(width = 520, height = 720) {
  const left = typeof window !== "undefined" ? window.screenX + Math.max(0, (window.outerWidth - width) / 2) : 0;
  const top = typeof window !== "undefined" ? window.screenY + Math.max(0, (window.outerHeight - height) / 2) : 0;
  return `popup=yes,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)},noopener=no,noreferrer=no`;
}

function parseMessageResult(data: unknown): QentrahAuthorizeResult | null {
  if (!data || typeof data !== "object") return null;
  const value = data as Record<string, unknown>;
  if (value.type !== "qentrah.authorization.result") return null;
  if (typeof value.code !== "string" || typeof value.state !== "string" || typeof value.redirectUri !== "string") {
    return null;
  }
  return {
    code: value.code,
    state: value.state,
    redirectUri: value.redirectUri,
  };
}

function parseMessageError(data: unknown): QentrahAuthorizationError | null {
  if (!data || typeof data !== "object") return null;
  const value = data as Record<string, unknown>;
  if (value.type !== "qentrah.authorization.result" || typeof value.error !== "string") return null;
  const code = value.error;
  if (
    code !== "access_denied" &&
    code !== "invalid_state" &&
    code !== "invalid_scope" &&
    code !== "inactive_client" &&
    code !== "authorization_expired"
  ) {
    return new QentrahAuthorizationError("invalid_response", String(value.error_description ?? "Authorization failed"));
  }
  return new QentrahAuthorizationError(code, String(value.error_description ?? value.error));
}

function fallbackToRedirect(url: string, emit: QentrahAuthorizationClientOptions["onEvent"]): never {
  emit?.({ type: "redirect_fallback", url });
  window.location.assign(url);
  throw new QentrahAuthorizationError("popup_blocked", `Redirecting to ${brandLabel("en")} authorization`);
}

async function waitForPopupResult(args: {
  url: string;
  issuer: string;
  state: string;
  redirectUri: string;
  popupOptions: NonNullable<QentrahAuthorizationClientOptions["popup"]>;
  emit?: QentrahAuthorizationClientOptions["onEvent"];
}): Promise<QentrahAuthorizeResult> {
  if (typeof window === "undefined") {
    throw new QentrahAuthorizationError("popup_blocked", "Popup authorization requires a browser window");
  }

  const popup = window.open(args.url, "qentrah_authorization", getPopupFeatures(args.popupOptions.width, args.popupOptions.height));
  if (!popup) {
    return fallbackToRedirect(args.url, args.emit);
  }
  args.emit?.({ type: "popup_opened" });

  const issuerOrigin = new URL(normalizeIssuer(args.issuer)).origin;
  return new Promise((resolve, reject) => {
    const pending: PendingAuthorization = {
      state: args.state,
      redirectUri: args.redirectUri,
      resolve,
      reject,
      popup,
      timer: setTimeout(() => {
        cleanup();
        reject(new QentrahAuthorizationError("popup_blocked", "Authorization popup timed out"));
      }, args.popupOptions.timeoutMs ?? 5 * 60 * 1000),
    };

    const closePoll = setInterval(() => {
      if (pending.popup?.closed) {
        cleanup();
        args.emit?.({ type: "popup_closed" });
        reject(new QentrahAuthorizationError("access_denied", "Authorization popup was closed"));
      }
    }, 500);

    function cleanup() {
      window.removeEventListener("message", onMessage);
      clearTimeout(pending.timer);
      clearInterval(closePoll);
    }

    function onMessage(event: MessageEvent) {
      if (event.origin !== issuerOrigin) return;
      const messageError = parseMessageError(event.data);
      if (messageError) {
        cleanup();
        pending.popup?.close();
        reject(messageError);
        return;
      }
      const result = parseMessageResult(event.data);
      if (!result) return;
      cleanup();
      pending.popup?.close();
      if (result.state !== pending.state) {
        reject(new QentrahAuthorizationError("invalid_state", "Authorization state mismatch"));
        return;
      }
      args.emit?.({ type: "authorized", result });
      resolve(result);
    }

    window.addEventListener("message", onMessage);
  });
}

export function createQentrahAuthorizationClient(options: QentrahAuthorizationClientOptions) {
  async function authorize(overrides: QentrahAuthorizeOptions = {}): Promise<QentrahAuthorizeCodeResult> {
    const pkce = await createPkcePair();
    const state = overrides.state ?? createRandomString(32);
    const redirectUri = overrides.redirectUri ?? options.redirectUri;
    const scopes = [...(overrides.scopes ?? options.scopes)];
    const url = buildAuthorizeUrl({
      issuer: options.issuer,
      clientId: options.clientId,
      redirectUri,
      scopes,
      state,
      codeChallenge: pkce.codeChallenge,
      nonce: overrides.nonce,
      sourceApp: overrides.sourceApp ?? options.sourceApp,
    });
    options.onEvent?.({ type: "authorize_url_created", url });

    if (overrides.popup === false) {
      return fallbackToRedirect(url, options.onEvent);
    }

    const result = await waitForPopupResult({
      url,
      issuer: options.issuer,
      state,
      redirectUri,
      popupOptions: typeof overrides.popup === "object" ? overrides.popup : options.popup ?? {},
      emit: options.onEvent,
    });
    return {
      ...result,
      codeVerifier: pkce.codeVerifier,
    };
  }

  return {
    authorize,
    buildAuthorizeUrl: async (overrides: QentrahAuthorizeOptions = {}) => {
      const pkce = await createPkcePair();
      const state = overrides.state ?? createRandomString(32);
      const redirectUri = overrides.redirectUri ?? options.redirectUri;
      return {
        url: buildAuthorizeUrl({
          issuer: options.issuer,
          clientId: options.clientId,
          redirectUri,
          scopes: [...(overrides.scopes ?? options.scopes)],
          state,
          codeChallenge: pkce.codeChallenge,
          nonce: overrides.nonce,
          sourceApp: overrides.sourceApp ?? options.sourceApp,
        }),
        state,
        codeVerifier: pkce.codeVerifier,
      };
    },
  };
}
