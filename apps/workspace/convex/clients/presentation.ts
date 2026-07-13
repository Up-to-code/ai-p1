import type { Doc } from "../_generated/dataModel";
import { revealClientPii } from "../security/clientPii";
import { isoDate } from "../shared/present";
import { normalizeClientPriority, resolveClientPipelineStage } from "./validators";

function withoutPrivateClientFields(client: Doc<"clients">) {
  const safeClient = { ...client };
  delete safeClient.deletedAt;
  delete safeClient.encryptedEmail;
  delete safeClient.encryptedPhone;
  delete safeClient.piiEncryptedAt;
  return safeClient;
}

/** Present a Client without encrypted or soft-delete implementation fields. */
export async function presentClient(client: Doc<"clients">) {
  const safeClient = withoutPrivateClientFields(client);
  const pii = await revealClientPii(client);
  return {
    ...safeClient,
    ...pii,
    id: client._id,
    visibility: client.visibility ?? "private",
    ownerUserId: client.ownerUserId ?? "",
    source: client.source ?? "",
    createdByUserId: client.createdByUserId ?? "",
    phone: pii.phone ?? client.phone ?? "",
    contact: client.contact ?? pii.email ?? client.email ?? client.phone ?? client.company ?? "",
    priority: normalizeClientPriority(client.priority),
    budget: client.budget ?? "",
    assetInterest: client.assetInterest ?? client.notes ?? client.source ?? "",
    pipelineStage: resolveClientPipelineStage(client),
    pipelineOrder: client.pipelineOrder,
    added: client.added ?? isoDate(client.createdAt),
    lastContact: client.lastContact ?? isoDate(client.updatedAt),
  };
}

export const presentClientListItem = presentClient;
