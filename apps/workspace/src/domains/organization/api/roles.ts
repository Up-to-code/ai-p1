"use client";

import {
  organizationApiPath,
  requestOrganizationAction,
} from "./organization-request";
import type { OrganizationRole } from "./types";
import type { OrganizationPermissionStatement } from "@qentrah/auth";

export function listOrganizationRoles(organizationId: string) {
  return requestOrganizationAction<{ roles: OrganizationRole[] }>(
    organizationApiPath(organizationId, "roles"),
    "GET",
    undefined,
    "Roles could not be loaded.",
  ).then((result) => result.roles);
}

export function createOrganizationRole(
  organizationId: string,
  role: string,
  permission: Partial<Record<keyof OrganizationPermissionStatement, string[]>>,
) {
  return requestOrganizationAction<{ role: { roleData: OrganizationRole } }>(
    organizationApiPath(organizationId, "roles"),
    "POST",
    { role, permission },
    "Role could not be created.",
  ).then((result) => result.role);
}

export function updateOrganizationRole(
  organizationId: string,
  roleId: string,
  data: {
    roleName?: string;
    permission?: Partial<Record<keyof OrganizationPermissionStatement, string[]>>;
  },
) {
  return requestOrganizationAction<{ role: { roleData: OrganizationRole } }>(
    organizationApiPath(organizationId, "roles", roleId),
    "PATCH",
    data,
    "Role could not be updated.",
  ).then((result) => result.role);
}

export function deleteOrganizationRole(organizationId: string, roleId: string) {
  return requestOrganizationAction<{ role: unknown }>(
    organizationApiPath(organizationId, "roles", roleId),
    "DELETE",
    undefined,
    "Role could not be deleted.",
  ).then((result) => result.role);
}
