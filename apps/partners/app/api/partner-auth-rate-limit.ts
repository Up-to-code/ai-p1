import { NextResponse } from "next/server";
import { Effect } from "effect";
import {
  appendRateLimitHeaders,
  createInMemoryRateLimitService,
  rateLimitHeaderRecord,
  rateLimitKey,
  type RateLimitPolicy,
  type RateLimitResult,
} from "@qentrah/platform-core/effect-api";

type PartnerAuthRateLimitKind = "partner-signin" | "partner-signup";

const policies: Record<PartnerAuthRateLimitKind, RateLimitPolicy> = {
  "partner-signin": {
    limit: 10,
    windowMs: 10 * 60 * 1000,
  },
  "partner-signup": {
    limit: 5,
    windowMs: 15 * 60 * 1000,
  },
};

const rateLimitServices = {
  "partner-signin": createInMemoryRateLimitService(),
  "partner-signup": createInMemoryRateLimitService(),
};

function partnerAuthClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
}

export function checkPartnerAuthRateLimit(
  kind: PartnerAuthRateLimitKind,
  request: Request,
  identifier: string,
) {
  return Effect.runSync(rateLimitServices[kind].check(
    rateLimitKey(kind, partnerAuthClientKey(request), identifier),
    policies[kind],
  ));
}

export function partnerAuthRateLimitedResponse(
  result: RateLimitResult,
  body: { error: string; message: string },
) {
  return NextResponse.json(body, {
    status: 429,
    headers: rateLimitHeaderRecord(result),
  });
}

export function partnerAuthJson<TBody>(
  body: TBody,
  init: ResponseInit,
  rateLimit: RateLimitResult,
) {
  return NextResponse.json(body, {
    ...init,
    headers: {
      ...Object.fromEntries(new Headers(init.headers).entries()),
      ...rateLimitHeaderRecord(rateLimit),
    },
  });
}

export function appendPartnerAuthRateLimitHeaders(response: Response, rateLimit: RateLimitResult) {
  appendRateLimitHeaders(response.headers, rateLimit);
}
