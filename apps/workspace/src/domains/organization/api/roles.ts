"use client";

import { workspaceFetch, workspaceMutation } from "@/domains/resources/workspace-resource-request";
import type { OrganizationRole } from "./types";
import type { OrganizationPermissionStatement } from "@qentrah/auth";

export function listOrganizationRoles(organizationId: string) {
  return workspaceFetch<{ roles: OrganizationRole[] }>(
    organizationId,
    "roles",
    { method: "GET", body: undefined, fallbackMessage: "Roles could not be loaded." },
  ).then((result) => result.roles);
}

export function createOrganizationRole(
  organizationId: string,
  role: string,
  permission: Partial<Record<keyof OrganizationPermissionStatement, string[]>>,
) {
  return workspaceMutation<{ role: { roleData: OrganizationRole } }>(
    organizationId,
    "roles",
    { method: "POST", body: { role, permission }, fallbackMessage: "Role could not be created." },
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
  return workspaceMutation<{ role: { roleData: OrganizationRole } }>(
    organizationId,
    `roles/${roleId}`,
    { method: "PATCH", body: data, fallbackMessage: "Role could not be updated." },
  ).then((result) => result.role);
}

export function deleteOrganizationRole(organizationId: string, roleId: string) {
  return workspaceMutation<{ role: unknown }>(
    organizationId,
    `roles/${roleId}`,
    { method: "DELETE", body: undefined, fallbackMessage: "Role could not be deleted." },
  ).then((result) => result.role);
}
