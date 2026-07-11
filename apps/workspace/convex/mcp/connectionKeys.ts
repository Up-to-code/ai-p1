import type { MutationCtx, QueryCtx } from "../_generated/server";

function organizationIdFromNamespace(namespace: string) {
  const [, organizationId] = namespace.split(":");
  if (!organizationId) throw new Error("MCP key namespace is invalid.");
  return organizationId;
}

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function createToken(prefix = "qentrah_mcp_") {
  return `${prefix}${crypto.randomUUID().replaceAll("-", "")}${crypto.randomUUID().replaceAll("-", "")}`;
}

export const connectionKeys = {
  async create(
    _ctx: MutationCtx,
    input: {
      namespace: string;
      prefix?: string;
      ttlMs?: number | null;
      name?: string;
      permissions?: Record<string, string[]>;
      metadata?: Record<string, unknown>;
      idleTimeoutMs?: number | null;
    },
  ) {
    const token = createToken(input.prefix);
    return {
      keyId: crypto.randomUUID(),
      token,
      tokenHash: await hashToken(token),
      tokenLast4: token.slice(-4),
      expiresAt: input.ttlMs == null ? undefined : Date.now() + input.ttlMs,
      organizationId: organizationIdFromNamespace(input.namespace),
    };
  },

  async update(_ctx: MutationCtx, _input: Record<string, unknown>) {
    return { ok: true } as const;
  },

  async refresh(
    ctx: MutationCtx,
    input: {
      keyId: string;
      prefix?: string;
      reason?: string;
      metadata?: Record<string, unknown>;
    },
  ) {
    const existing = await ctx.db
      .query("organizationMcpConnections")
      .withIndex("by_key_id", (q) => q.eq("keyId", input.keyId))
      .first();
    if (!existing) return { ok: false as const };

    const token = createToken(input.prefix);
    return {
      ok: true as const,
      keyId: crypto.randomUUID(),
      token,
      tokenHash: await hashToken(token),
      tokenLast4: token.slice(-4),
      expiresAt: existing.expiresAt,
    };
  },

  async validate(ctx: QueryCtx, input: { token: string }) {
    const tokenHash = await hashToken(input.token);
    const connection = await ctx.db
      .query("organizationMcpConnections")
      .withIndex("by_token_hash", (q) => q.eq("tokenHash", tokenHash))
      .first();
    if (!connection) return { ok: false as const, reason: "not_found" };

    return {
      ok: true as const,
      keyId: connection.keyId,
      metadata: {
        kind: "mcpConnection" as const,
        organizationId: connection.organizationId,
        connectionId: connection._id,
      },
    };
  },

  async touch(_ctx: MutationCtx, _input: { keyId: string }) {
    return { ok: true } as const;
  },
};
