import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Id } from "./_generated/dataModel";
import {
  assertPartnerResourceBridgeToken,
  readPartnerResourceThroughGateway,
  writePartnerResourceThroughGateway,
} from "./partnerResourceGateway";

vi.mock("./security/clientPii", () => ({
  protectClientPii: vi.fn(async (_organizationId: string, input: Record<string, string>) => ({
    contact: `redacted:${input.contact}`,
    phone: `redacted:${input.phone}`,
    nationality: `redacted:${input.nationality}`,
    budget: `redacted:${input.budget}`,
    encryptedContact: `encrypted:${input.contact}`,
    encryptedPhone: `encrypted:${input.phone}`,
    encryptedNationality: `encrypted:${input.nationality}`,
    encryptedBudget: `encrypted:${input.budget}`,
    piiEncryptedAt: 1_000,
  })),
  revealClientPii: vi.fn(async () => ({
    contact: "revealed-contact",
    phone: "revealed-phone",
    nationality: "revealed-nationality",
    budget: "revealed-budget",
  })),
}));

function createFakeCtx(seed: Record<string, Record<string, any>[]> = {}) {
  const rowsByTable = new Map<string, any[]>(
    Object.entries(seed).map(([table, rows]) => [table, rows.map((row) => ({ ...row }))]),
  );
  const operations = {
    inserted: [] as Array<{ table: string; doc: any }>,
    patched: [] as Array<{ id: string; patch: any }>,
    scheduled: [] as Array<{ delay: number; args: any }>,
    takeLimits: [] as number[],
  };

  function tableRows(table: string) {
    const rows = rowsByTable.get(table) ?? [];
    rowsByTable.set(table, rows);
    return rows;
  }

  const db = {
    insert: vi.fn(async (table: string, doc: any) => {
      const id = `${table}_${tableRows(table).length + 1}`;
      const stored = { _id: id, _creationTime: 1, ...doc };
      tableRows(table).push(stored);
      operations.inserted.push({ table, doc: stored });
      return id;
    }),
    get: vi.fn(async (id: string) => {
      for (const rows of rowsByTable.values()) {
        const row = rows.find((item) => item._id === id);
        if (row) return row;
      }
      return null;
    }),
    patch: vi.fn(async (id: string, patch: any) => {
      operations.patched.push({ id, patch });
      for (const rows of rowsByTable.values()) {
        const row = rows.find((item) => item._id === id);
        if (row) Object.assign(row, patch);
      }
    }),
    query: vi.fn((table: string) => ({
      withIndex: vi.fn((_index: string, build: any) => {
        build({
          eq: () => ({
            eq: () => ({
              eq: () => undefined,
            }),
          }),
        });
        return {
          take: vi.fn(async (limit: number) => {
            operations.takeLimits.push(limit);
            return tableRows(table).slice(0, limit);
          }),
          unique: vi.fn(async () => tableRows(table)[0] ?? null),
        };
      }),
    })),
  };

  return {
    ctx: {
      db,
      scheduler: {
        runAfter: vi.fn(async (delay: number, _ref: unknown, args: any) => {
          operations.scheduled.push({ delay, args });
        }),
      },
    } as any,
    operations,
    rowsByTable,
  };
}

