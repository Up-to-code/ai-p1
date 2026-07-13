import { protectOrganizationText, redactSensitiveText, revealOrganizationText } from "./organizationData";
import type { Doc } from "../_generated/dataModel";

export type ClientPiiInput = {
  email?: string;
  phone?: string;
};

export async function protectClientPii(organizationId: string, input: ClientPiiInput) {
  return {
    email: input.email ? redactSensitiveText(input.email, 160) : undefined,
    phone: input.phone ? redactSensitiveText(input.phone, 80) : undefined,
    encryptedEmail: input.email ? await protectOrganizationText(organizationId, "client-email", input.email) : undefined,
    encryptedPhone: input.phone ? await protectOrganizationText(organizationId, "client-phone", input.phone) : undefined,
    piiEncryptedAt: Date.now(),
  };
}

/** Encrypt only PII fields explicitly present in a patch, preserving omitted values. */
export async function protectClientPiiPatch(organizationId: string, input: ClientPiiInput) {
  const patch: Record<string, string | number | undefined> = {};
  if (Object.hasOwn(input, "email")) {
    patch.email = input.email ? redactSensitiveText(input.email, 160) : undefined;
    patch.encryptedEmail = input.email
      ? await protectOrganizationText(organizationId, "client-email", input.email)
      : undefined;
  }
  if (Object.hasOwn(input, "phone")) {
    patch.phone = input.phone ? redactSensitiveText(input.phone, 80) : undefined;
    patch.encryptedPhone = input.phone
      ? await protectOrganizationText(organizationId, "client-phone", input.phone)
      : undefined;
  }
  if (Object.hasOwn(input, "email") || Object.hasOwn(input, "phone")) {
    patch.piiEncryptedAt = Date.now();
  }
  return patch;
}

export async function revealClientPii(client: Doc<"clients">) {
  return {
    email: client.encryptedEmail
      ? await revealOrganizationText(client.organizationId, "client-email", client.encryptedEmail, client.email)
      : client.email,
    phone: client.encryptedPhone
      ? await revealOrganizationText(client.organizationId, "client-phone", client.encryptedPhone, client.phone)
      : client.phone,
  };
}
