import type { ToolContext } from "eve/tools";
import { api } from "@convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery } from "./convex";
import { requireOrgId } from "./org-context";
import type {
  OrganizationInvitationForPolicy,
  OrganizationMemberForPolicy,
  OrganizationRoleForPolicy,
} from "./access-policy";

type OrganizationResource =
  | "organization"
  | "team"
  | "member"
  | "role"
  | "client"
  | "task"
  | "project"
  | "asset"
  | "calendar"
  | "media"
  | "visibility"
  | "integration"
  | "apiKey"
  | "oauthApp"
  | "space";

export class OrganizationActionError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.name = "OrganizationActionError";
    this.status = status;
  }
}

export async function requireOrganizationAction(
  ctx: ToolContext,
  organizationId: string,
  resource: OrganizationResource,
  action: string,
) {
  try {
    const allowed = await fetchAuthQuery(
      ctx,
      api.organizations.profile.access.canUseResourceAction,
      { organizationId, resource, action },
    ).then((r) => r.allowed);

    if (!allowed) {
      throw new Error(`You do not have permission to ${action} this organization ${resource}.`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "You are not allowed to perform this organization action.";
    throw new OrganizationActionError(message, 403);
  }
}

export async function recordOrganizationAction(
  ctx: ToolContext,
  organizationId: string,
  input: { action: string; target: string; summary: string },
) {
  return fetchAuthMutation(ctx, api.organizations.audit.write.recordFromHono, {
    organizationId,
    input,
  });
}

export async function runOrganizationActionWorkflow<T>(
  ctx: ToolContext,
  organizationId: string,
  options: {
    permission: { resource: OrganizationResource; action: string };
    prepare?: () => Promise<void>;
    perform: () => Promise<T>;
    audit: { action: string; target: string; summary: string | ((result: T) => string) };
  },
) {
  await requireOrganizationAction(ctx, organizationId, options.permission.resource, options.permission.action);
  await options.prepare?.();
  const result = await options.perform();
  await recordOrganizationAction(ctx, organizationId, {
    action: options.audit.action,
    target: options.audit.target,
    summary: typeof options.audit.summary === "function" ? options.audit.summary(result) : options.audit.summary,
  });
  return result;
}
