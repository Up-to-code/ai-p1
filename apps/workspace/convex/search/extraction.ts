import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { internalMutation, internalQuery, mutation, type MutationCtx } from "../_generated/server";
import { requireServerActor } from "../access/actor";
import { assertOrganizationPermission } from "../organizations/profile/access";
import { attachmentSearchProjection } from "./adapters/attachment";
import { failedExtractionState } from "./extractionState";
import { tombstoneSearchResource } from "./projection";

const CLAIM_LEASE_MS = 2 * 60_000;
export const MAX_EXTRACTION_SOURCE_BYTES = 8 * 1_024 * 1_024;
export const MAX_EXTRACTED_TEXT_CHARS = 250_000;

const securityJobValidator = v.object({
  _id: v.id("mediaSecurityJobs"),
  organizationId: v.string(),
  mediaId: v.id("mediaAssets"),
  attempts: v.number(),
});
const extractionJobValidator = v.object({
  _id: v.id("extractionJobs"),
  organizationId: v.string(),
  mediaId: v.string(),
  extractor: v.union(v.literal("tika"), v.literal("tesseract")),
  ocrLanguages: v.array(v.string()),
  attempts: v.number(),
  sourceUpdatedAt: v.number(),
});
const sourceValidator = v.object({
  url: v.string(),
  name: v.string(),
  mimeType: v.string(),
  size: v.number(),
  updatedAt: v.number(),
  malwareScanStatus: v.optional(v.string()),
  locale: v.optional(v.string()),
});

export async function enqueueMediaSecurityScan(ctx: MutationCtx, asset: Doc<"mediaAssets">) {
  const existing = await ctx.db.query("mediaSecurityJobs").withIndex("by_media", (q) =>
    q.eq("organizationId", asset.organizationId).eq("mediaId", asset._id),
  ).collect();
  if (existing.some((job) => job.status === "pending" || job.status === "processing")) return;
  const now = Date.now();
  await ctx.db.insert("mediaSecurityJobs", {
    organizationId: asset.organizationId,
    mediaId: asset._id,
    status: "pending",
    attempts: 0,
    nextAttemptAt: now,
    createdAt: now,
    updatedAt: now,
  });
}

export const claimSecurityJob = internalMutation({
  args: { now: v.number() },
  returns: v.union(securityJobValidator, v.null()),
  handler: async (ctx, args) => {
    const job = await ctx.db.query("mediaSecurityJobs").withIndex("by_status_attempt", (q) =>
      q.eq("status", "pending").lte("nextAttemptAt", args.now),
    ).first() ?? await ctx.db.query("mediaSecurityJobs").withIndex("by_status_attempt", (q) =>
      q.eq("status", "processing").lte("nextAttemptAt", args.now),
    ).first();
    if (!job) return null;
    await ctx.db.patch(job._id, { status: "processing", claimedAt: args.now, nextAttemptAt: args.now + CLAIM_LEASE_MS, updatedAt: args.now });
    return { _id: job._id, organizationId: job.organizationId, mediaId: job.mediaId, attempts: job.attempts };
  },
});

export const loadSecuritySource = internalQuery({
  args: { organizationId: v.string(), mediaId: v.id("mediaAssets") },
  returns: v.union(sourceValidator, v.null()),
  handler: async (ctx, args) => {
    const asset = await ctx.db.get(args.mediaId);
    if (!asset || asset.organizationId !== args.organizationId) return null;
    return { url: asset.url, name: asset.name, mimeType: asset.mimeType, size: asset.size, updatedAt: asset.createdAt, malwareScanStatus: asset.malwareScanStatus };
  },
});

