import type { Context } from "hono";
import { validateJsonBody } from "@/server/utils/request/json-body";
import {
  acceptOrganizationInviteLink,
  cancelOrganizationInviteLink,
  createOrganizationInviteLink,
} from "../services/invite-links";
import {
  acceptOrganizationInviteLinkSchema,
  createOrganizationInviteLinkSchema,
} from "../validation/invite-link.schema";

function errorResponse(c: Context, error: unknown, fallback: string, status: 400 | 403 | 500 = 500) {
  const message = error instanceof Error ? error.message : fallback;
  return c.json({ error: message }, status);
}

export async function handleCreateOrganizationInviteLink(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    return c.json({ error: "Organization id is required." }, 400);
  }

  const parsed = await validateJsonBody(
    c,
    createOrganizationInviteLinkSchema,
    "Invalid invite link payload.",
  );

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const origin = new URL(c.req.url).origin;
    const result = await createOrganizationInviteLink(organizationId, parsed.data, origin);
    return c.json(result);
  } catch (error) {
    return errorResponse(c, error, "Invite link could not be created.", 403);
  }
}

export async function handleAcceptOrganizationInviteLink(c: Context) {
  const parsed = await validateJsonBody(
    c,
    acceptOrganizationInviteLinkSchema,
    "Invalid invite link payload.",
  );

  if (!parsed.ok) {
    return parsed.response;
  }

  try {
    const inviteLink = await acceptOrganizationInviteLink(parsed.data);
    return c.json({ inviteLink });
  } catch (error) {
    return errorResponse(c, error, "Invite link could not be accepted.", 403);
  }
}

export async function handleCancelOrganizationInviteLink(c: Context) {
  const organizationId = c.req.param("organizationId");
  const inviteLinkId = c.req.param("inviteLinkId");

  if (!organizationId || !inviteLinkId) {
    return c.json({ error: "Organization id and invite link id are required." }, 400);
  }

  try {
    const inviteLink = await cancelOrganizationInviteLink(organizationId, inviteLinkId);
    return c.json({ inviteLink });
  } catch (error) {
    return errorResponse(c, error, "Invite link could not be canceled.", 403);
  }
}
