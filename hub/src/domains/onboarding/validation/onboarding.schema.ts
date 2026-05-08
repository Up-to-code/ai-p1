import { z } from "zod";
import { requiredText } from "@/validation/common.schema";

export const companyInfoSchema = z.object({
  legalName: requiredText("Legal name"),
  displayName: requiredText("Display name"),
  crNumber: requiredText("CR number"),
  hqCity: requiredText("City"),
});

export const legalDocsSchema = z.object({
  authName: requiredText("Signer name"),
  authTitle: requiredText("Signer title"),
});

export const brandSetupSchema = z.object({
  brandName: requiredText("Brand name"),
  brandColor: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, "Use a valid hex color."),
});

export const teamInviteSchema = z.object({
  inviteEmail: z.string().trim().email("Enter a valid email address."),
  inviteRole: requiredText("Role"),
});

export type CompanyInfoInput = z.input<typeof companyInfoSchema>;
export type LegalDocsInput = z.input<typeof legalDocsSchema>;
export type BrandSetupInput = z.input<typeof brandSetupSchema>;
export type TeamInviteInput = z.input<typeof teamInviteSchema>;
