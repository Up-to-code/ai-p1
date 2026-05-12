import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

export const updateOrganizationProfileSchema = z.object({
  name: requiredText("Organization name").max(120, "Organization name is too long."),
  legalName: z.string().trim().max(180, "Legal name is too long."),
  type: z.string().trim().max(80, "Organization type is too long."),
  email: z.string().trim().email("Enter a valid email address.").or(z.literal("")),
  phone: z.string().trim().max(40, "Phone is too long."),
  website: z.string().trim().max(120, "Website is too long."),
  address: z.string().trim().max(240, "Address is too long."),
});

export type UpdateOrganizationProfileValues = z.output<typeof updateOrganizationProfileSchema>;
