import type { Context } from "hono";
import { approveAgentConfirmation, cancelAgentConfirmation } from "../services/confirmations";

function getConfirmationParams(c: Context) {
  const organizationId = c.req.param("organizationId");
  const confirmationId = c.req.param("confirmationId");
  if (!organizationId) return { error: "Organization id is required." };
  if (!confirmationId) return { error: "Confirmation id is required." };
  return { organizationId, confirmationId };
}

export async function handleApproveAgentConfirmation(c: Context) {
  const params = getConfirmationParams(c);
  if ("error" in params) return c.json({ error: params.error }, 400);

  try {
    const result = await approveAgentConfirmation(c, params.organizationId, params.confirmationId);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Agent confirmation could not be approved." }, 400);
  }
}

export async function handleCancelAgentConfirmation(c: Context) {
  const params = getConfirmationParams(c);
  if ("error" in params) return c.json({ error: params.error }, 400);

  try {
    const confirmation = await cancelAgentConfirmation(c, params.organizationId, params.confirmationId);
    return c.json({ confirmation });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : "Agent confirmation could not be canceled." }, 400);
  }
}
