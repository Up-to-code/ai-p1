import { buildAuthBridgeHeaders } from "@qentrah/web-foundation/api";

type AuthRequestContext = Pick<Request, "headers" | "url"> & {
  nextUrl: Pick<URL, "origin">;
};

function getPartnersAuthOrigin(request: AuthRequestContext) {
  return process.env.NEXT_PUBLIC_PARTNERS_AUTH_URL?.trim()
    || process.env.BETTER_AUTH_URL?.trim()
    || request.headers.get("origin")
    || request.nextUrl.origin
    || process.env.SITE_URL?.trim()
    || "http://localhost:3002";
}

export function buildSameOriginAuthHeaders(request: AuthRequestContext): HeadersInit {
  const origin = getPartnersAuthOrigin(request);
  return {
    "content-type": "application/json",
    cookie: request.headers.get("cookie") ?? "",
    origin,
    referer: request.url,
  };
}

export function buildTrustedSignupHeaders({
  request,
  bridgeHeader,
  bridgeSecret,
}: {
  request: AuthRequestContext;
  bridgeHeader: string;
  bridgeSecret: string;
}) {
  return buildAuthBridgeHeaders({
    bridgeHeader,
    bridgeSecret,
    cookie: request.headers.get("cookie"),
    origin: getPartnersAuthOrigin(request),
    requestUrl: request.url,
  });
}
