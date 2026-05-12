import { z } from "zod";
import { uploadedFileReferenceSchema } from "./files";
import { dealStageSchema } from "./deals";

export const conversationMessageTypeSchema = z.enum([
  "text",
  "offer_event",
  "file_share",
  "project_share",
  "deal_share",
  "invite_event",
  "role_event",
]);

export const collaborationActorSchema = z.object({
  authUserId: z.string().min(1),
  name: z.string().min(1),
  role: z.enum(["broker", "developer", "user", "admin"]),
  organizationId: z.string().min(1).nullable().optional(),
  organizationType: z.enum(["broker", "developer"]).nullable().optional(),
  organizationName: z.string().min(1).nullable().optional(),
});

export const collaborationRecipientContextSchema = z.object({
  recipientAuthUserId: z.string().min(1),
  organizationId: z.string().min(1).nullable().optional(),
  organizationType: z.enum(["broker", "developer"]).nullable().optional(),
  organizationName: z.string().min(1).nullable().optional(),
});

export const collaborationActionSchema = z.object({
  type: z.enum([
    "open_file",
    "open_project",
    "open_deal",
    "open_offer",
    "open_invite",
    "open_membership",
  ]),
  label: z.string().min(1),
  href: z.string().min(1),
});

export const textMessageMetadataSchema = z
  .object({
    clientRequestId: z.string().min(1).optional(),
    optimistic: z.boolean().optional(),
  })
  .catchall(z.unknown());

export const offerEventMetadataSchema = z.object({
  contextType: z.literal("offer_card"),
  bootstrapSource: z.enum(["offer_send", "offer_apply", "offer_detail"]),
  offerId: z.string().min(1),
  propertyId: z.string().min(1),
  offerTitle: z.string().min(1),
  authorName: z.string().min(1),
  organizationName: z.string().min(1),
  price: z.number().finite(),
  visibility: z.enum(["public", "private"]),
  href: z.string().min(1),
  recipientAuthUserId: z.string().min(1).optional(),
});

const collaborationCardBaseSchema = z.object({
  actor: collaborationActorSchema,
  recipient: collaborationRecipientContextSchema,
  title: z.string().min(1),
  summary: z.string().min(1),
  href: z.string().min(1),
  action: collaborationActionSchema,
});

export const fileShareMetadataSchema = collaborationCardBaseSchema.extend({
  contextType: z.literal("file_share"),
  file: uploadedFileReferenceSchema,
});

export const projectShareMetadataSchema = collaborationCardBaseSchema.extend({
  contextType: z.literal("project_share"),
  propertyId: z.string().min(1),
  location: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const dealShareMetadataSchema = collaborationCardBaseSchema.extend({
  contextType: z.literal("deal_share"),
  dealId: z.string().min(1),
  stage: dealStageSchema,
  value: z.number().finite().nullable().optional(),
  propertyId: z.string().nullable().optional(),
});

export const inviteEventMetadataSchema = collaborationCardBaseSchema.extend({
  contextType: z.literal("invite_event"),
  inviteId: z.string().min(1),
  inviteRole: z.enum(["manager", "member", "viewer"]),
  inviteStatus: z.enum(["pending", "accepted", "canceled"]),
  organizationName: z.string().min(1),
  organizationType: z.enum(["broker", "developer"]),
});

export const roleEventMetadataSchema = collaborationCardBaseSchema.extend({
  contextType: z.literal("role_event"),
  membershipId: z.string().min(1),
  organizationRole: z.enum(["manager", "member", "viewer"]),
  previousRole: z.enum(["manager", "member", "viewer"]).nullable().optional(),
  organizationName: z.string().min(1),
  organizationType: z.enum(["broker", "developer"]),
});

export const conversationTargetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().nullable().optional(),
  username: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
  role: z.string().min(1),
  brokerId: z.string().nullable().optional(),
  redId: z.string().nullable().optional(),
  organizationName: z.string().nullable().optional(),
  organizationType: z.enum(["broker", "developer"]).nullable().optional(),
  membershipState: z.enum(["not-member", "pending-invite", "member"]).nullable().optional(),
  conversationId: z.string().nullable().optional(),
});

