import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

export const teamMemberSchema = z.object({
  name: requiredText("Name"),
  email: z.string().trim().email("Enter a valid email address."),
  role: z.enum(["Owner", "Admin", "Manager", "Editor", "Viewer"]),
});

export const apiKeySchema = z.object({
  name: requiredText("Key name"),
  scopes: z.array(z.enum(["Read", "Write", "Sync"])).min(1, "Select at least one scope."),
});

export const updateOrganizationProfileSchema = z.object({
  name: requiredText("Organization name").max(120, "Organization name is too long."),
  legalName: z.string().trim().max(180, "Legal name is too long."),
  type: z.string().trim().max(80, "Organization type is too long."),
  email: z.string().trim().email("Enter a valid email address.").or(z.literal("")),
  phone: z.string().trim().max(40, "Phone is too long."),
  website: z.string().trim().max(120, "Website is too long."),
  address: z.string().trim().max(240, "Address is too long."),
});

export type TeamMemberFormValues = z.input<typeof teamMemberSchema>;
export type ApiKeyFormValues = z.input<typeof apiKeySchema>;
export type UpdateOrganizationProfileValues = z.output<typeof updateOrganizationProfileSchema>;
