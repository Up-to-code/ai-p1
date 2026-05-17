import { NextResponse } from "next/server";
import { clearTokenSession, readTokenSession } from "@/lib/session";
import type { QentrahPartnerResourceRequestOptions } from "@qentrah/auth-sdk/partner/service-app";

export function errorResponse(error: unknown) {
  const status = typeof error === "object" && error && "status" in error ? Number(error.status) : 500;
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "workspace_api_error";
  return NextResponse.json({ error: code, message: error instanceof Error ? error.message : code }, { status });
}

export async function requireDemoSession() {
  const session = await readTokenSession();
  if (!session) return { response: NextResponse.json({ error: "missing_bearer" }, { status: 401 }) };
  if (session.expires_in > 0 && session.obtained_at + session.expires_in * 1000 <= Date.now()) {
    await clearTokenSession();
    return {
      response: NextResponse.json({
        error: "token_expired",
        message: "The stored demo token expired. Authorize again to load Workspace data.",
      }, { status: 401 }),
    };
  }
  return { session };
}

export function limitFromRequest(request: Request) {
  const value = Number(new URL(request.url).searchParams.get("limit") ?? "25");
  return Number.isFinite(value) ? Math.max(1, Math.min(100, Math.floor(value))) : 25;
}

function optionalNumber(params: URLSearchParams, name: string) {
  const raw = params.get(name);
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function optionalString(params: URLSearchParams, name: string) {
  return params.get(name)?.trim() || undefined;
}

export function resourceFiltersFromRequest(request: Request): QentrahPartnerResourceRequestOptions {
  const params = new URL(request.url).searchParams;
  return {
    limit: limitFromRequest(request),
    cursor: optionalString(params, "cursor"),
    search: optionalString(params, "search"),
    type: optionalString(params, "type"),
    status: optionalString(params, "status"),
    startAt: optionalNumber(params, "startAt"),
    endAt: optionalNumber(params, "endAt"),
    indexStart: optionalNumber(params, "indexStart"),
    indexEnd: optionalNumber(params, "indexEnd"),
    resourceType: optionalString(params, "resourceType"),
    resourceId: optionalString(params, "resourceId"),
  };
}
