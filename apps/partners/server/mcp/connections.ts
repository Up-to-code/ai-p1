import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { ensurePartnerProfile } from "@/server/partnerRuntime";
import { partnerMcpConnectionInputSchema, partnerMcpConnectionUpdateSchema, type PartnerMcpPermission } from "./permissions";
import type { PartnerMcpConnectionInput, PartnerMcpConnectionUpdate } from "./permissions";

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function token(prefix: string, bytes = 24) {
  return `${prefix}_${randomBytes(bytes).toString("base64url")}`;
}

function toMillis(value: Date | null | undefined) {
  return value ? value.getTime() : undefined;
}

function normalizePermissions(value: unknown): PartnerMcpPermission[] {
  const parsed = partnerMcpConnectionInputSchema.shape.permissions.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function present(connection: {
  id: string;
  programmerOrganizationId: string;
  publicId: string;
  keyLast4: string;
  name: string;
  instructions: string | null;
  permissions: unknown;
  status: string;
  usageCount: number;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: connection.id,
    organizationId: connection.programmerOrganizationId,
    publicId: connection.publicId,
    keyLast4: connection.keyLast4,
    name: connection.name,
    instructions: connection.instructions ?? undefined,
    permissions: normalizePermissions(connection.permissions),
    status: connection.status as "active" | "paused" | "revoked",
    usageCount: connection.usageCount,
    lastUsedAt: toMillis(connection.lastUsedAt),
    expiresAt: toMillis(connection.expiresAt),
    revokedAt: toMillis(connection.revokedAt),
    createdAt: connection.createdAt.getTime(),
    updatedAt: connection.updatedAt.getTime(),
  };
}

async function requireProgrammerOrganization(authSubject: string) {
  await ensurePartnerProfile({ subject: authSubject });
  const organization = await prisma.programmerOrganization.findUnique({
    where: { ownerAuthSubject: authSubject },
  });
  if (!organization) throw new Error("Create a programmer organization before creating an MCP link.");
  return organization;
}

function mcpUrl(origin: string, publicId: string, secret: string) {
  return `${origin.replace(/\/+$/u, "")}/api/mcp/partner/${encodeURIComponent(publicId)}/${encodeURIComponent(secret)}`;
}

export const partnerMcpConnectionsRepository = {
  async list(authSubject: string) {
    const organization = await requireProgrammerOrganization(authSubject);
    const connections = await prisma.partnerMcpConnection.findMany({
      where: { programmerOrganizationId: organization.id },
      orderBy: { updatedAt: "desc" },
    });
    return connections.map(present);
  },

  async create(authSubject: string, input: PartnerMcpConnectionInput, origin: string) {
    const organization = await requireProgrammerOrganization(authSubject);
    const parsed = partnerMcpConnectionInputSchema.parse(input);
    const publicId = token("partner_mcp", 16);
    const secret = token("mcp_secret", 28);
    const connection = await prisma.partnerMcpConnection.create({
      data: {
        partnerAuthSubject: authSubject,
        programmerOrganizationId: organization.id,
        publicId,
        secretHash: sha256(secret),
        keyLast4: secret.slice(-4),
        name: parsed.name,
        instructions: parsed.instructions,
        permissions: parsed.permissions,
        status: "active",
        expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
      },
    });
    return { connection: present(connection), mcpUrl: mcpUrl(origin, publicId, secret) };
  },

  async update(authSubject: string, connectionId: string, input: PartnerMcpConnectionUpdate) {
    const organization = await requireProgrammerOrganization(authSubject);
    const parsed = partnerMcpConnectionUpdateSchema.parse(input);
    const current = await prisma.partnerMcpConnection.findFirst({
      where: { id: connectionId, programmerOrganizationId: organization.id },
    });
    if (!current) throw new Error("MCP link was not found.");
    if (current.status === "revoked") throw new Error("Revoked MCP links cannot be updated.");

    const connection = await prisma.partnerMcpConnection.update({
      where: { id: current.id },
      data: {
        name: parsed.name,
        instructions: "instructions" in parsed ? parsed.instructions : undefined,
        permissions: parsed.permissions,
        status: parsed.status,
        expiresAt: parsed.expiresAt === null ? null : parsed.expiresAt ? new Date(parsed.expiresAt) : undefined,
      },
    });
    return present(connection);
  },

  async revoke(authSubject: string, connectionId: string) {
    const organization = await requireProgrammerOrganization(authSubject);
    const current = await prisma.partnerMcpConnection.findFirst({
      where: { id: connectionId, programmerOrganizationId: organization.id },
    });
    if (!current) throw new Error("MCP link was not found.");
    await prisma.partnerMcpConnection.update({
      where: { id: current.id },
      data: { status: "revoked", revokedAt: new Date() },
    });
    return { revoked: true as const };
  },

  async rotate(authSubject: string, connectionId: string, origin: string) {
    const organization = await requireProgrammerOrganization(authSubject);
    const current = await prisma.partnerMcpConnection.findFirst({
      where: { id: connectionId, programmerOrganizationId: organization.id },
    });
    if (!current) throw new Error("MCP link was not found.");
    if (current.status === "revoked") throw new Error("Revoked MCP links cannot be rotated.");
    const secret = token("mcp_secret", 28);
    const connection = await prisma.partnerMcpConnection.update({
      where: { id: current.id },
      data: { secretHash: sha256(secret), keyLast4: secret.slice(-4), status: "active", revokedAt: null },
    });
    return { connection: present(connection), mcpUrl: mcpUrl(origin, connection.publicId, secret) };
  },

  async authenticate(publicId: string, secret: string) {
    const connection = await prisma.partnerMcpConnection.findUnique({ where: { publicId } });
    if (!connection || !safeEqual(sha256(secret), connection.secretHash)) throw new Error("Invalid MCP link.");
    if (connection.status !== "active") throw new Error("MCP link is not active.");
    if (connection.expiresAt && connection.expiresAt.getTime() <= Date.now()) throw new Error("MCP link has expired.");
    return { raw: connection, connection: present(connection), authSubject: connection.partnerAuthSubject };
  },

  async markUsed(connectionId: string) {
    await prisma.partnerMcpConnection.update({
      where: { id: connectionId },
      data: { usageCount: { increment: 1 }, lastUsedAt: new Date() },
    });
  },

  async log(input: { connectionId?: string; publicId?: string; method: string; status: number; latencyMs: number; toolName?: string; error?: string }) {
    await prisma.partnerMcpRequestLog.create({ data: input }).catch(() => undefined);
  },
};
