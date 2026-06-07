import { prisma } from "@/lib/prisma";
import { randomToken } from "@/server/partnerRuntime";

function jsonInput(value: unknown): never {
  return value as never;
}

type SandboxRequestLogRow = {
  id: string;
  method: string;
  path: string;
  status: number;
  latencyMs: number | null;
  scopes: string[];
  input: unknown;
  response: unknown;
  error: string | null;
  createdAt: Date;
};

const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const AUTH_CODE_TTL_MS = 10 * 60 * 1000;

const sandboxResourceTypes = ["organization", "client", "asset", "project", "task", "calendar", "media"] as const;
const sandboxActions = ["read", "create", "update", "delete"] as const;
const sandboxScopes = sandboxResourceTypes.flatMap((resource) => sandboxActions.map((action) => `${resource}:${action}`));

export type SandboxResourceType = typeof sandboxResourceTypes[number];
export type SandboxAction = typeof sandboxActions[number];

function scopeFor(resource: SandboxResourceType, action: SandboxAction) {
  return `${resource}:${action}`;
}

function normalizeRequestedScopes(scopes: string[]) {
  const requested = scopes.map((scope) => scope.trim()).filter(Boolean);
  const normalized = requested.length ? [...new Set(requested)].sort() : sandboxScopes;
  for (const scope of normalized) {
    if (!sandboxScopes.includes(scope)) throw new Error(`Sandbox scope is not supported: ${scope}`);
  }
  return normalized;
}

function presentResource(resource: {
  id: string;
  resourceType: string;
  data: unknown;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}) {
  return {
    id: resource.id,
    resourceType: resource.resourceType,
    data: resource.data,
    createdAt: resource.createdAt.getTime(),
    updatedAt: resource.updatedAt.getTime(),
    deletedAt: resource.deletedAt?.getTime() ?? null,
  };
}

async function requireOwnedAppById(appId: string, authSubject: string) {
  const app = await prisma.partnerApp.findFirst({
    where: {
      partnerAuthSubject: authSubject,
      OR: [{ id: appId }, { clientId: appId }],
    },
  });
  if (!app) throw new Error("Partner app not found");
  return app;
}

async function findOwnedAppByClientId(clientId: string, authSubject: string) {
  const app = await prisma.partnerApp.findUnique({ where: { clientId } });
  if (!app || app.partnerAuthSubject !== authSubject) throw new Error("Partner app not found");
  return app;
}

async function requireSandboxOrganization(organizationId: string, partnerAppId?: string) {
  const organization = await prisma.sandboxOrganization.findUnique({ where: { organizationId } });
  if (!organization) throw new Error("Sandbox organization was not found.");
  if (partnerAppId && organization.partnerAppId !== partnerAppId) {
    throw new Error("Sandbox organization does not belong to this app.");
  }
  return organization;
}

async function seedSandbox(app: { id: string; partnerAuthSubject: string; name: string }, organizationId: string) {
  const now = new Date();
  const seeds: Array<{ resourceType: SandboxResourceType; data: Record<string, unknown> }> = [
    { resourceType: "client", data: { name: "Sandbox Buyer", email: "buyer@sandbox.local", status: "active" } },
    { resourceType: "asset", data: { title: "Sandbox Asset", city: "Riyadh", price: "850000" } },
    { resourceType: "project", data: { name: "Sandbox Project", stage: "planning" } },
    { resourceType: "task", data: { title: "Follow up with sandbox lead", status: "open" } },
    { resourceType: "calendar", data: { title: "Sandbox showing", startsAt: new Date(Date.now() + 86_400_000).toISOString() } },
    { resourceType: "media", data: { name: "sandbox-brochure.pdf", resourceType: "asset", url: "https://partners.qentrah.local/sandbox/media/demo.pdf" } },
  ];

  await prisma.sandboxResource.createMany({
    data: seeds.map((seed) => ({
      partnerAuthSubject: app.partnerAuthSubject,
      partnerAppId: app.id,
      organizationId,
      resourceType: seed.resourceType,
      data: jsonInput(seed.data),
      createdAt: now,
      updatedAt: now,
    })),
  });
}

async function ensureSandboxOrganization(app: { id: string; partnerAuthSubject: string; name: string }) {
  const existing = await prisma.sandboxOrganization.findFirst({ where: { partnerAppId: app.id } });
  if (existing) return existing;

  const organizationId = randomToken("sandbox_org", 12);
  const organization = await prisma.sandboxOrganization.create({
    data: {
      partnerAuthSubject: app.partnerAuthSubject,
      partnerAppId: app.id,
      organizationId,
      name: `${app.name} Sandbox`,
    },
  });
  await seedSandbox(app, organization.organizationId);
  return organization;
}

