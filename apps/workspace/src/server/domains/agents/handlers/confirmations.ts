import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { approveAgentConfirmation, cancelAgentConfirmation } from "../services/confirmations";

export async function handleApproveAgentConfirmation(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const confirmationId = c.req.param("confirmationId");
  if (!confirmationId) return c.json({ error: "Confirmation id is required." }, 400);

  try {
    const result = await approveAgentConfirmation(c, org.organizationId, confirmationId);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Agent confirmation could not be approved." }, 400);
  }
}

export async function handleCancelAgentConfirmation(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const confirmationId = c.req.param("confirmationId");
  if (!confirmationId) return c.json({ error: "Confirmation id is required." }, 400);

  try {
    const confirmation = await cancelAgentConfirmation(c, org.organizationId, confirmationId);
    return c.json({ confirmation });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Agent confirmation could not be canceled." }, 400);
  }
}
