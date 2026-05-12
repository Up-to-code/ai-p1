import { z } from "zod";
import { uploadedFileReferenceSchema, type UploadedFileReference } from "./files";

export const offerStatusSchema = z.enum(["pending", "accepted", "rejected"]);
export const offerPublicationStateSchema = z.enum(["draft", "published", "archived"]);
export const offerVisibilitySchema = z.enum(["public", "private"]);
export const offerCaseTypeSchema = z.enum(["open_offer", "private_offer", "collaboration_case"]);
export const offerCaseStageSchema = z.enum([
  "draft",
  "open",
  "targeted",
  "engaged",
  "agreed",
  "closed_won",
  "closed_lost",
  "archived",
]);
export const offerParticipantRoleSchema = z.enum([
  "inventory_owner",
  "client_owner",
  "execution_provider",
]);
export const offerParticipantStatusSchema = z.enum(["pending", "active", "accepted", "rejected"]);
export const offerAllowedAudienceSchema = z.enum(["brokers", "developers", "both"]);
export const offerQueueKeySchema = z.enum([
  "client_needs_match",
  "inventory_i_can_share",
  "incoming_opportunities",
  "shared_by_me",
  "active_collaborations",
  "archived",
  "open_inventory",
  "incoming_broker_requests",
  "targeted_shares",
]);

const optionalRequirementNumberSchema = z.number().finite().nonnegative().optional();

export const offerClientContextSchema = z.object({
  crmClientId: z.string().optional(),
  clientName: z.string().trim().min(1),
  clientPhone: z.string().trim().min(1).optional(),
  clientBudget: z.string().trim().min(1).optional(),
  clientNeed: z.string().trim().min(1),
  budgetMin: optionalRequirementNumberSchema,
  budgetMax: optionalRequirementNumberSchema,
  location: z.string().trim().min(1).optional(),
  area: z.string().trim().min(1).optional(),
  bedsMin: optionalRequirementNumberSchema,
  bathsMin: optionalRequirementNumberSchema,
  sqftMin: optionalRequirementNumberSchema,
  sqftMax: optionalRequirementNumberSchema,
});

export const createOfferInputSchema = z.object({
  propertyId: z.string().min(1).optional(),
  price: z.number().finite(),
  message: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  visibility: offerVisibilitySchema.optional(),
  caseType: offerCaseTypeSchema.optional(),
  allowedAudience: offerAllowedAudienceSchema.optional(),
  commissionText: z.string().trim().min(1).optional(),
  permitStatus: z.string().trim().min(1).optional(),
  productStatus: z.string().trim().min(1).optional(),
  toBrokerId: z.string().optional(),
  toREDId: z.string().optional(),
  recipientAuthUserId: z.string().min(1).optional(),
  recipientEmail: z.string().email().optional(),
  recipientPhone: z.string().trim().min(1).optional(),
  sourceConversationId: z.string().min(1).optional(),
  attachments: z.array(uploadedFileReferenceSchema).optional(),
  clientContext: offerClientContextSchema.optional(),
});

export const publishOfferInputSchema = z.object({
  id: z.string().min(1),
});

export const publishConversationOfferInputSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1),
});

export const updateOfferDraftInputSchema = z.object({
  id: z.string().min(1),
  conversationId: z.string().min(1).optional(),
  propertyId: z.string().min(1).optional(),
  price: z.number().finite(),
  message: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  attachments: z.array(uploadedFileReferenceSchema).optional(),
  commissionText: z.string().trim().min(1).optional(),
  permitStatus: z.string().trim().min(1).optional(),
  productStatus: z.string().trim().min(1).optional(),
  allowedAudience: offerAllowedAudienceSchema.optional(),
  clientContext: offerClientContextSchema.optional(),
});

export const archiveOfferInputSchema = z.object({
  id: z.string().min(1),
});

export const respondToOfferInputSchema = z.object({
  id: z.string().min(1),
  status: offerStatusSchema.exclude(["pending"]),
});

export const applyToOfferInputSchema = z.object({
  offerId: z.string().min(1),
  message: z.string().trim().min(1).optional(),
});

export const advanceOfferCaseStageInputSchema = z.object({
  id: z.string().min(1),
  action: z.enum(["mark_agreed", "close_won", "close_lost"]),
});

export const offerPushStatusSchema = z.enum(["pending", "sent", "failed", "skipped"]);

export type OfferPropertySummary = {
  id: string;
  title: string;
  address: string;
  price?: number;
  beds?: number;
  baths?: number;
  sqft?: number;
  location?: string;
  area?: string;
  imageUrl?: string;
};

