import type { Context } from "hono";
import { Effect } from "effect";
import { parseJsonBody, routePromise, routeSync, runEffectRoute } from "@/server/effect/route";
import { oauthClientRuntimeSyncSchema } from "../validation/admin-partner-app.schema";
import {
  assertAdminServiceToken,
  listApprovedPartnerApps,
  syncOAuthClientRuntime,
} from "../services/admin-partner-apps";

const fallbackError = "Partner app admin action failed.";

export async function handleSyncOAuthClientRuntimeFromPartners(c: Context) {
  return runEffectRoute(
    c,
    Effect.gen(function* () {
      yield* routeSync(() => assertAdminServiceToken(c.req.raw.headers), fallbackError);
      const input = yield* parseJsonBody(c, oauthClientRuntimeSyncSchema, "Invalid OAuth client runtime sync payload.");
      const runtime = yield* routePromise(() => syncOAuthClientRuntime(input), fallbackError);
      return { runtime };
    }),
    { fallbackError, status: 201 },
  );
}

export async function handleListApprovedPartnerAppsCatalog(c: Context) {
  return runEffectRoute(
    c,
    routePromise(() => listApprovedPartnerApps(), fallbackError).pipe(Effect.map((apps: any) => ({ apps }))),
    { fallbackError },
  );
}
