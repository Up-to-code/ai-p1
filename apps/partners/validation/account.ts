import { z } from "zod/v4";

export const partnerProfileFormSchema = z.object({
  name: z.string().trim().min(2, "Display name must be at least 2 characters.").max(80, "Display name must be 80 characters or fewer."),
});

export const programmerOrganizationFormSchema = z.object({
  name: z.string().trim().min(2, "Organization name must be at least 2 characters.").max(120, "Organization name must be 120 characters or fewer."),
  countryCode: z.string().trim().regex(/^[a-zA-Z]{2}$/u, "Use a 2-letter country code.").transform((value) => value.toUpperCase()),
});

export type PartnerProfileFormValues = z.infer<typeof partnerProfileFormSchema>;
export type ProgrammerOrganizationFormValues = z.infer<typeof programmerOrganizationFormSchema>;
