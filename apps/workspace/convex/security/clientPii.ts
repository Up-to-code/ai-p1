import { protectOrganizationText, redactSensitiveText, revealOrganizationText } from "./organizationData";
import type { Doc } from "../_generated/dataModel";

export type ClientPiiInput = {
  contact: string;
  phone: string;
  nationality: string;
  budget: string;
};

export async function protectClientPii(organizationId: string, input: ClientPiiInput) {
  return {
    contact: redactSensitiveText(input.contact, 120),
    phone: redactSensitiveText(input.phone, 80),
    nationality: redactSensitiveText(input.nationality, 120),
    budget: redactSensitiveText(input.budget, 120),
    encryptedContact: await protectOrganizationText(organizationId, "client-contact", input.contact),
    encryptedPhone: await protectOrganizationText(organizationId, "client-phone", input.phone),
    encryptedNationality: await protectOrganizationText(organizationId, "client-nationality", input.nationality),
    encryptedBudget: await protectOrganizationText(organizationId, "client-budget", input.budget),
    piiEncryptedAt: Date.now(),
  };
}

export async function revealClientPii(client: Doc<"clients">) {
  return {
    contact: await revealOrganizationText(client.organizationId, "client-contact", client.encryptedContact, client.contact),
    phone: await revealOrganizationText(client.organizationId, "client-phone", client.encryptedPhone, client.phone),
    nationality: await revealOrganizationText(client.organizationId, "client-nationality", client.encryptedNationality, client.nationality),
    budget: await revealOrganizationText(client.organizationId, "client-budget", client.encryptedBudget, client.budget),
  };
}
