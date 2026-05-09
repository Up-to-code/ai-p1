import { z } from "zod";

export const updateOrganizationProfileSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required.").max(120),
  legalName: z.string().trim().max(180),
  type: z.string().trim().max(80),
  email: z.string().trim().email().or(z.literal("")),
  phone: z.string().trim().max(40),
  website: z.string().trim().max(120),
  address: z.string().trim().max(240),
});

export type UpdateOrganizationProfileInput = z.infer<
  typeof updateOrganizationProfileSchema
>;
