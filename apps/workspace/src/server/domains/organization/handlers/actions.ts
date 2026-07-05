import type { Context } from "hono";
import { requireOrganizationId } from "@/server/utils/organization/require-organization-id";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { actionErrorJson } from "@/server/utils/response/action-error";
import { logger } from "@/lib/logger";
import {
  acceptOrganizationEmailInvitation,
  cancelOrganizationEmailInvitation,
  createOrganizationEmailInvitation,
  createOrganizationWorkRole,
  deleteOrganizationWorkRole,
  getCapabilities,
  listOrganizationMembers,
  listOrganizationWorkRoles,
  removeOrganizationMember,
  updateOrganizationIdentity,
  updateOrganizationMemberRole,
  updateOrganizationWorkRole,
} from "../services/actions";
import {
  acceptOrganizationInvitationSchema,
  createOrganizationInvitationSchema,
  createOrganizationRoleSchema,
  organizationIdentityUpdateSchema,
  updateOrganizationMemberRoleSchema,
  updateOrganizationRoleSchema,
} from "../validation/actions.schema";

export async function handleGetOrganizationCapabilities(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const startedAt = Date.now();
  try {
    const capabilities = await getCapabilities(org.organizationId);
    const elapsedMs = Date.now() - startedAt;
    if (process.env.NODE_ENV !== "production" && elapsedMs > 750) {
      logger.warn("Slow capability load", { 
        module: 'organization-capabilities',
        elapsedMs,
        route: "GET /api/v1/organizations/:organizationId/capabilities",
        organizationId: org.organizationId,
      });
    }
    return c.json({ capabilities });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleListOrganizationMembers(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    const members = await listOrganizationMembers(c, org.organizationId);
    return c.json({ members });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleListOrganizationRoles(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  try {
    const roles = await listOrganizationWorkRoles(c, org.organizationId);
    return c.json({ roles });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleUpdateOrganizationIdentity(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const parsed = await validateJsonBody(c, organizationIdentityUpdateSchema, "Invalid organization payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const organization = await updateOrganizationIdentity(c, org.organizationId, parsed.data);
    return c.json({ organization });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleCreateOrganizationInvitation(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const parsed = await validateJsonBody(c, createOrganizationInvitationSchema, "Invalid invitation payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const invitation = await createOrganizationEmailInvitation(c, org.organizationId, parsed.data);
    return c.json({ invitation });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleAcceptOrganizationInvitation(c: Context) {
  const parsed = await validateJsonBody(c, acceptOrganizationInvitationSchema, "Invalid invitation payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const invitation = await acceptOrganizationEmailInvitation(c, parsed.data.invitationId);
    return c.json({ invitation });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleCancelOrganizationInvitation(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const invitationId = c.req.param("invitationId");
  if (!invitationId) {
    return c.json({ error: "Invitation id is required." }, 400);
  }

  try {
    const invitation = await cancelOrganizationEmailInvitation(c, org.organizationId, invitationId);
    return c.json({ invitation });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleUpdateOrganizationMemberRole(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const memberId = c.req.param("memberId");
  if (!memberId) {
    return c.json({ error: "Member id is required." }, 400);
  }

  const parsed = await validateJsonBody(c, updateOrganizationMemberRoleSchema, "Invalid member role payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const member = await updateOrganizationMemberRole(c, org.organizationId, memberId, parsed.data);
    return c.json({ member });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleRemoveOrganizationMember(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const memberId = c.req.param("memberId");
  if (!memberId) {
    return c.json({ error: "Member id is required." }, 400);
  }

  try {
    const member = await removeOrganizationMember(c, org.organizationId, memberId);
    return c.json({ member });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleCreateOrganizationRole(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const parsed = await validateJsonBody(c, createOrganizationRoleSchema, "Invalid work role payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const role = await createOrganizationWorkRole(c, org.organizationId, parsed.data);
    return c.json({ role });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleUpdateOrganizationRole(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const roleId = c.req.param("roleId");
  if (!roleId) {
    return c.json({ error: "Work role id is required." }, 400);
  }

  const parsed = await validateJsonBody(c, updateOrganizationRoleSchema, "Invalid work role payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const role = await updateOrganizationWorkRole(c, org.organizationId, roleId, parsed.data);
    return c.json({ role });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}

export async function handleDeleteOrganizationRole(c: Context) {
  const org = requireOrganizationId(c);
  if (!org.ok) return org.response;

  const roleId = c.req.param("roleId");
  if (!roleId) {
    return c.json({ error: "Work role id is required." }, 400);
  }

  try {
    const role = await deleteOrganizationWorkRole(c, org.organizationId, roleId);
    return c.json({ role });
  } catch (error) {
    return actionErrorJson(c, error, "Organization action failed.");
  }
}
