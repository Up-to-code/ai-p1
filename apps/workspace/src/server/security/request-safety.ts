import type { Context, Next } from "hono";
import { runWithAuthHeaders } from "@/server/auth/clerk-convex";
import {
  mobileRequestContextMiddleware,
  type MobileRequestContext,
} from "@/server/middleware/mobile-request-context";
import type { CorsPolicyContract, CorsPreflightPolicy } from "./cors-checkers";
import type { SecurityHeaderPolicy } from "./headers-checkers";
import type { TrustedHostPolicy } from "./host-checkers";
import type { OriginCheckPolicy } from "./origin-checkers";
import type { ReferrerPolicyContract } from "./referrer-checkers";

type WorkspaceRequestSafetyPolicy = {
  cors: CorsPolicyContract & CorsPreflightPolicy;
  headers: SecurityHeaderPolicy;
  host: TrustedHostPolicy;
  origin: OriginCheckPolicy;
  referrer: ReferrerPolicyContract;
};

export const workspaceRequestSafetyPolicy: WorkspaceRequestSafetyPolicy = {
  cors: {
    mode: "disabled",
    credentialsAllowed: false,
    allowedMethods: [],
  },
  headers: {
    mode: "disabled",
    policyName: "workspace-default",
  },
  host: {
    mode: "disabled",
    trustedHostRuleIds: [],
  },
  origin: {
    mode: "disabled",
    rules: [],
  },
  referrer: {
    mode: "disabled",
    policyName: "workspace-default",
  },
};

export async function requestSafetyMiddleware(_c: Context, next: Next) {
  await next();
}

export async function organizationRequestSafetyMiddleware(c: Context, next: Next) {
  await mobileRequestContextMiddleware(c, async () => {
    await runWithAuthHeaders(c.req.raw.headers, async () => {
      await next();
    });
  });
}
