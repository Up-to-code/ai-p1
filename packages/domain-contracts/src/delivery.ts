import { z } from "zod";

export const commercialModelSchema = z.enum(["fixed_scope", "retainer", "time_and_materials"]);
export const proposalStatusSchema = z.enum(["draft", "sent", "accepted", "rejected", "expired", "superseded"]);
export const contractStatusSchema = z.enum(["draft", "sent", "signed", "active", "terminated", "expired"]);
export const engagementStatusSchema = z.enum(["planned", "active", "on_hold", "completed", "cancelled"]);
export const deliveryHealthSchema = z.enum(["on_track", "at_risk", "blocked"]);
export const deliverableStatusSchema = z.enum(["planned", "in_progress", "submitted", "approved", "rejected"]);
export const approvalStatusSchema = z.enum(["pending", "approved", "rejected", "cancelled"]);
export const changeOrderStatusSchema = z.enum(["draft", "submitted", "approved", "rejected", "cancelled"]);
export const concernTypeSchema = z.enum(["risk", "issue"]);
export const concernSeveritySchema = z.enum(["low", "medium", "high", "critical"]);
export const concernStatusSchema = z.enum(["open", "mitigated", "resolved", "closed"]);

const moneyFields = {
  amountMinor: z.number().int().nonnegative(),
  currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
};

export const proposalInputSchema = z.object({
  dealId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  scope: z.string().trim().min(1).max(50_000),
  commercialModel: commercialModelSchema,
  ...moneyFields,
  validUntil: z.number().int().positive().optional(),
});

export const contractTermsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  scope: z.string().trim().min(1).max(50_000),
  billingTerms: z.string().trim().min(1).max(20_000),
  startAt: z.number().int().positive().optional(),
  endAt: z.number().int().positive().optional(),
}).refine((value) => !value.startAt || !value.endAt || value.endAt >= value.startAt, {
  message: "Contract end date must not precede its start date.",
  path: ["endAt"],
});

export const deliverableInputSchema = z.object({
  engagementId: z.string().min(1),
  projectId: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(20_000).optional(),
  dueAt: z.number().int().positive().optional(),
});

export const changeOrderInputSchema = z.object({
  engagementId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  reason: z.string().trim().min(1).max(20_000),
  scopeDelta: z.string().trim().min(1).max(20_000),
  amountDeltaMinor: z.number().int(),
});

export type CommercialModel = z.infer<typeof commercialModelSchema>;
export type ProposalStatus = z.infer<typeof proposalStatusSchema>;
export type ContractStatus = z.infer<typeof contractStatusSchema>;
export type EngagementStatus = z.infer<typeof engagementStatusSchema>;
export type DeliveryHealth = z.infer<typeof deliveryHealthSchema>;
export type DeliverableStatus = z.infer<typeof deliverableStatusSchema>;
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type ChangeOrderStatus = z.infer<typeof changeOrderStatusSchema>;
export type ProposalInput = z.infer<typeof proposalInputSchema>;
export type ContractTerms = z.infer<typeof contractTermsSchema>;
export type DeliverableInput = z.infer<typeof deliverableInputSchema>;
export type ChangeOrderInput = z.infer<typeof changeOrderInputSchema>;