export type OfferPrimaryOrganization = {
  id: string | null;
  name: string;
  type: "broker" | "developer" | null;
  logoUrl: string | null;
  website: string | null;
  contactEmail: string | null;
  phone?: string | null;
};

export type OfferParticipantSummary = {
  id: string;
  role: z.infer<typeof offerParticipantRoleSchema>;
  status: z.infer<typeof offerParticipantStatusSchema>;
  authUserId: string | null;
  organizationId: string | null;
  organizationType: "broker" | "developer" | null;
  organizationName: string;
  name: string;
};

export type OfferClientContext = z.infer<typeof offerClientContextSchema> & {
  crmClientId?: string | null;
};

export type OfferActivitySummary = {
  id: string;
  kind:
    | "case_created"
    | "case_published"
    | "participant_targeted"
    | "engaged"
    | "accepted"
    | "rejected"
    | "agreed"
    | "closed_won"
    | "closed_lost"
    | "archived"
    | "note_added";
  message: string | null;
  createdAt: number;
  actorName: string | null;
};

export type OfferSummary = {
  id: string;
  packageId: string;
  type: z.infer<typeof offerCaseTypeSchema>;
  stage: z.infer<typeof offerCaseStageSchema>;
  status: z.infer<typeof offerStatusSchema>;
  publicationState: z.infer<typeof offerPublicationStateSchema>;
  visibility: z.infer<typeof offerVisibilitySchema>;
  propertyId: string | null;
  price: number;
  message: string;
  description: string | null;
  senderName: string | null;
  recipientAuthUserId: string | null;
  sourceConversationId: string | null;
  property: OfferPropertySummary | null;
  propertyGallery: string[];
  propertySummary: string | null;
  commissionText: string | null;
  permitStatus: string | null;
  productStatus: string | null;
  allowedAudience: z.infer<typeof offerAllowedAudienceSchema>;
  attachments: UploadedFileReference[];
  clientContext: OfferClientContext | null;
  primaryOrganization: OfferPrimaryOrganization | null;
  participants: OfferParticipantSummary[];
  href: string;
  createdAt: number;
  updatedAt: number;
};

export type OfferAllowedActions = {
  isInventoryOwner: boolean;
  isClientOwner: boolean;
  isExecutionProvider: boolean;
  canEditDraft: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canEngage: boolean;
  canRespond: boolean;
  canMarkAgreed: boolean;
  canCloseWon: boolean;
  canCloseLost: boolean;
};

export type OfferLiveState = OfferSummary & {
  propertyTitle: string;
  propertyAddress: string;
  propertyImageUrl?: string | null;
  isOwner: boolean;
  isRecipient: boolean;
  canEditDraft: boolean;
  canPublish: boolean;
  canArchive: boolean;
  canRespond: boolean;
  allowedActions: OfferAllowedActions;
  activity: OfferActivitySummary[];
};

export type OfferNotificationDelivery = {
  notificationId: string;
  targetUserId: string;
  targetName: string;
  organizationName: string;
  href: string;
  pushStatus: z.infer<typeof offerPushStatusSchema>;
};

export type OfferActionResult = {
  offerId: string;
  caseId: string;
  conversationId: string | null;
  starterMessageCreated: boolean;
  notification: OfferNotificationDelivery | null;
};

export type OfferQueue = {
  key: z.infer<typeof offerQueueKeySchema>;
  label: string;
  description: string;
  items: OfferSummary[];
};

export type OffersSnapshot = {
  audience: "broker" | "developer";
  queues: OfferQueue[];
  sent: OfferSummary[];
  received: OfferSummary[];
  marketplace: OfferSummary[];
};

export type CreateOfferInput = z.infer<typeof createOfferInputSchema>;
export type PublishOfferInput = z.infer<typeof publishOfferInputSchema>;
export type PublishConversationOfferInput = z.infer<typeof publishConversationOfferInputSchema>;
export type UpdateOfferDraftInput = z.infer<typeof updateOfferDraftInputSchema>;
export type ArchiveOfferInput = z.infer<typeof archiveOfferInputSchema>;
export type RespondToOfferInput = z.infer<typeof respondToOfferInputSchema>;
export type ApplyToOfferInput = z.infer<typeof applyToOfferInputSchema>;
export type AdvanceOfferCaseStageInput = z.infer<typeof advanceOfferCaseStageInputSchema>;
export type OfferCaseType = z.infer<typeof offerCaseTypeSchema>;
export type OfferAllowedAudience = z.infer<typeof offerAllowedAudienceSchema>;
export type OfferQueueKey = z.infer<typeof offerQueueKeySchema>;