export const completeSecurityJob = internalMutation({
  args: {
    jobId: v.id("mediaSecurityJobs"),
    verdict: v.union(v.literal("clean"), v.literal("infected")),
    engine: v.string(),
    engineVersion: v.string(),
    signature: v.optional(v.string()),
    now: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.status !== "processing") return null;
    const asset = await ctx.db.get(job.mediaId);
    if (!asset || asset.organizationId !== job.organizationId) {
      await ctx.db.patch(job._id, { status: "dead_letter", failureReason: "Media source no longer exists.", claimedAt: undefined, updatedAt: args.now });
      return null;
    }
    if (args.verdict === "infected") {
      await ctx.db.patch(asset._id, { malwareScanStatus: "infected", malwareScanner: args.engine, malwareScannerVersion: args.engineVersion, malwareScannedAt: args.now, quarantinedAt: args.now, updatedAt: args.now });
      await ctx.db.patch(job._id, { status: "quarantined", engine: args.engine, engineVersion: args.engineVersion, signature: args.signature, completedAt: args.now, claimedAt: undefined, updatedAt: args.now });
      await removeExtractedContent(ctx, asset.organizationId, asset._id);
      await tombstoneSearchResource(ctx, asset.organizationId, "attachment", String(asset._id));
      return null;
    }
    await ctx.db.patch(asset._id, { malwareScanStatus: "clean", malwareScanner: args.engine, malwareScannerVersion: args.engineVersion, malwareScannedAt: args.now, quarantinedAt: undefined, updatedAt: args.now });
    await ctx.db.patch(job._id, { status: "clean", engine: args.engine, engineVersion: args.engineVersion, completedAt: args.now, claimedAt: undefined, updatedAt: args.now });
    const updated = await ctx.db.get(asset._id);
    if (updated) await enqueueExtraction(ctx, updated);
    return null;
  },
});

export const failSecurityJob = internalMutation({
  args: { jobId: v.id("mediaSecurityJobs"), now: v.number(), error: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) return null;
    const failure = failedExtractionState(job.attempts, args.now, args.error);
    await ctx.db.patch(job._id, failure);
    if (failure.status === "dead_letter") {
      await ctx.db.patch(job.mediaId, { malwareScanStatus: "failed", updatedAt: args.now });
    }
    return null;
  },
});

export const claimExtractionJob = internalMutation({
  args: { now: v.number() },
  returns: v.union(extractionJobValidator, v.null()),
  handler: async (ctx, args) => {
    const job = await ctx.db.query("extractionJobs").withIndex("by_status_attempt", (q) =>
      q.eq("status", "pending").lte("nextAttemptAt", args.now),
    ).first() ?? await ctx.db.query("extractionJobs").withIndex("by_status_attempt", (q) =>
      q.eq("status", "processing").lte("nextAttemptAt", args.now),
    ).first();
    if (!job) return null;
    await ctx.db.patch(job._id, { status: "processing", claimedAt: args.now, nextAttemptAt: args.now + CLAIM_LEASE_MS, updatedAt: args.now });
    return { _id: job._id, organizationId: job.organizationId, mediaId: job.mediaId, extractor: job.extractor, ocrLanguages: job.ocrLanguages, attempts: job.attempts, sourceUpdatedAt: job.sourceUpdatedAt };
  },
});

export const loadExtractionSource = internalQuery({
  args: { organizationId: v.string(), mediaId: v.string() },
  returns: v.union(sourceValidator, v.null()),
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("mediaAssets", args.mediaId);
    const asset = id ? await ctx.db.get(id) : null;
    if (!asset || asset.organizationId !== args.organizationId || asset.malwareScanStatus !== "clean") return null;
    const policy = await ctx.db.query("searchPolicies").withIndex("by_organization", (q) => q.eq("organizationId", args.organizationId)).unique();
    return { url: asset.url, name: asset.name, mimeType: asset.mimeType, size: asset.size, updatedAt: asset.createdAt, malwareScanStatus: asset.malwareScanStatus, locale: policy?.defaultLocale ?? "en" };
  },
});

