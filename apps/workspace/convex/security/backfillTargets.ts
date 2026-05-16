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
  "propertiesDeletedFlag",
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

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "backfill_failed";
}

function deletedFlagPatch(row: BackfillRow) {
  if (row.isDeleted !== undefined) return null;
  return { id: row._id, patch: { isDeleted: Boolean(row.deletedAt) } };
}

function isProtected(target: BackfillTarget, row: BackfillRow) {
  if (target === "clientsDeletedFlag" || target === "projectsDeletedFlag" || target === "propertiesDeletedFlag") {
    return row.isDeleted !== undefined;
  }
  if (target === "clientPii") {
    return Boolean(row.encryptedContact && row.encryptedPhone && row.encryptedNationality && row.encryptedBudget);
  }
  if (target === "webhookDeliveries" || target === "inboundEvents") {
    return Boolean(row.encryptedPayload || row.payload === undefined);
  }
  if (target === "agentMessages") return Boolean(row.encryptedContent);
  if (target === "agentMemorySummaries") return Boolean(row.encryptedSummary);
  return Boolean(row.encryptedFact);
}

async function patchFor(target: BackfillTarget, row: BackfillRow): Promise<BackfillPatch | null> {
  if (isProtected(target, row)) return null;

  if (target === "clientsDeletedFlag" || target === "projectsDeletedFlag" || target === "propertiesDeletedFlag") {
    return deletedFlagPatch(row);
  }

  if (target === "clientPii") {
    return {
      id: row._id,
      patch: {
        ...await protectClientPii(row.organizationId, {
          contact: String(row.contact ?? ""),
          phone: String(row.phone ?? ""),
          nationality: String(row.nationality ?? ""),
          budget: String(row.budget ?? ""),
        }),
        updatedAt: Date.now(),
      },
    };
  }

  if (target === "webhookDeliveries") {
    return {
      id: row._id,
      patch: {
        encryptedPayload: await protectOrganizationJson(row.organizationId, "partner-webhook-delivery", row.payload),
        payload: encryptedPlaceholder(),
        payloadRedacted: true,
        expiresAt: row.expiresAt ?? row.createdAt + 90 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      },
    };
  }

  if (target === "inboundEvents") {
    return {
      id: row._id,
      patch: {
        encryptedPayload: await protectOrganizationJson(row.organizationId, "partner-inbound-event", row.payload),
        payload: encryptedPlaceholder(),
        payloadRedacted: true,
        expiresAt: row.expiresAt ?? row.createdAt + 90 * 24 * 60 * 60 * 1000,
      },
    };
  }

  if (target === "agentMessages") {
    return {
      id: row._id,
      patch: {
        encryptedContent: await protectOrganizationText(row.organizationId, "agent-message", row.content),
        content: redactSensitiveText(String(row.content ?? "")),
        contentRedacted: true,
      },
    };
  }

  if (target === "agentMemorySummaries") {
    return {
      id: row._id,
      patch: {
        encryptedSummary: await protectOrganizationText(row.organizationId, "agent-memory-summary", row.summary),
        summary: encryptedPlaceholder(),
        summaryRedacted: true,
        updatedAt: Date.now(),
      },
    };
  }

  return {
    id: row._id,
    patch: {
      encryptedFact: await protectOrganizationText(row.organizationId, "agent-memory-fact", row.fact),
      fact: redactSensitiveText(String(row.fact ?? "")),
      factRedacted: true,
      updatedAt: Date.now(),
    },
  };
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
  if (target === "clientsDeletedFlag" || target === "clientPii") {
    return ctx.db.query("clients").paginate(paginationOpts);
  }
  if (target === "projectsDeletedFlag") {
    return ctx.db.query("projects").paginate(paginationOpts);
  }
  if (target === "propertiesDeletedFlag") {
    return ctx.db.query("propertyUnits").paginate(paginationOpts);
  }
  if (target === "webhookDeliveries") {
    return ctx.db.query("partnerWebhookDeliveries").paginate(paginationOpts);
  }
  if (target === "inboundEvents") {
    return ctx.db.query("partnerInboundEvents").paginate(paginationOpts);
  }
  if (target === "agentMessages") {
    return ctx.db.query("agentMessages").paginate(paginationOpts);
  }
  if (target === "agentMemorySummaries") {
    return ctx.db.query("agentMemorySummaries").paginate(paginationOpts);
  }
  return ctx.db.query("agentMemoryFacts").paginate(paginationOpts);
}

export function normalizeBackfillTargetId(ctx: MutationCtx, target: BackfillTarget, id: string) {
  if (target === "clientsDeletedFlag" || target === "clientPii") return ctx.db.normalizeId("clients", id);
  if (target === "projectsDeletedFlag") return ctx.db.normalizeId("projects", id);
  if (target === "propertiesDeletedFlag") return ctx.db.normalizeId("propertyUnits", id);
  if (target === "webhookDeliveries") return ctx.db.normalizeId("partnerWebhookDeliveries", id);
  if (target === "inboundEvents") return ctx.db.normalizeId("partnerInboundEvents", id);
  if (target === "agentMessages") return ctx.db.normalizeId("agentMessages", id);
  if (target === "agentMemorySummaries") return ctx.db.normalizeId("agentMemorySummaries", id);
  return ctx.db.normalizeId("agentMemoryFacts", id);
}
