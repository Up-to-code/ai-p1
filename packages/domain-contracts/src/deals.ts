import { z } from "zod";
import { uploadedFileReferenceSchema, type UploadedFileReference } from "./files";
import type { PaginationResult } from "convex/server";

export const dealStageSchema = z.enum(["new", "contacted", "negotiation", "won", "lost"]);
export const dealRelationTypeSchema = z.enum(["internal_client", "broker_managed"]);

export const dealClientPreviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  sourceClientId: z.string().optional(),
});

export const dealBrokerPreviewSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  phone: z.string().optional(),
  avatarLabel: z.string(),
  stateLabel: z.string().optional(),
  isVerified: z.boolean().optional(),
});

export const dealProjectPreviewSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: z.string(),
  location: z.string(),
  priceLabel: z.string(),
  summary: z.string(),
});

export const dealSelectorClientSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  sourceClientId: z.string().optional(),
});

export const dealSelectorBrokerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  phone: z.string().optional(),
  avatarLabel: z.string(),
  stateLabel: z.string().optional(),
  isVerified: z.boolean().optional(),
});

/**
 * WHY:   CRM server functions need one validated payload shape across broker and developer flows.
 * WHAT:  CreateDealInput validates the mutable deal fields accepted from the web layer.
 * HOW:   It mirrors the currently supported CRM write fields while leaving ownership resolution to the server layer.
 */
export const createDealInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().optional(),
  value: z.number().finite().optional(),
  nextFollowUpAt: z.number().int().positive().optional(),
  stage: dealStageSchema,
  contactName: z.string().trim().min(1).max(120).optional(),
  contactPhone: z.string().trim().min(1).max(40).optional(),
  propertyId: z.string().optional(),
  relationType: dealRelationTypeSchema,
  crmClientId: z.string().optional(),
  relatedBrokerId: z.string().optional(),
});

export const updateDealInputSchema = createDealInputSchema.extend({
  dealId: z.string(),
  notes: z.string().optional(),
});

export const updateDealStageInputSchema = z.object({
  dealId: z.string(),
  stage: dealStageSchema,
});

export const updateDealNotesInputSchema = z.object({
  dealId: z.string(),
  notes: z.string(),
});

export const updateDealFollowUpInputSchema = z.object({
  dealId: z.string(),
  nextFollowUpAt: z.number().int().positive(),
});

export const addDealDocumentInputSchema = z.object({
  dealId: z.string(),
  document: uploadedFileReferenceSchema,
});

export const propertyDealsInputSchema = z.object({
  propertyId: z.string(),
});

export const archiveDealInputSchema = z.object({
  dealId: z.string(),
});

export type CreateDealInput = z.infer<typeof createDealInputSchema>;
export type UpdateDealInput = z.infer<typeof updateDealInputSchema>;
export type UpdateDealStageInput = z.infer<typeof updateDealStageInputSchema>;
export type UpdateDealNotesInput = z.infer<typeof updateDealNotesInputSchema>;
export type UpdateDealFollowUpInput = z.infer<typeof updateDealFollowUpInputSchema>;
export type AddDealDocumentInput = z.infer<typeof addDealDocumentInputSchema>;
export type PropertyDealsInput = z.infer<typeof propertyDealsInputSchema>;
export type ArchiveDealInput = z.infer<typeof archiveDealInputSchema>;
export type DealRelationType = z.infer<typeof dealRelationTypeSchema>;
export type DealClientPreview = z.infer<typeof dealClientPreviewSchema>;
export type DealBrokerPreview = z.infer<typeof dealBrokerPreviewSchema>;
export type DealProjectPreview = z.infer<typeof dealProjectPreviewSchema>;
export type DealSelectorClient = z.infer<typeof dealSelectorClientSchema>;
export type DealSelectorBroker = z.infer<typeof dealSelectorBrokerSchema>;

export type DealSummary = {
  id: string;
  createdAt: number;
  title: string;
  description?: string;
  value?: number;
  nextFollowUpAt?: number;
  stage: z.infer<typeof dealStageSchema>;
  relationType?: DealRelationType;
  crmClientId?: string;
  relatedBrokerId?: string;
  brokerId?: string;
  redId?: string;
  propertyId?: string;
  offerId?: string;
  notes?: string;
  contactName?: string;
  contactPhone?: string;
  lastUpdatedBy?: string;
  brokerName?: string | null;
  redName?: string | null;
  client?: DealClientPreview | null;
  linkedBroker?: DealBrokerPreview | null;
  project?: DealProjectPreview | null;
  documents?: UploadedFileReference[];
};

export type DealDetail = DealSummary;
export type PaginatedDealsResult = PaginationResult<DealSummary>;

export type DealSelectorData = {
  clients: DealSelectorClient[];
  brokers: DealSelectorBroker[];
};
