import { z } from "zod";

// ── Canonical deal schema (matches Convex deals table) ──────────────

export const dealStageSchema = z.enum(["lead", "qualified", "proposal_sent", "contract_sent", "won", "lost"]);
export const dealStatusSchema = z.enum(["open", "won", "lost", "paused"]);
export const dealPrioritySchema = z.enum(["low", "normal", "high", "urgent"]);

export const dealInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  stage: dealStageSchema,
  status: dealStatusSchema,
  priority: dealPrioritySchema,
  value: z.number().finite().optional(),
  currency: z.string().trim().optional(),
  dealThinking: z.string().trim().optional(),
  source: z.string().trim().optional(),
  closeDate: z.string().trim().optional(),
  nextStep: z.string().trim().optional(),
  ownerUserId: z.string().optional(),
  tags: z.array(z.string().trim()).optional(),
});

export const dealRecordSchema = z.object({
  _id: z.string(),
  _creationTime: z.number(),
  id: z.string(),
  organizationId: z.string(),
  title: z.string(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  stage: dealStageSchema,
  status: dealStatusSchema,
  priority: dealPrioritySchema,
  value: z.number().optional(),
  currency: z.string().optional(),
  dealThinking: z.string().optional(),
  source: z.string().optional(),
  closeDate: z.string().optional(),
  nextStep: z.string().optional(),
  ownerUserId: z.string(),
  tags: z.array(z.string()).optional(),
  customFields: z.array(z.object({ key: z.string(), value: z.unknown() })).optional(),
  createdByUserId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  closedAt: z.number().optional(),
  deletedAt: z.number().optional(),
  isDeleted: z.boolean().optional(),
});

export type DealStage = z.infer<typeof dealStageSchema>;
export type DealStatus = z.infer<typeof dealStatusSchema>;
export type DealPriority = z.infer<typeof dealPrioritySchema>;
export type DealInput = z.infer<typeof dealInputSchema>;
export type DealRecord = z.infer<typeof dealRecordSchema>;

export type DealSummary = {
  id: string;
  title: string;
  stage: DealStage;
  status: DealStatus;
  priority: DealPriority;
  value?: number;
  currency?: string;
  dealThinking?: string;
  clientId?: string;
  projectId?: string;
  ownerUserId: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
};

export type DealStats = {
  total: number;
  open: number;
  qualified: number;
  won: number;
  lost: number;
  totalValue: number;
};

// ── CRM broker flow types (legacy, for external integration) ────────

export const crmDealStageSchema = z.enum(["new", "contacted", "negotiation", "won", "lost"]);
export const crmDealRelationTypeSchema = z.enum(["internal_client", "broker_managed"]);

export const crmClientPreviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  sourceClientId: z.string().optional(),
});

export const crmBrokerPreviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  phone: z.string().optional(),
  avatarLabel: z.string(),
  stateLabel: z.string().optional(),
  isVerified: z.boolean().optional(),
});

export const crmProjectPreviewSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: z.string(),
  location: z.string(),
  priceLabel: z.string(),
  summary: z.string(),
});

export const crmDealInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().optional(),
  value: z.number().finite().optional(),
  nextFollowUpAt: z.number().int().positive().optional(),
  stage: crmDealStageSchema,
  contactName: z.string().trim().min(1).max(120).optional(),
  contactPhone: z.string().trim().min(1).max(40).optional(),
  assetId: z.string().optional(),
  relationType: crmDealRelationTypeSchema,
  crmClientId: z.string().optional(),
  relatedBrokerId: z.string().optional(),
});

export const crmUpdateDealInputSchema = crmDealInputSchema.extend({
  dealId: z.string(),
  notes: z.string().optional(),
});

export const crmUpdateDealStageInputSchema = z.object({
  dealId: z.string(),
  stage: crmDealStageSchema,
});

export const crmUpdateDealNotesInputSchema = z.object({
  dealId: z.string(),
  notes: z.string(),
});

export const crmUpdateDealFollowUpInputSchema = z.object({
  dealId: z.string(),
  nextFollowUpAt: z.number().int().positive(),
});

export const crmAddDealDocumentInputSchema = z.object({
  dealId: z.string(),
  document: z.object({
    url: z.string(),
    name: z.string(),
    type: z.string(),
    size: z.number().optional(),
  }),
});

export const crmAssetDealsInputSchema = z.object({
  assetId: z.string(),
});

export const crmArchiveDealInputSchema = z.object({
  dealId: z.string(),
});

export type CrmDealInput = z.infer<typeof crmDealInputSchema>;
export type CrmUpdateDealInput = z.infer<typeof crmUpdateDealInputSchema>;
export type CrmUpdateDealStageInput = z.infer<typeof crmUpdateDealStageInputSchema>;
export type CrmUpdateDealNotesInput = z.infer<typeof crmUpdateDealNotesInputSchema>;
export type CrmUpdateDealFollowUpInput = z.infer<typeof crmUpdateDealFollowUpInputSchema>;
export type CrmAddDealDocumentInput = z.infer<typeof crmAddDealDocumentInputSchema>;
export type CrmAssetDealsInput = z.infer<typeof crmAssetDealsInputSchema>;
export type CrmArchiveDealInput = z.infer<typeof crmArchiveDealInputSchema>;
export type CrmDealRelationType = z.infer<typeof crmDealRelationTypeSchema>;
export type CrmClientPreview = z.infer<typeof crmClientPreviewSchema>;
export type CrmBrokerPreview = z.infer<typeof crmBrokerPreviewSchema>;
export type CrmProjectPreview = z.infer<typeof crmProjectPreviewSchema>;
