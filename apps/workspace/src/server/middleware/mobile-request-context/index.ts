import type { Context, Next } from "hono";

export type MobileRequestContext = {
  requestId: string;
  sourceIp?: string;
  userAgent?: string;
  client: "mobile" | "web" | "unknown";
  platform?: string;
  appVersion?: string;
  installationIdHash?: string;
  selectedOrganizationId?: string;
  selectedRegions: string[];
};

function firstHeaderValue(value: string | undefined) {
  return value?.split(",")[0]?.trim() || undefined;
}

function createRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function parseRegionsHeader(value: string | undefined) {
  if (!value) return [];
  return value
    .split(",")
    .map((region) => region.trim())
    .filter(Boolean);
}

function resolveMobileRequestContext(c: Context): MobileRequestContext {
  const requestId = c.req.header("x-request-id")?.trim() || createRequestId();
  const clientHeader = c.req.header("x-qentrah-client")?.trim().toLowerCase();
  const client = clientHeader === "mobile" || clientHeader === "web" ? clientHeader : "unknown";

  return {
    requestId,
    sourceIp:
      firstHeaderValue(c.req.header("cf-connecting-ip"))
      ?? firstHeaderValue(c.req.header("x-forwarded-for"))
      ?? firstHeaderValue(c.req.header("x-real-ip")),
    userAgent: c.req.header("user-agent")?.trim() || undefined,
    client,
    platform: c.req.header("x-qentrah-platform")?.trim() || undefined,
    appVersion: c.req.header("x-qentrah-app-version")?.trim() || undefined,
    installationIdHash: c.req.header("x-qentrah-installation-id")?.trim() || undefined,
    selectedOrganizationId: c.req.header("x-qentrah-organization-id")?.trim() || undefined,
    selectedRegions: parseRegionsHeader(c.req.header("x-qentrah-regions")),
  };
}

function setMobileRequestContext(c: Context, context: MobileRequestContext) {
  (c as any).set("mobileRequestContext", context);
}

export function getMobileRequestContext(c: Context): MobileRequestContext | undefined {
  return (c as any).get("mobileRequestContext") as MobileRequestContext | undefined;
}

export async function mobileRequestContextMiddleware(c: Context, next: Next) {
  const context = resolveMobileRequestContext(c);
  setMobileRequestContext(c, context);
  c.header("x-request-id", context.requestId);
  await next();
}
