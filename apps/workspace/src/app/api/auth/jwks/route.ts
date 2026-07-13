import { resolveAuthBridgeConfig } from "@qentrah/auth/server";
import { z } from "zod";

const jwkSchema = z.object({
  kid: z.string().min(1),
  kty: z.string().min(1),
  alg: z.literal("RS256"),
}).passthrough();

const jwksSchema = z.object({
  keys: z.array(jwkSchema).min(1),
});

/** Publish the Convex-owned Better Auth signing keys at the canonical issuer URL. */
export async function GET() {
  const bridge = resolveAuthBridgeConfig();
  if (!bridge.isConfigured) {
    return Response.json({ error: "auth_configuration_unavailable" }, { status: 503 });
  }

  const upstream = await fetch(`${bridge.convexSiteUrl}/api/auth/convex/jwks`, {
    headers: { accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(5_000),
  }).catch(() => null);

  if (!upstream?.ok) {
    return Response.json({ error: "jwks_unavailable" }, { status: 503 });
  }

  const parsed = jwksSchema.safeParse(await upstream.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "jwks_invalid" }, { status: 503 });
  }

  return Response.json(parsed.data, {
    headers: { "cache-control": "public, max-age=300, stale-while-revalidate=300" },
  });
}
