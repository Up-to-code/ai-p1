import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import {
  acceptOrganizationInviteLink,
  cancelOrganizationInviteLink,
  createOrganizationInviteLink,
} from "../services/invite-links";
import {
  acceptOrganizationInviteLinkSchema,
  createOrganizationInviteLinkSchema,
} from "../validation/invite-link.schema";

export async function handleCreateOrganizationInviteLink(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

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
    const result = await createOrganizationInviteLink(org.organizationId, parsed.data, origin);
    return c.json(result);
  } catch (error) {
    return actionErrorJson(c, error, "Invite link could not be created.");
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
    return actionErrorJson(c, error, "Invite link could not be accepted.");
  }
}

export async function handleCancelOrganizationInviteLink(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;
  const inviteLinkId = c.req.param("inviteLinkId");
  if (!inviteLinkId) return c.json({ error: "Invite link id is required." }, 400);

  try {
    const inviteLink = await cancelOrganizationInviteLink(org.organizationId, inviteLinkId);
    return c.json({ inviteLink });
  } catch (error) {
    return actionErrorJson(c, error, "Invite link could not be canceled.");
  }
}
