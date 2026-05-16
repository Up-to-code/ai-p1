import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { validateJsonBody } from "@/server/utils/request/json-body";
import { OrganizationActionError } from "../errors/action-error";
import {
  acceptOrganizationEmailInvitation,
  cancelOrganizationEmailInvitation,
  createOrganizationEmailInvitation,
  createOrganizationWorkRole,
  deleteOrganizationWorkRole,
  getCapabilities,
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

function organizationIdOrResponse(c: Context) {
  const organizationId = c.req.param("organizationId");
  if (!organizationId) {
    return { response: c.json({ error: "Organization id is required." }, 400) };
  }
  return { organizationId };
}

function handleActionError(c: Context, error: unknown) {
  const actionError = error as OrganizationActionError;
  return c.json(
    { error: actionError.message ?? "Organization action failed." },
    (actionError.status ?? 500) as ContentfulStatusCode,
  );
}

export async function handleGetOrganizationCapabilities(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  const startedAt = Date.now();
  try {
    const capabilities = await getCapabilities(params.organizationId);
    const elapsedMs = Date.now() - startedAt;
    if (process.env.NODE_ENV !== "production" && elapsedMs > 750) {
      console.warn("[organization-capabilities] Slow capability load", {
        route: "GET /api/v1/organizations/:organizationId/capabilities",
        organizationId: params.organizationId,
        elapsedMs,
      });
    }
    return c.json({ capabilities });
  } catch (error) {
    return handleActionError(c, error);
  }
}

export async function handleListOrganizationRoles(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  try {
    const roles = await listOrganizationWorkRoles(c, params.organizationId);
    return c.json({ roles });
  } catch (error) {
    return handleActionError(c, error);
  }
}

export async function handleUpdateOrganizationIdentity(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  const parsed = await validateJsonBody(c, organizationIdentityUpdateSchema, "Invalid organization payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const organization = await updateOrganizationIdentity(c, params.organizationId, parsed.data);
    return c.json({ organization });
  } catch (error) {
    return handleActionError(c, error);
  }
}

export async function handleCreateOrganizationInvitation(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  const parsed = await validateJsonBody(c, createOrganizationInvitationSchema, "Invalid invitation payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const invitation = await createOrganizationEmailInvitation(c, params.organizationId, parsed.data);
    return c.json({ invitation });
  } catch (error) {
    return handleActionError(c, error);
  }
}

export async function handleAcceptOrganizationInvitation(c: Context) {
  const parsed = await validateJsonBody(c, acceptOrganizationInvitationSchema, "Invalid invitation payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const invitation = await acceptOrganizationEmailInvitation(c, parsed.data.invitationId);
    return c.json({ invitation });
  } catch (error) {
    return handleActionError(c, error);
  }
}

export async function handleCancelOrganizationInvitation(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  const invitationId = c.req.param("invitationId");
  if (!invitationId) {
    return c.json({ error: "Invitation id is required." }, 400);
  }

  try {
    const invitation = await cancelOrganizationEmailInvitation(c, params.organizationId, invitationId);
    return c.json({ invitation });
  } catch (error) {
    return handleActionError(c, error);
  }
}

export async function handleUpdateOrganizationMemberRole(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  const memberId = c.req.param("memberId");
  if (!memberId) {
    return c.json({ error: "Member id is required." }, 400);
  }

  const parsed = await validateJsonBody(c, updateOrganizationMemberRoleSchema, "Invalid member role payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const member = await updateOrganizationMemberRole(c, params.organizationId, memberId, parsed.data);
    return c.json({ member });
  } catch (error) {
    return handleActionError(c, error);
  }
}

export async function handleRemoveOrganizationMember(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  const memberId = c.req.param("memberId");
  if (!memberId) {
    return c.json({ error: "Member id is required." }, 400);
  }

  try {
    const member = await removeOrganizationMember(c, params.organizationId, memberId);
    return c.json({ member });
  } catch (error) {
    return handleActionError(c, error);
  }
}

export async function handleCreateOrganizationRole(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  const parsed = await validateJsonBody(c, createOrganizationRoleSchema, "Invalid work role payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const role = await createOrganizationWorkRole(c, params.organizationId, parsed.data);
    return c.json({ role });
  } catch (error) {
    return handleActionError(c, error);
  }
}

export async function handleUpdateOrganizationRole(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  const roleId = c.req.param("roleId");
  if (!roleId) {
    return c.json({ error: "Work role id is required." }, 400);
  }

  const parsed = await validateJsonBody(c, updateOrganizationRoleSchema, "Invalid work role payload.");
  if (!parsed.ok) return parsed.response;

  try {
    const role = await updateOrganizationWorkRole(c, params.organizationId, roleId, parsed.data);
    return c.json({ role });
  } catch (error) {
    return handleActionError(c, error);
  }
}

export async function handleDeleteOrganizationRole(c: Context) {
  const params = organizationIdOrResponse(c);
  if ("response" in params) return params.response;

  const roleId = c.req.param("roleId");
  if (!roleId) {
    return c.json({ error: "Work role id is required." }, 400);
  }

  try {
    const role = await deleteOrganizationWorkRole(c, params.organizationId, roleId);
    return c.json({ role });
  } catch (error) {
    return handleActionError(c, error);
  }
}
