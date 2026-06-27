/**
 * Custom Role Management Service
 * 
 * Handles creation, update, deletion, and retrieval of custom AI agent roles
 * with their associated MCP permissions.
 */

import type { QuickRoleId } from "../constants/quick-roles";
import { QUICK_ROLES } from "../constants/quick-roles";

export interface CustomRole {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  basedOnQuickRole?: QuickRoleId;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  organizationId: string;
}

export interface CreateCustomRoleInput {
  name: string;
  description?: string;
  permissions: Record<string, string[]>;
  basedOnQuickRole?: QuickRoleId;
  organizationId: string;
  createdBy: string;
}

export interface UpdateCustomRoleInput {
  name?: string;
  description?: string;
  permissions?: Record<string, string[]>;
}

/**
 * In-memory storage for custom roles (in production, this would be a database)
 */
const customRolesStore = new Map<string, CustomRole>();

/**
 * Generate a unique ID for a custom role
 */
function generateRoleId(): string {
  return `custom_role_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a new custom role
 */
export function createCustomRole(input: CreateCustomRoleInput): CustomRole {
  const now = Date.now();
  const customRole: CustomRole = {
    id: generateRoleId(),
    name: input.name,
    description: input.description,
    permissions: input.permissions,
    basedOnQuickRole: input.basedOnQuickRole,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    organizationId: input.organizationId,
  };

  customRolesStore.set(customRole.id, customRole);
  return customRole;
}

/**
 * Get a custom role by ID
 */
export function getCustomRole(roleId: string): CustomRole | undefined {
  return customRolesStore.get(roleId);
}

/**
 * Update an existing custom role
 */
export function updateCustomRole(roleId: string, input: UpdateCustomRoleInput): CustomRole | null {
  const existing = customRolesStore.get(roleId);
  if (!existing) return null;

  const updated: CustomRole = {
    ...existing,
    name: input.name ?? existing.name,
    description: input.description ?? existing.description,
    permissions: input.permissions ?? existing.permissions,
    updatedAt: Date.now(),
  };

  customRolesStore.set(roleId, updated);
  return updated;
}

/**
 * Delete a custom role
 */
export function deleteCustomRole(roleId: string): boolean {
  return customRolesStore.delete(roleId);
}

/**
 * List all custom roles for an organization
 */
export function listCustomRoles(organizationId: string): CustomRole[] {
  return Array.from(customRolesStore.values()).filter(
    (role) => role.organizationId === organizationId
  );
}

/**
 * Duplicate a custom role
 */
export function duplicateCustomRole(roleId: string, newName: string, duplicatedBy: string): CustomRole | null {
  const existing = customRolesStore.get(roleId);
  if (!existing) return null;

  return createCustomRole({
    name: newName,
    description: existing.description,
    permissions: { ...existing.permissions },
    basedOnQuickRole: existing.basedOnQuickRole,
    organizationId: existing.organizationId,
    createdBy: duplicatedBy,
  });
}

/**
 * Check if a role name is unique within an organization
 */
export function isRoleNameUnique(organizationId: string, name: string, excludeRoleId?: string): boolean {
  const roles = listCustomRoles(organizationId);
  return !roles.some(
    (role) => role.name === name && role.id !== excludeRoleId
  );
}

/**
 * Validate custom role permissions
 */
export function validateCustomRolePermissions(permissions: Record<string, string[]>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const validModules = [
    "projects",
    "tasks",
    "documents",
    "document_folders",
    "clients",
    "deals",
    "media",
    "calendar",
    "notifications",
    "search",
    "ai",
    "integrations",
    "organization_settings",
    "workspace_settings",
  ];
  const validActions = [
    "create",
    "read",
    "update",
    "delete",
    "search",
    "upload",
    "download",
    "execute",
    "manage",
    "archive",
  ];

  for (const [module, actions] of Object.entries(permissions)) {
    if (!validModules.includes(module)) {
      errors.push(`Invalid module: ${module}`);
    }
    for (const action of actions) {
      if (!validActions.includes(action)) {
        errors.push(`Invalid action "${action}" for module "${module}"`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Merge quick role permissions with custom overrides
 */
export function mergePermissionsWithQuickRole(
  quickRoleId: QuickRoleId,
  customPermissions: Record<string, string[]>
): Record<string, string[]> {
  const quickRole = QUICK_ROLES[quickRoleId];
  if (!quickRole) return customPermissions;

  const merged: Record<string, string[]> = { ...quickRole.permissions };

  for (const [module, actions] of Object.entries(customPermissions)) {
    if (merged[module]) {
      // Merge actions, removing duplicates
      merged[module] = Array.from(new Set([...merged[module], ...actions]));
    } else {
      merged[module] = actions;
    }
  }

  return merged;
}

/**
 * Export custom role to JSON for backup/sharing
 */
export function exportCustomRole(roleId: string): string | null {
  const role = customRolesStore.get(roleId);
  if (!role) return null;

  return JSON.stringify(role, null, 2);
}

/**
 * Import custom role from JSON
 */
export function importCustomRole(
  jsonData: string,
  organizationId: string,
  importedBy: string
): { success: boolean; role?: CustomRole; error?: string } {
  try {
    const parsed = JSON.parse(jsonData) as Partial<CustomRole>;

    if (!parsed.name || !parsed.permissions) {
      return { success: false, error: "Invalid role data: missing name or permissions" };
    }

    const validation = validateCustomRolePermissions(parsed.permissions);
    if (!validation.valid) {
      return { success: false, error: `Invalid permissions: ${validation.errors.join(", ")}` };
    }

    const role = createCustomRole({
      name: parsed.name,
      description: parsed.description,
      permissions: parsed.permissions,
      basedOnQuickRole: parsed.basedOnQuickRole,
      organizationId,
      createdBy: importedBy,
    });

    return { success: true, role };
  } catch (error) {
    return { success: false, error: `Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}` };
  }
}