const conversationMessageBaseShape = {
  id: z.string().min(1),
  senderUserId: z.string().min(1),
  recipientUserId: z.string().min(1),
  body: z.string(),
  createdAt: z.number(),
} as const;

export const textConversationMessageSchema = z.object({
  ...conversationMessageBaseShape,
  type: z.literal("text"),
  metadata: textMessageMetadataSchema.nullish(),
});

export const offerEventConversationMessageSchema = z.object({
  ...conversationMessageBaseShape,
  type: z.literal("offer_event"),
  metadata: offerEventMetadataSchema,
});

export const fileShareConversationMessageSchema = z.object({
  ...conversationMessageBaseShape,
  type: z.literal("file_share"),
  metadata: fileShareMetadataSchema,
});

export const projectShareConversationMessageSchema = z.object({
  ...conversationMessageBaseShape,
  type: z.literal("project_share"),
  metadata: projectShareMetadataSchema,
});

export const dealShareConversationMessageSchema = z.object({
  ...conversationMessageBaseShape,
  type: z.literal("deal_share"),
  metadata: dealShareMetadataSchema,
});

export const inviteEventConversationMessageSchema = z.object({
  ...conversationMessageBaseShape,
  type: z.literal("invite_event"),
  metadata: inviteEventMetadataSchema,
});

export const roleEventConversationMessageSchema = z.object({
  ...conversationMessageBaseShape,
  type: z.literal("role_event"),
  metadata: roleEventMetadataSchema,
});

export const conversationMessageSchema = z.discriminatedUnion("type", [
  textConversationMessageSchema,
  offerEventConversationMessageSchema,
  fileShareConversationMessageSchema,
  projectShareConversationMessageSchema,
  dealShareConversationMessageSchema,
  inviteEventConversationMessageSchema,
  roleEventConversationMessageSchema,
]);

export const conversationMessagePreviewSchema = z.object({
  id: z.string().min(1),
  senderUserId: z.string().min(1),
  body: z.string(),
  type: conversationMessageTypeSchema,
  createdAt: z.number(),
});

export const conversationSummarySchema = z.object({
  id: z.string().min(1),
  directKey: z.string().min(1),
  otherUser: conversationTargetSchema,
  lastMessage: conversationMessagePreviewSchema.nullable(),
  lastMessagePreview: z.string(),
  updatedAt: z.number(),
  unreadCount: z.number().int().nonnegative(),
  archivedAt: z.number().nullable().optional(),
});

export const conversationDetailSchema = conversationSummarySchema.extend({
  otherParticipantLastReadAt: z.number().nullable().optional(),
  messages: z.array(conversationMessageSchema),
});

export const resolveDirectConversationInputSchema = z.object({
  targetUserId: z.string().min(1),
});

export const sendConversationMessageInputSchema = z.object({
  conversationId: z.string().min(1).optional(),
  targetUserId: z.string().min(1).optional(),
  body: z.string().trim().min(1),
  clientRequestId: z.string().min(1).optional(),
  type: conversationMessageTypeSchema.optional(),
  metadata: z.unknown().optional(),
}).refine((value) => Boolean(value.conversationId || value.targetUserId), {
  message: "conversationId or targetUserId is required",
});

export const inboxUnreadSummarySchema = z.object({
  unreadCount: z.number().int().nonnegative(),
});

export const markConversationReadInputSchema = z.object({
  conversationId: z.string().min(1),
});

export const setConversationArchivedInputSchema = z.object({
  conversationId: z.string().min(1),
  archived: z.boolean(),
});

export const bootstrapOfferConversationInputSchema = z.object({
  offerId: z.string().min(1),
});