export const completeExtractionJob = internalMutation({
  args: {
    jobId: v.id("extractionJobs"),
    text: v.string(),
    locale: v.string(),
    metadata: v.array(v.object({ key: v.string(), value: v.string() })),
    extractorVersion: v.string(),
    ocrLanguages: v.array(v.string()),
    now: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job || job.status !== "processing") return null;
    const mediaId = ctx.db.normalizeId("mediaAssets", job.mediaId);
    const asset = mediaId ? await ctx.db.get(mediaId) : null;
    if (!asset || asset.organizationId !== job.organizationId || asset.malwareScanStatus !== "clean" || asset.createdAt !== job.sourceUpdatedAt) {
      await ctx.db.patch(job._id, { status: "failed", failureReason: "Media source changed before extraction completed.", claimedAt: undefined, updatedAt: args.now });
      return null;
    }
    const text = args.text.slice(0, MAX_EXTRACTED_TEXT_CHARS);
    const metadata = args.metadata.slice(0, 100).map((entry) => ({ key: entry.key.slice(0, 120), value: entry.value.slice(0, 2_000) }));
    const existing = await ctx.db.query("extractedSearchContent").withIndex("by_media", (q) =>
      q.eq("organizationId", job.organizationId).eq("mediaId", asset._id),
    ).unique();
    const value = {
      organizationId: job.organizationId, mediaId: asset._id, sourceUpdatedAt: job.sourceUpdatedAt, sourceMimeType: asset.mimeType,
      text, locale: args.locale, metadata, extractor: job.extractor, extractorVersion: args.extractorVersion,
      ocrLanguages: args.ocrLanguages, extractedAt: args.now, updatedAt: args.now,
    };
    if (existing) await ctx.db.patch(existing._id, value); else await ctx.db.insert("extractedSearchContent", value);
    await ctx.db.patch(job._id, { status: "completed", extractorVersion: args.extractorVersion, ocrLanguages: args.ocrLanguages, completedAt: args.now, claimedAt: undefined, failureReason: undefined, updatedAt: args.now });
    const content = existing ? { ...existing, ...value } : value;
    await attachmentSearchProjection(ctx, asset, content);
    return null;
  },
});

export const failExtractionJob = internalMutation({
  args: { jobId: v.id("extractionJobs"), now: v.number(), error: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (job) await ctx.db.patch(job._id, failedExtractionState(job.attempts, args.now, args.error));
    return null;
  },
});

export async function cleanupAttachmentSearch(ctx: MutationCtx, organizationId: string, mediaId: Id<"mediaAssets">) {
  await removeExtractedContent(ctx, organizationId, mediaId);
  const [securityJobs, extractionJobs] = await Promise.all([
    ctx.db.query("mediaSecurityJobs").withIndex("by_media", (q) => q.eq("organizationId", organizationId).eq("mediaId", mediaId)).collect(),
    ctx.db.query("extractionJobs").withIndex("by_media", (q) => q.eq("organizationId", organizationId).eq("mediaId", String(mediaId))).collect(),
  ]);
  for (const job of [...securityJobs, ...extractionJobs]) await ctx.db.delete(job._id);
  await tombstoneSearchResource(ctx, organizationId, "attachment", String(mediaId));
}

export async function refreshAttachmentSearchProjection(ctx: MutationCtx, asset: Doc<"mediaAssets">) {
  if (asset.malwareScanStatus !== "clean") return;
  const content = await ctx.db.query("extractedSearchContent").withIndex("by_media", (q) =>
    q.eq("organizationId", asset.organizationId).eq("mediaId", asset._id),
  ).unique();
  if (content) await attachmentSearchProjection(ctx, asset, content);
}

