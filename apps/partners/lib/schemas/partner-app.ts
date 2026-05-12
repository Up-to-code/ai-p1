import { z } from "zod/v4";
import type { PartnerAppClientType } from "@/server/partnerApps";
import { accessCheckpointScopesSchema } from "@/validation/access-checkpoints";

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
  iconUrl: z.string().trim().url("Enter a valid icon URL.").optional().or(z.literal("")),
  logoUrl: z.string().trim().url("Enter a valid logo URL.").optional().or(z.literal("")),
  homepageUrl: z.string().trim().url("Enter a valid partner app URL."),
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
    iconUrl: formData.get("iconUrl") || undefined,
    logoUrl: formData.get("logoUrl") || undefined,
    homepageUrl: formData.get("homepageUrl"),
    clientType: formData.get("clientType") || "public",
    redirectUris: formData.get("redirectUris"),
    allowedScopes: formData.get("allowedScopes"),
  }) as PartnerAppPayload;
}
