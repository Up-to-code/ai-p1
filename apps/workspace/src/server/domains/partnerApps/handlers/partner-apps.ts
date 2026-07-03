import type { Context } from "hono";
import { Effect } from "effect";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { parseJsonBody, routePromise, runEffectRoute } from "@/server/effect/route";
import {
  authorizePartnerConnectionSchema,
  createPartnerWebhookEndpointSchema,
  updatePartnerConnectionSchema,
} from "../validation/partner-app.schema";
import {
  authorizePartnerConnection,
  createPartnerWebhookEndpoint,
  listPartnerApps,
  listPartnerConnections,
  revokePartnerConnection,
  updatePartnerConnection,
} from "../services/partner-apps";

const fallbackError = "Partner app action failed.";

export async function handleListPartnerApps(c: Context) {
  return runEffectRoute(
    c,
    routePromise(() => listPartnerApps(), fallbackError).pipe(Effect.map((apps: any) => ({ apps }))),
    { fallbackError },
  );
}

export async function handleAuthorizePartnerConnection(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  return runEffectRoute(
    c,
    Effect.gen(function* () {
      const input = yield* parseJsonBody(c, authorizePartnerConnectionSchema, "Invalid partner authorization payload.");
      const connection = yield* routePromise(() => authorizePartnerConnection(org.organizationId, input), fallbackError);
      return { connection };
    }),
    { fallbackError },
  );
}

export async function handleListPartnerConnections(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  return runEffectRoute(
    c,
    routePromise(() => listPartnerConnections(org.organizationId), fallbackError).pipe(
      Effect.map((connections: any) => ({ connections })),
    ),
    { fallbackError },
  );
}

export async function handleUpdatePartnerConnection(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const connectionId = c.req.param("connectionId");
  if (!connectionId) return c.json({ error: "Connection id is required." }, 400);

  return runEffectRoute(
    c,
    Effect.gen(function* () {
      const input = yield* parseJsonBody(c, updatePartnerConnectionSchema, "Invalid partner connection payload.");
      const connection = yield* routePromise(() => updatePartnerConnection(org.organizationId, connectionId, input), fallbackError);
      return { connection };
    }),
    { fallbackError },
  );
}

export async function handleRevokePartnerConnection(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const connectionId = c.req.param("connectionId");
  if (!connectionId) return c.json({ error: "Connection id is required." }, 400);

  return runEffectRoute(
    c,
    routePromise(() => revokePartnerConnection(org.organizationId, connectionId), fallbackError),
    { fallbackError },
  );
}

export async function handleCreatePartnerWebhookEndpoint(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  return runEffectRoute(
    c,
    Effect.gen(function* () {
      const input = yield* parseJsonBody(c, createPartnerWebhookEndpointSchema, "Invalid partner webhook payload.");
      const endpoint = yield* routePromise(() => createPartnerWebhookEndpoint(org.organizationId, input), fallbackError);
      return { endpoint };
    }),
    { fallbackError, status: 201 },
  );
}
