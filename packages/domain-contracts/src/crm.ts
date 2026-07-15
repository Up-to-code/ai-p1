import { z } from "zod";

export const leadStatusSchema = z.enum(["new", "qualified", "disqualified", "converted"]);
export const leadInputSchema = z.object({
  name: z.string().trim().min(1).max(200), email: z.string().trim().email().optional(), phone: z.string().trim().max(80).optional(),
  companyName: z.string().trim().max(200).optional(), source: z.string().trim().min(1).max(100), notes: z.string().trim().max(20_000).optional(),
  estimatedValueMinor: z.number().int().nonnegative().optional(), currency: z.string().trim().length(3).optional(), ownerUserId: z.string().optional(),
});
export const companyInputSchema = z.object({ name: z.string().trim().min(1).max(200), website: z.string().url().optional(), industry: z.string().trim().max(120).optional() });
export const contactInputSchema = z.object({ companyId: z.string().optional(), clientId: z.string().optional(), name: z.string().trim().min(1).max(200), email: z.string().trim().email().optional(), phone: z.string().trim().max(80).optional(), title: z.string().trim().max(120).optional() });

export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type LeadInput = z.infer<typeof leadInputSchema>;
export type CompanyInput = z.infer<typeof companyInputSchema>;
export type ContactInput = z.infer<typeof contactInputSchema>;
