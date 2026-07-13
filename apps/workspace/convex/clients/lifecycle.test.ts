import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient, deleteClient, updateClient, type ClientInput } from "./lifecycle";

vi.mock("../security/clientPii", () => ({
  protectClientPii: vi.fn(async (_organizationId: string, input: unknown) => input),
  protectClientPiiPatch: vi.fn(async (_organizationId: string, input: unknown) => input),
  revealClientPii: vi.fn(async (client: { email?: string; phone?: string }) => ({
    email: client.email,
    phone: client.phone,
  })),
}));

const baseInput: ClientInput = {
  name: "Acme",
  type: "organization",
  status: "active",
};

function lifecycleContext(seed?: Record<string, unknown>) {
  const clients = new Map<string, Record<string, unknown>>();
  if (seed) clients.set(String(seed._id), { ...seed });
  const audits: Array<Record<string, unknown>> = [];
  const scheduled: Array<Record<string, unknown>> = [];
  let sequence = clients.size;

  const db = {
    get: vi.fn(async (id: string) => clients.get(id) ?? null),
    insert: vi.fn(async (table: string, value: Record<string, unknown>) => {
      if (table === "organizationAuditEvents") {
        audits.push({ ...value });
        return `audit_${audits.length}`;
      }
      const id = `client_${++sequence}`;
      clients.set(id, { _id: id, _creationTime: Date.now(), ...value });
      return id;
    }),
    patch: vi.fn(async (id: string, patch: Record<string, unknown>) => {
      const current = clients.get(id);
      if (!current) throw new Error("missing record");
      clients.set(id, { ...current, ...patch });
    }),
  };
  const scheduler = {
    runAfter: vi.fn(async (_delay: number, _function: unknown, payload: Record<string, unknown>) => {
      scheduled.push(payload);
    }),
  };

  return { ctx: { db, scheduler } as never, clients, audits, scheduled, db };
}

describe("Client lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-13T08:00:00.000Z"));
  });

  it("applies defaults and emits one audit and webhook from the canonical create path", async () => {
    const state = lifecycleContext();
    const client = await createClient(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      input: baseInput,
    });

    expect(client).toMatchObject({
      id: "client_1",
      organizationId: "org_1",
      ownerUserId: "user_1",
      pipelineStage: "new",
      source: "manual",
      visibility: "private",
      recordState: "active",
    });
    expect(state.audits).toEqual([
      expect.objectContaining({ actorUserId: "user_1", action: "client.create", target: "client_1" }),
    ]);
    expect(state.scheduled).toEqual([
      expect.objectContaining({ eventId: expect.stringMatching(/^client\.created:client_1:/u) }),
    ]);
  });

  it("fails closed on a cross-Organization update before patch, audit, or webhook effects", async () => {
    const state = lifecycleContext({
      _id: "client_1",
      organizationId: "org_other",
      name: "Acme",
      recordState: "active",
    });

    await expect(updateClient(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      clientId: "client_1" as never,
      input: { ...baseInput, name: "Changed" },
    })).rejects.toThrow("Client was not found.");

    expect(state.db.patch).not.toHaveBeenCalled();
    expect(state.audits).toHaveLength(0);
    expect(state.scheduled).toHaveLength(0);
  });

  it("rejects an empty patch before loading or mutating a record", async () => {
    const state = lifecycleContext();
    await expect(updateClient(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_1",
      clientId: "client_1" as never,
      input: {},
    })).rejects.toThrow("At least one client field is required.");
    expect(state.db.get).not.toHaveBeenCalled();
  });

  it("patches only supplied fields and preserves existing identity and PII", async () => {
    const state = lifecycleContext({
      _id: "client_1",
      _creationTime: Date.now(),
      organizationId: "org_1",
      name: "Acme",
      type: "organization",
      status: "active",
      email: "redacted@example.com",
      encryptedEmail: "ciphertext",
      ownerUserId: "owner_1",
      source: "referral",
      visibility: "team",
      recordState: "active",
      createdByUserId: "user_1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await updateClient(state.ctx, {
      organizationId: "org_1",
      actorUserId: "user_2",
      clientId: "client_1" as never,
      input: { name: "Acme Group" },
    });

    expect(state.clients.get("client_1")).toMatchObject({
      name: "Acme Group",
      email: "redacted@example.com",
      encryptedEmail: "ciphertext",
      ownerUserId: "owner_1",
      source: "referral",
      visibility: "team",
    });
  });

  it("soft-deletes once and rejects retries without duplicating side effects", async () => {
    const state = lifecycleContext({
      _id: "client_1",
      _creationTime: Date.now(),
      organizationId: "org_1",
      name: "Acme",
      recordState: "active",
    });
    const args = {
      organizationId: "org_1",
      actorUserId: "user_1",
      clientId: "client_1" as never,
    };

    await expect(deleteClient(state.ctx, args)).resolves.toEqual({ removed: true });
    await expect(deleteClient(state.ctx, args)).rejects.toThrow("Client was not found.");

    expect(state.audits).toHaveLength(1);
    expect(state.scheduled).toHaveLength(1);
    expect(state.clients.get("client_1")).toMatchObject({ recordState: "deleted" });
  });
});
