import { z } from "zod/v4";
import type { PartnerAppClientType } from "@/server/partnerApps";
import { accessCheckpointScopesSchema } from "@/validation/access-checkpoints";

const partnerAppCategorySchema = z.enum(["brokerage", "developer", "crm", "marketing", "operations", "other"]);
const partnerIntegrationModeSchema = z.enum(["integrate", "debug", "sandbox", "workspace", "production"]);

function parseLines(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  return String(value ?? "")
    .split(/[\n,]+/u)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const urlListSchema = z
  .preprocess(parseLines, z.array(z.string().url("Enter a valid HTTPS redirect URI.")))
  .refine((items) => items.length > 0, "Add at least one redirect URI.")
  .refine((items) => items.every((item) => item.startsWith("https://") || item.startsWith("http://localhost")), {
    message: "Redirect URIs must use HTTPS, except localhost during development.",
  });

const scopeListSchema = z
  .preprocess(parseLines, accessCheckpointScopesSchema)
  .refine((items) => items.length > 0, "Add at least one scope.");

export const partnerAppFormSchema = z.object({
  appId: z.string().optional(),
  name: z.string().trim().min(2, "App name must be at least 2 characters."),
  publisherName: z.string().trim().min(2, "Publisher must be at least 2 characters."),
  description: z
    .string()
    .trim()
    .min(24, "Describe the integration in at least 24 characters.")
    .max(320, "Keep the description under 320 characters.")
    .default("Partner integration managed in Qentrah Partners."),
  appCategory: partnerAppCategorySchema.default("operations"),
  integrationMode: partnerIntegrationModeSchema.default("sandbox"),
  supportEmail: z.string().trim().email("Enter a valid support email.").optional().or(z.literal("")),
  iconUrl: z.string().trim().url("Enter a valid icon URL.").optional().or(z.literal("")),
  logoUrl: z.string().trim().url("Enter a valid logo URL.").optional().or(z.literal("")),
  homepageUrl: z.string().trim().url("Enter a valid partner app URL."),
  webhookUrl: z.string().trim().url("Enter a valid webhook URL.").optional().or(z.literal("")),
  privacyPolicyUrl: z.string().trim().url("Enter a valid privacy policy URL.").optional().or(z.literal("")),
  termsOfServiceUrl: z.string().trim().url("Enter a valid terms URL.").optional().or(z.literal("")),
  clientType: z.enum(["public", "confidential"]).default("public"),
  redirectUris: urlListSchema,
  allowedScopes: scopeListSchema,
});

export type PartnerAppFormValues = z.input<typeof partnerAppFormSchema>;
export type PartnerAppPayload = z.output<typeof partnerAppFormSchema> & { clientType: PartnerAppClientType };

export function parsePartnerAppFormData(formData: FormData): PartnerAppPayload {
  return partnerAppFormSchema.parse({
    appId: formData.get("appId") || undefined,
    name: formData.get("name"),
    publisherName: formData.get("publisherName"),
    description: formData.get("description"),
    appCategory: formData.get("appCategory") || "operations",
    integrationMode: formData.get("integrationMode") || "sandbox",
    supportEmail: formData.get("supportEmail") || undefined,
    iconUrl: formData.get("iconUrl") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
    homepageUrl: formData.get("homepageUrl"),
    webhookUrl: formData.get("webhookUrl") || undefined,
    privacyPolicyUrl: formData.get("privacyPolicyUrl") || undefined,
    termsOfServiceUrl: formData.get("termsOfServiceUrl") || undefined,
    clientType: formData.get("clientType") || "public",
    redirectUris: formData.get("redirectUris"),
    allowedScopes: formData.get("allowedScopes"),
  }) as PartnerAppPayload;
}