export const sandboxStore = {
  async get(authSubject: string, appId: string) {
    const app = await requireOwnedAppById(appId, authSubject);
    const organization = await prisma.sandboxOrganization.findFirst({ where: { partnerAppId: app.id } });
    const logs = await prisma.sandboxRequestLog.findMany({
      where: { partnerAppId: app.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }) as SandboxRequestLogRow[];
    return {
      organization: organization
        ? {
            id: organization.id,
            organizationId: organization.organizationId,
            name: organization.name,
            createdAt: organization.createdAt.getTime(),
            updatedAt: organization.updatedAt.getTime(),
          }
        : null,
      scopes: sandboxScopes,
      logs: logs.map((log) => ({
        id: log.id,
        method: log.method,
        path: log.path,
        status: log.status,
        latencyMs: log.latencyMs,
        scopes: log.scopes,
        input: log.input,
        response: log.response,
        error: log.error ?? undefined,
        createdAt: log.createdAt.getTime(),
      })),
    };
  },

  async ensure(authSubject: string, appId: string) {
    const app = await requireOwnedAppById(appId, authSubject);
    const organization = await ensureSandboxOrganization(app);
    return { organizationId: organization.organizationId, name: organization.name, scopes: sandboxScopes };
  },

  async createAuthorizationCode(authSubject: string, input: {
    clientId: string;
    redirectUri: string;
    scopes: string[];
    codeChallenge: string;
    codeChallengeMethod: "S256";
  }) {
    const app = await findOwnedAppByClientId(input.clientId, authSubject);
    if (!app.redirectUris.includes(input.redirectUri)) throw new Error("Redirect URI is not registered for this app.");
    if (!input.codeChallenge.trim()) throw new Error("PKCE code challenge is required.");
    const organization = await ensureSandboxOrganization(app);
    const code = randomToken("sandbox_code", 24);
    await prisma.sandboxOAuthCode.create({
      data: {
        partnerAuthSubject: authSubject,
        partnerAppId: app.id,
        organizationId: organization.organizationId,
        code,
        clientId: app.clientId,
        redirectUri: input.redirectUri,
        scopes: normalizeRequestedScopes(input.scopes),
        codeChallenge: input.codeChallenge,
        codeChallengeMethod: "S256",
        expiresAt: new Date(Date.now() + AUTH_CODE_TTL_MS),
      },
    });
    return { code, redirectUri: input.redirectUri, organizationId: organization.organizationId };
  },

  async exchangeAuthorizationCode(input: {
    code: string;
    clientId: string;
    redirectUri: string;
    codeChallenge: string;
    accessTokenHash: string;
    refreshTokenHash: string;
  }) {
    const code = await prisma.sandboxOAuthCode.findUnique({ where: { code: input.code } });
    const now = new Date();
    if (!code || code.clientId !== input.clientId || code.redirectUri !== input.redirectUri) throw new Error("Sandbox authorization code is invalid.");
    if (code.consumedAt || code.expiresAt <= now) throw new Error("Sandbox authorization code is expired or already used.");
    if (code.codeChallenge !== input.codeChallenge) throw new Error("PKCE verification failed.");
    await prisma.$transaction([
      prisma.sandboxOAuthCode.update({ where: { id: code.id }, data: { consumedAt: now } }),
      prisma.sandboxOAuthToken.create({
        data: {
          partnerAuthSubject: code.partnerAuthSubject,
          partnerAppId: code.partnerAppId,
          organizationId: code.organizationId,
          accessTokenHash: input.accessTokenHash,
          refreshTokenHash: input.refreshTokenHash,
          clientId: input.clientId,
          scopes: code.scopes,
          status: "active",
          accessExpiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS),
          refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        },
      }),
    ]);
    return { organizationId: code.organizationId, scopes: code.scopes, expiresIn: ACCESS_TOKEN_TTL_MS / 1000 };
  },

  async rotateRefreshToken(input: {
    refreshTokenHash: string;
    accessTokenHash: string;
    nextRefreshTokenHash: string;
  }) {
    const existing = await prisma.sandboxOAuthToken.findUnique({ where: { refreshTokenHash: input.refreshTokenHash } });
    if (!existing || existing.status !== "active" || !existing.refreshExpiresAt || existing.refreshExpiresAt <= new Date()) {
      throw new Error("Sandbox refresh token is invalid or expired.");
    }
    await prisma.$transaction([
      prisma.sandboxOAuthToken.update({ where: { id: existing.id }, data: { status: "rotated" } }),
      prisma.sandboxOAuthToken.create({
        data: {
          partnerAuthSubject: existing.partnerAuthSubject,
          partnerAppId: existing.partnerAppId,
          organizationId: existing.organizationId,
          accessTokenHash: input.accessTokenHash,
          refreshTokenHash: input.nextRefreshTokenHash,
          clientId: existing.clientId,
          scopes: existing.scopes,
          status: "active",
          accessExpiresAt: new Date(Date.now() + ACCESS_TOKEN_TTL_MS),
          refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        },
      }),
    ]);
    return { organizationId: existing.organizationId, scopes: existing.scopes, expiresIn: ACCESS_TOKEN_TTL_MS / 1000 };
  },

  async validateAccess(input: { accessTokenHash: string; organizationId: string; resource: SandboxResourceType; action: SandboxAction }) {
    const token = await prisma.sandboxOAuthToken.findUnique({ where: { accessTokenHash: input.accessTokenHash } });
    if (!token || token.status !== "active") return { ok: false as const, reason: "invalid_token" };
    if (token.organizationId !== input.organizationId) return { ok: false as const, reason: "wrong_organization" };
    if (token.accessExpiresAt <= new Date()) return { ok: false as const, reason: "token_expired" };
    if (!token.scopes.includes(scopeFor(input.resource, input.action))) return { ok: false as const, reason: "scope_denied" };
    const app = await prisma.partnerApp.findUnique({ where: { id: token.partnerAppId } });
    return {
      ok: true as const,
      partnerAuthSubject: token.partnerAuthSubject,
      partnerAppId: token.partnerAppId,
      organizationId: token.organizationId,
      clientId: token.clientId,
      scopes: token.scopes,
      appName: app?.name,
    };
  },

  async readResource(input: { partnerAppId?: string; organizationId: string; resource: SandboxResourceType; resourceId?: string; limit?: number }) {
    const organization = await requireSandboxOrganization(input.organizationId, input.partnerAppId);
    if (input.resource === "organization") {
      return {
        id: organization.organizationId,
        name: organization.name,
        mode: "sandbox",
        createdAt: organization.createdAt.getTime(),
        updatedAt: organization.updatedAt.getTime(),
      };
    }
    if (input.resourceId) {
      const resource = await prisma.sandboxResource.findUnique({ where: { id: input.resourceId } });
      if (!resource || resource.organizationId !== input.organizationId || resource.resourceType !== input.resource || resource.deletedAt) return null;
      return presentResource(resource);
    }
    const rows = await prisma.sandboxResource.findMany({
      where: {
        organizationId: input.organizationId,
        resourceType: input.resource,
        deletedAt: null,
      },
      orderBy: { createdAt: "asc" },
      take: Math.max(1, Math.min(100, Math.floor(input.limit ?? 25))),
    });
    return rows.map(presentResource);
  },

  async writeResource(input: {
    partnerAppId: string;
    organizationId: string;
    resource: SandboxResourceType;
    action: SandboxAction;
    resourceId?: string;
    input?: unknown;
  }) {
    if (input.resource === "organization" || input.action === "read") throw new Error("Use the sandbox read endpoint for this operation.");
    const app = await prisma.partnerApp.findUnique({ where: { id: input.partnerAppId } });
    if (!app) throw new Error("Sandbox app was not found.");
    await requireSandboxOrganization(input.organizationId, input.partnerAppId);
    if (input.action === "create") {
      const resource = await prisma.sandboxResource.create({
        data: {
          partnerAuthSubject: app.partnerAuthSubject,
          partnerAppId: app.id,
          organizationId: input.organizationId,
          resourceType: input.resource,
          data: jsonInput(input.input ?? {}),
        },
      });
      return presentResource(resource);
    }
    const existing = input.resourceId ? await prisma.sandboxResource.findUnique({ where: { id: input.resourceId } }) : null;
    if (!existing || existing.organizationId !== input.organizationId || existing.resourceType !== input.resource || existing.deletedAt) {
      throw new Error("Sandbox resource was not found.");
    }
    if (input.action === "update") {
      const resource = await prisma.sandboxResource.update({
        where: { id: existing.id },
        data: {
          data: jsonInput({ ...((existing.data as Record<string, unknown>) ?? {}), ...((input.input as Record<string, unknown>) ?? {}) }),
        },
      });
      return presentResource(resource);
    }
    if (input.action === "delete") {
      await prisma.sandboxResource.update({ where: { id: existing.id }, data: { deletedAt: new Date() } });
      return { deleted: true, id: existing.id };
    }
    throw new Error("Unsupported sandbox action.");
  },

  async recordRequestLog(input: {
    partnerAuthSubject?: string;
    partnerAppId?: string;
    organizationId?: string;
    method: string;
    path: string;
    status: number;
    latencyMs: number;
    scopes: string[];
    input?: unknown;
    response?: unknown;
    error?: string;
  }) {
    await prisma.sandboxRequestLog.create({
      data: {
        partnerAuthSubject: input.partnerAuthSubject,
        partnerAppId: input.partnerAppId,
        organizationId: input.organizationId,
        method: input.method,
        path: input.path,
        status: input.status,
        latencyMs: input.latencyMs,
        scopes: input.scopes,
        input: input.input === undefined ? undefined : jsonInput(input.input),
        response: input.response === undefined ? undefined : jsonInput(input.response),
        error: input.error,
      },
    });
    return { ok: true as const };
  },
};
