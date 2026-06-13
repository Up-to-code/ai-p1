import type { MutationCtx, QueryCtx } from "../_generated/server";
import {
  encryptedPlaceholder,
  protectOrganizationJson,
  protectOrganizationText,
  redactSensitiveText,
} from "./organizationData";
import { protectClientPii } from "./clientPii";

export const BACKFILL_TARGETS = [
  "clientsDeletedFlag",
  "projectsDeletedFlag",
  "clientPii",
  "webhookDeliveries",
  "inboundEvents",
  "agentMessages",
  "agentMemorySummaries",
  "agentMemoryFacts",
] as const;

export type BackfillTarget = typeof BACKFILL_TARGETS[number];

export type BackfillPatch = {
  id: string;
  patch: Record<string, unknown>;
};

export type BackfillPatchResult = {
  patches: BackfillPatch[];
  failures: Array<{ id: string; error: string }>;
};

type BackfillRow = Record<string, any>;
type PaginationOpts = { numItems: number; cursor: string | null };
type BackfillTargetAdapter = {
  table:
    | "clients"
    | "projects"
    | "partnerWebhookDeliveries"
    | "partnerInboundEvents"
    | "agentMessages"
    | "agentMemorySummaries"
    | "agentMemoryFacts";
  isProtected(row: BackfillRow): boolean;
  patchFor(row: BackfillRow): Promise<BackfillPatch | null> | BackfillPatch | null;
};

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "backfill_failed";
}

function deletedFlagAdapter(table: BackfillTargetAdapter["table"]): BackfillTargetAdapter {
  return {
    table,
    isProtected: (row) => row.isDeleted !== undefined,
    patchFor: (row) => row.isDeleted !== undefined
      ? null
      : { id: row._id, patch: { isDeleted: Boolean(row.deletedAt) } },
  };
}

const targetAdapters = {
  clientsDeletedFlag: deletedFlagAdapter("clients"),
  projectsDeletedFlag: deletedFlagAdapter("projects"),
  clientPii: {
    table: "clients",
    isProtected: (row) => Boolean(row.encryptedEmail || row.encryptedPhone),
    patchFor: async (row) => ({
      id: row._id,
      patch: {
        ...await protectClientPii(row.organizationId, {
          email: String(row.email ?? ""),
          phone: String(row.phone ?? ""),
        }),
        updatedAt: Date.now(),
      },
    }),
  },
  webhookDeliveries: {
    table: "partnerWebhookDeliveries",
    isProtected: (row) => Boolean(row.encryptedPayload || row.payload === undefined),
    patchFor: async (row) => ({
      id: row._id,
      patch: {
        encryptedPayload: await protectOrganizationJson(row.organizationId, "partner-webhook-delivery", row.payload),
        payload: encryptedPlaceholder(),
        payloadRedacted: true,
        expiresAt: row.expiresAt ?? row.createdAt + 90 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      },
    }),
  },
  inboundEvents: {
    table: "partnerInboundEvents",
    isProtected: (row) => Boolean(row.encryptedPayload || row.payload === undefined),
    patchFor: async (row) => ({
      id: row._id,
      patch: {
        encryptedPayload: await protectOrganizationJson(row.organizationId, "partner-inbound-event", row.payload),
        payload: encryptedPlaceholder(),
        payloadRedacted: true,
        expiresAt: row.expiresAt ?? row.createdAt + 90 * 24 * 60 * 60 * 1000,
      },
    }),
  },
  agentMessages: {
    table: "agentMessages",
    isProtected: (row) => Boolean(row.encryptedContent),
    patchFor: async (row) => ({
      id: row._id,
      patch: {
        encryptedContent: await protectOrganizationText(row.organizationId, "agent-message", row.content),
        content: redactSensitiveText(String(row.content ?? "")),
        contentRedacted: true,
      },
    }),
  },
  agentMemorySummaries: {
    table: "agentMemorySummaries",
    isProtected: (row) => Boolean(row.encryptedSummary),
    patchFor: async (row) => ({
      id: row._id,
      patch: {
        encryptedSummary: await protectOrganizationText(row.organizationId, "agent-memory-summary", row.summary),
        summary: encryptedPlaceholder(),
        summaryRedacted: true,
        updatedAt: Date.now(),
      },
    }),
  },
  agentMemoryFacts: {
    table: "agentMemoryFacts",
    isProtected: (row) => Boolean(row.encryptedFact),
    patchFor: async (row) => ({
      id: row._id,
      patch: {
        encryptedFact: await protectOrganizationText(row.organizationId, "agent-memory-fact", row.fact),
        fact: redactSensitiveText(String(row.fact ?? "")),
        factRedacted: true,
        updatedAt: Date.now(),
      },
    }),
  },
} satisfies Record<BackfillTarget, BackfillTargetAdapter>;

function adapterFor(target: BackfillTarget) {
  return targetAdapters[target];
}

async function patchFor(target: BackfillTarget, row: BackfillRow): Promise<BackfillPatch | null> {
  const adapter = adapterFor(target);
  if (adapter.isProtected(row)) return null;
  return await adapter.patchFor(row);
}

export async function createBackfillPatchesForTarget(
  target: BackfillTarget,
  rows: BackfillRow[],
): Promise<BackfillPatchResult> {
  const patches: BackfillPatch[] = [];
  const failures: Array<{ id: string; error: string }> = [];

  for (const row of rows) {
    try {
      const patch = await patchFor(target, row);
      if (patch) patches.push(patch);
    } catch (error) {
      failures.push({ id: String(row._id), error: errorMessage(error) });
    }
  }

  return { patches, failures };
}

export function readBackfillTargetPage(ctx: QueryCtx, target: BackfillTarget, paginationOpts: PaginationOpts) {
  return ctx.db.query(adapterFor(target).table).paginate(paginationOpts);
}

export function normalizeBackfillTargetId(ctx: MutationCtx, target: BackfillTarget, id: string) {
  return ctx.db.normalizeId(adapterFor(target).table, id);
}