describe("partner resource gateway", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv("WORKSPACE_CONVEX_BRIDGE_SECRET", "x".repeat(32));
  });

  it("rejects invalid bridge tokens", () => {
    expect(() => assertPartnerResourceBridgeToken("wrong")).toThrow("Invalid server function token.");
    expect(() => assertPartnerResourceBridgeToken("x".repeat(32))).not.toThrow();
  });

  it("preserves read limits and soft-delete filtering", async () => {
    const { ctx, operations } = createFakeCtx({
      clients: [
        { _id: "client_1", organizationId: "org_1", deletedAt: undefined },
        { _id: "client_2", organizationId: "org_1", deletedAt: 123 },
      ],
    });

    await expect(readPartnerResourceThroughGateway(ctx, {
      organizationId: "org_1",
      resource: "client",
      action: "read",
      defaultLimit: 25,
    })).resolves.toEqual([
      expect.objectContaining({ id: "client_1" }),
    ]);
    expect(operations.takeLimits).toEqual([25]);

    await readPartnerResourceThroughGateway(ctx, {
      organizationId: "org_1",
      resource: "client",
      action: "read",
      input: { limit: "7" },
      defaultLimit: 100,
    });
    expect(operations.takeLimits).toEqual([25, 7]);
  });

  it("preserves partner client create audit and outbound webhook enqueue", async () => {
    const { ctx, operations } = createFakeCtx();
    vi.spyOn(Date, "now").mockReturnValue(42);

    const client = await writePartnerResourceThroughGateway(ctx, {
      organizationId: "org_1",
      resource: "client",
      action: "create",
      input: { name: "Mona", contact: "mona@example.com" },
      actor: { type: "partnerApp", partnerAppId: "partners_app_1" },
    });

    expect(client).toMatchObject({
      id: "clients_1",
      createdByUserId: "partner:partners_app_1",
      contact: "redacted:mona@example.com",
    });
    expect(operations.inserted).toContainEqual({
      table: "organizationAuditEvents",
      doc: expect.objectContaining({
        actorType: "partnerApp",
        actorPartnerAppId: "partners_app_1",
        action: "partner.client.create",
        summary: "Created client from partner API.",
      }),
    });
    expect(operations.scheduled).toEqual([
      {
        delay: 0,
        args: expect.objectContaining({
          organizationId: "org_1",
          eventId: "client.created:clients_1:42",
          eventType: "client.created",
        }),
      },
    ]);
  });

  it("preserves organization API key client create audit without webhook enqueue", async () => {
    const { ctx, operations } = createFakeCtx();

    const client = await writePartnerResourceThroughGateway(ctx, {
      organizationId: "org_1",
      resource: "client",
      action: "create",
      input: { name: "API imported client" },
      actor: { type: "apiKey", apiKeyId: "api_key_1" as Id<"organizationApiKeys"> },
    });

    expect(client).toMatchObject({
      id: "clients_1",
      createdByUserId: "apiKey:api_key_1",
      name: "API imported client",
    });
    expect(operations.inserted).toContainEqual({
      table: "organizationAuditEvents",
      doc: expect.objectContaining({
        actorType: "apiKey",
        actorApiKeyId: "api_key_1",
        action: "apiKey.client.create",
        summary: "Created client from organization API key.",
      }),
    });
    expect(operations.scheduled).toEqual([]);
  });

  it("preserves actor-specific update and delete behavior", async () => {
    const { ctx, operations } = createFakeCtx({
      clients: [
        {
          _id: "client_1",
          organizationId: "org_1",
          contact: "redacted",
          phone: "redacted",
          nationality: "redacted",
          budget: "redacted",
          updatedAt: 1,
        },
      ],
    });
    vi.spyOn(Date, "now").mockReturnValue(100);

    await writePartnerResourceThroughGateway(ctx, {
      organizationId: "org_1",
      resource: "client",
      action: "update",
      input: { clientId: "client_1", phone: "555" },
      actor: { type: "apiKey", apiKeyId: "api_key_1" as Id<"organizationApiKeys"> },
    });
    await writePartnerResourceThroughGateway(ctx, {
      organizationId: "org_1",
      resource: "client",
      action: "delete",
      input: { clientId: "client_1" },
      actor: { type: "partnerApp", partnerAppId: "partners_app_1" },
    });

    expect(operations.patched).toContainEqual({
      id: "client_1",
      patch: expect.objectContaining({
        phone: "redacted:555",
        updatedAt: 100,
      }),
    });
    expect(operations.patched).toContainEqual({
      id: "client_1",
      patch: expect.objectContaining({
        deletedAt: 100,
        isDeleted: true,
        updatedAt: 100,
      }),
    });
    expect(operations.scheduled).toEqual([
      {
        delay: 0,
        args: expect.objectContaining({
          eventId: "client.deleted:client_1:100",
          eventType: "client.deleted",
          payload: { id: "client_1", deletedAt: 100 },
        }),
      },
    ]);
  });
});