export const bootstrapOfferConversationResultSchema = z.object({
  conversationId: z.string().min(1),
  starterMessageCreated: z.boolean(),
});

export const shareFileInConversationInputSchema = z.object({
  conversationId: z.string().min(1),
  file: uploadedFileReferenceSchema,
  note: z.string().trim().min(1).optional(),
});

export const shareProjectInConversationInputSchema = z.object({
  conversationId: z.string().min(1),
  propertyId: z.string().min(1),
  note: z.string().trim().min(1).optional(),
});

export const shareDealInConversationInputSchema = z.object({
  conversationId: z.string().min(1),
  dealId: z.string().min(1),
  note: z.string().trim().min(1).optional(),
});

export const createPrivateOfferInConversationInputSchema = z.object({
  conversationId: z.string().min(1),
  propertyId: z.string().min(1),
  price: z.number().finite(),
  message: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  attachments: z.array(uploadedFileReferenceSchema).optional(),
});

export const updatePrivateOfferDraftInConversationInputSchema = z.object({
  conversationId: z.string().min(1),
  offerId: z.string().min(1),
  propertyId: z.string().min(1),
  price: z.number().finite(),
  message: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  attachments: z.array(uploadedFileReferenceSchema).optional(),
});

export const publishConversationOfferInputSchema = z.object({
  conversationId: z.string().min(1),
  offerId: z.string().min(1),
});

export const respondToConversationOfferInputSchema = z.object({
  conversationId: z.string().min(1),
  offerId: z.string().min(1),
  status: z.enum(["accepted", "rejected"]),
});

export type UserConversationTarget = z.infer<typeof conversationTargetSchema>;
export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type ConversationSummary = z.infer<typeof conversationSummarySchema>;
export type ConversationDetail = z.infer<typeof conversationDetailSchema>;
export type TextMessageMetadata = z.infer<typeof textMessageMetadataSchema>;
export type OfferEventMetadata = z.infer<typeof offerEventMetadataSchema>;
export type FileShareMetadata = z.infer<typeof fileShareMetadataSchema>;
export type ProjectShareMetadata = z.infer<typeof projectShareMetadataSchema>;
export type DealShareMetadata = z.infer<typeof dealShareMetadataSchema>;
export type InviteEventMetadata = z.infer<typeof inviteEventMetadataSchema>;
export type RoleEventMetadata = z.infer<typeof roleEventMetadataSchema>;
export type ResolveDirectConversationInput = z.infer<typeof resolveDirectConversationInputSchema>;
export type SendConversationMessageInput = z.infer<typeof sendConversationMessageInputSchema>;
export type MarkConversationReadInput = z.infer<typeof markConversationReadInputSchema>;
export type SetConversationArchivedInput = z.infer<typeof setConversationArchivedInputSchema>;
export type InboxUnreadSummary = z.infer<typeof inboxUnreadSummarySchema>;
export type BootstrapOfferConversationInput = z.infer<typeof bootstrapOfferConversationInputSchema>;
export type BootstrapOfferConversationResult = z.infer<typeof bootstrapOfferConversationResultSchema>;
export type ShareFileInConversationInput = z.infer<typeof shareFileInConversationInputSchema>;
export type ShareProjectInConversationInput = z.infer<typeof shareProjectInConversationInputSchema>;
export type ShareDealInConversationInput = z.infer<typeof shareDealInConversationInputSchema>;
export type CreatePrivateOfferInConversationInput = z.infer<typeof createPrivateOfferInConversationInputSchema>;
export type UpdatePrivateOfferDraftInConversationInput = z.infer<typeof updatePrivateOfferDraftInConversationInputSchema>;
export type PublishConversationOfferInput = z.infer<typeof publishConversationOfferInputSchema>;
export type RespondToConversationOfferInput = z.infer<typeof respondToConversationOfferInputSchema>;
