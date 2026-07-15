import { z } from "zod";

export const resourcePrincipalTypeSchema = z.enum(["user", "contractor"]);
export const resourceAllocationStatusSchema = z.enum(["planned", "confirmed", "cancelled"]);
export const resourceLeaveStatusSchema = z.enum(["requested", "approved", "rejected", "cancelled"]);
export const resourceSkillLevelSchema = z.number().int().min(1).max(5);

export const resourceIntervalSchema = z.object({
  startAt: z.number().int().nonnegative(),
  endAt: z.number().int().positive(),
}).refine(({ startAt, endAt }) => endAt > startAt, "endAt must be after startAt");

export const resourceAllocationInputSchema = resourceIntervalSchema.extend({
  principalType: resourcePrincipalTypeSchema,
  principalId: z.string().min(1),
  projectId: z.string().optional(),
  engagementId: z.string().optional(),
  allocatedMinutes: z.number().int().positive(),
  billable: z.boolean(),
}).refine(({ projectId, engagementId }) => Boolean(projectId || engagementId), "An allocation requires a Project or Engagement");

export type ResourcePrincipalType = z.infer<typeof resourcePrincipalTypeSchema>;
export type ResourceAllocationStatus = z.infer<typeof resourceAllocationStatusSchema>;
export type ResourceLeaveStatus = z.infer<typeof resourceLeaveStatusSchema>;
export type ResourceAllocationInput = z.infer<typeof resourceAllocationInputSchema>;
