import type { Context } from "hono";
import { Effect } from "effect";
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
    routePromise(() => listPartnerApps(), fallbackError).pipe(Effect.map((apps) => ({ apps }))),
    { fallbackError },
  );
}

export async function handleAuthorizePartnerConnection(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  return runEffectRoute(
    c,
    Effect.gen(function* () {
      const input = yield* parseJsonBody(c, authorizePartnerConnectionSchema, "Invalid partner authorization payload.");
      const connection = yield* routePromise(() => authorizePartnerConnection(organizationId, input), fallbackError);
      return { connection };
    }),
    { fallbackError },
  );
}

export async function handleListPartnerConnections(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  return runEffectRoute(
    c,
    routePromise(() => listPartnerConnections(organizationId), fallbackError).pipe(
      Effect.map((connections) => ({ connections })),
    ),
    { fallbackError },
  );
}

export async function handleUpdatePartnerConnection(c: Context) {
  const organizationId = c.req.param("organizationId");
  const connectionId = c.req.param("connectionId");
  if (!organizationId || !connectionId) return c.json({ error: "Organization and connection ids are required." }, 400);

  return runEffectRoute(
    c,
    Effect.gen(function* () {
      const input = yield* parseJsonBody(c, updatePartnerConnectionSchema, "Invalid partner connection payload.");
      const connection = yield* routePromise(() => updatePartnerConnection(organizationId, connectionId, input), fallbackError);
      return { connection };
    }),
    { fallbackError },
  );
}

export async function handleRevokePartnerConnection(c: Context) {
  const organizationId = c.req.param("organizationId");
  const connectionId = c.req.param("connectionId");
  if (!organizationId || !connectionId) return c.json({ error: "Organization and connection ids are required." }, 400);

  return runEffectRoute(
    c,
    routePromise(() => revokePartnerConnection(organizationId, connectionId), fallbackError),
    { fallbackError },
  );
}

export async function handleCreatePartnerWebhookEndpoint(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) return c.json({ error: "Organization id is required." }, 400);

  return runEffectRoute(
    c,
    Effect.gen(function* () {
      const input = yield* parseJsonBody(c, createPartnerWebhookEndpointSchema, "Invalid partner webhook payload.");
      const endpoint = yield* routePromise(() => createPartnerWebhookEndpoint(organizationId, input), fallbackError);
      return { endpoint };
    }),
    { fallbackError, status: 201 },
  );
}