async function enqueueExtraction(ctx: MutationCtx, asset: Doc<"mediaAssets">) {
  const policy = await ctx.db.query("searchPolicies").withIndex("by_organization", (q) => q.eq("organizationId", asset.organizationId)).unique();
  if (!policy?.attachmentExtractionEnabled || !policy.enabledResourceTypes.includes("attachment")) return;
  if (!policy.allowedMimeTypes.includes(asset.mimeType) || asset.size > MAX_EXTRACTION_SOURCE_BYTES || asset.kind === "video") return;
  const extractor = asset.kind === "image" && policy.ocrEnabled ? "tesseract" as const : "tika" as const;
  if (asset.kind === "image" && !policy.ocrEnabled) return;
  const existing = await ctx.db.query("extractionJobs").withIndex("by_media", (q) =>
    q.eq("organizationId", asset.organizationId).eq("mediaId", String(asset._id)),
  ).collect();
  if (existing.some((job) => job.sourceUpdatedAt === asset.createdAt && (job.status === "pending" || job.status === "processing" || job.status === "completed"))) return;
  const now = Date.now();
  await ctx.db.insert("extractionJobs", {
    organizationId: asset.organizationId, mediaId: String(asset._id), status: "pending", extractor, extractorVersion: "pending",
    ocrLanguages: extractor === "tesseract" ? [policy.defaultLocale] : [], attempts: 0, nextAttemptAt: now,
    sourceUpdatedAt: asset.createdAt, createdAt: now, updatedAt: now,
  });
}

export const retryDeadLetters = mutation({
  args: { organizationId: v.string() },
  returns: v.object({ securityRetried: v.number(), extractionRetried: v.number() }),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const actor = await requireServerActor(ctx);
    const [securityJobs, extractionJobs] = await Promise.all([
      ctx.db.query("mediaSecurityJobs").withIndex("by_organization_status_attempt", (q) =>
        q.eq("organizationId", args.organizationId).eq("status", "dead_letter"),
      ).take(100),
      ctx.db.query("extractionJobs").withIndex("by_organization_status_attempt", (q) =>
        q.eq("organizationId", args.organizationId).eq("status", "dead_letter"),
      ).take(100),
    ]);
    const now = Date.now();
    for (const job of securityJobs) {
      await ctx.db.patch(job._id, { status: "pending", attempts: 0, nextAttemptAt: now, claimedAt: undefined, failureReason: undefined, updatedAt: now });
      await ctx.db.patch(job.mediaId, { malwareScanStatus: "pending", updatedAt: now });
    }
    for (const job of extractionJobs) {
      await ctx.db.patch(job._id, { status: "pending", attempts: 0, nextAttemptAt: now, claimedAt: undefined, failureReason: undefined, updatedAt: now });
    }
    await ctx.db.insert("organizationAuditEvents", {
      organizationId: args.organizationId,
      actorUserId: actor.userId,
      action: "search.extraction.retry",
      target: args.organizationId,
      summary: `Retried ${securityJobs.length} media security jobs and ${extractionJobs.length} extraction jobs.`,
      createdAt: now,
    });
    return { securityRetried: securityJobs.length, extractionRetried: extractionJobs.length };
  },
});

export const reprocessAttachment = mutation({
  args: { organizationId: v.string(), mediaId: v.id("mediaAssets") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    await assertOrganizationPermission(ctx, args.organizationId, "update");
    const asset = await ctx.db.get(args.mediaId);
    if (!asset || asset.organizationId !== args.organizationId || asset.malwareScanStatus !== "clean") return false;
    const jobs = await ctx.db.query("extractionJobs").withIndex("by_media", (q) =>
      q.eq("organizationId", args.organizationId).eq("mediaId", String(args.mediaId)),
    ).collect();
    for (const job of jobs) await ctx.db.delete(job._id);
    await removeExtractedContent(ctx, args.organizationId, args.mediaId);
    await tombstoneSearchResource(ctx, args.organizationId, "attachment", String(args.mediaId));
    await enqueueExtraction(ctx, asset);
    return true;
  },
});

async function removeExtractedContent(ctx: MutationCtx, organizationId: string, mediaId: Id<"mediaAssets">) {
  const content = await ctx.db.query("extractedSearchContent").withIndex("by_media", (q) =>
    q.eq("organizationId", organizationId).eq("mediaId", mediaId),
  ).unique();
  if (content) await ctx.db.delete(content._id);
}
