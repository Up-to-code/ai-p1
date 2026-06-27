/**
 * Quick Role Definitions for AI Agent Permissions
 * 
 * These are predefined roles that can be quickly assigned to AI agents
 * with recommended permission sets for common use cases.
 */

export type QuickRoleId = 
  | "viewer" 
  | "editor" 
  | "project_manager" 
  | "sales" 
  | "customer_support" 
  | "developer" 
  | "ai_assistant" 
  | "workspace_admin" 
  | "organization_admin";

export interface QuickRole {
  id: QuickRoleId;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  category: "basic" | "operational" | "administrative";
}

/**
 * MCP Permission Modules and Actions
 */
export const MCP_MODULES = [
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
] as const;

export const MCP_ACTIONS = [
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
] as const;

/**
 * Quick Role Definitions
 */
export const QUICK_ROLES: Record<QuickRoleId, QuickRole> = {
  viewer: {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to view workspace content",
    category: "basic",
    permissions: {
      projects: ["read", "search"],
      tasks: ["read", "search"],
      documents: ["read", "search", "download"],
      document_folders: ["read", "search"],
      clients: ["read", "search"],
      deals: ["read", "search"],
      media: ["read", "search", "download"],
      calendar: ["read", "search"],
      notifications: ["read"],
      search: ["execute"],
      ai: ["read"],
      integrations: ["read"],
      organization_settings: ["read"],
      workspace_settings: ["read"],
    },
  },
  
  editor: {
    id: "editor",
    name: "Editor",
    description: "Can edit and create content but cannot manage users or settings",
    category: "operational",
    permissions: {
      projects: ["create", "read", "update", "search"],
      tasks: ["create", "read", "update", "search"],
      documents: ["create", "read", "update", "delete", "search", "upload", "download"],
      document_folders: ["create", "read", "update", "delete", "search"],
      clients: ["create", "read", "update", "search"],
      deals: ["create", "read", "update", "search"],
      media: ["create", "read", "update", "delete", "search", "upload", "download"],
      calendar: ["create", "read", "update", "delete", "search"],
      notifications: ["create", "read", "update"],
      search: ["execute"],
      ai: ["read", "execute"],
      integrations: ["read"],
      organization_settings: ["read"],
      workspace_settings: ["read"],
    },
  },
  
  project_manager: {
    id: "project_manager",
    name: "Project Manager",
    description: "Full access to manage projects, tasks, and team coordination",
    category: "operational",
    permissions: {
      projects: ["create", "read", "update", "delete", "search", "manage"],
      tasks: ["create", "read", "update", "delete", "search", "manage"],
      documents: ["create", "read", "update", "delete", "search", "upload", "download", "manage"],
      document_folders: ["create", "read", "update", "delete", "search", "manage"],
      clients: ["create", "read", "update", "search"],
      deals: ["create", "read", "update", "search"],
      media: ["create", "read", "update", "delete", "search", "upload", "download", "manage"],
      calendar: ["create", "read", "update", "delete", "search", "manage"],
      notifications: ["create", "read", "update", "manage"],
      search: ["execute"],
      ai: ["read", "execute"],
      integrations: ["read", "update"],
      organization_settings: ["read"],
      workspace_settings: ["read", "update"],
    },
  },
  
  sales: {
    id: "sales",
    name: "Sales",
    description: "Focused on client management and deal pipeline",
    category: "operational",
    permissions: {
      projects: ["read", "search"],
      tasks: ["create", "read", "update", "search"],
      documents: ["create", "read", "update", "search", "upload", "download"],
      document_folders: ["read", "search"],
      clients: ["create", "read", "update", "delete", "search", "manage"],
      deals: ["create", "read", "update", "delete", "search", "manage"],
      media: ["create", "read", "update", "search", "upload", "download"],
      calendar: ["create", "read", "update", "search"],
      notifications: ["create", "read", "update"],
      search: ["execute"],
      ai: ["read", "execute"],
      integrations: ["read"],
      organization_settings: ["read"],
      workspace_settings: ["read"],
    },
  },
  
  customer_support: {
    id: "customer_support",
    name: "Customer Support",
    description: "Access to client information and support tasks",
    category: "operational",
    permissions: {
      projects: ["read", "search"],
      tasks: ["create", "read", "update", "search"],
      documents: ["read", "search", "download"],
      document_folders: ["read", "search"],
      clients: ["read", "update", "search"],
      deals: ["read", "search"],
      media: ["read", "search", "download"],
      calendar: ["create", "read", "update", "search"],
      notifications: ["create", "read", "update"],
      search: ["execute"],
      ai: ["read", "execute"],
      integrations: ["read"],
      organization_settings: ["read"],
      workspace_settings: ["read"],
    },
  },
  
  developer: {
    id: "developer",
    name: "Developer",
    description: "Technical access to code, integrations, and system configuration",
    category: "operational",
    permissions: {
      projects: ["create", "read", "update", "search"],
      tasks: ["create", "read", "update", "search"],
      documents: ["create", "read", "update", "delete", "search", "upload", "download"],
      document_folders: ["create", "read", "update", "delete", "search"],
      clients: ["read", "search"],
      deals: ["read", "search"],
      media: ["create", "read", "update", "delete", "search", "upload", "download"],
      calendar: ["read", "search"],
      notifications: ["read"],
      search: ["execute"],
      ai: ["read", "execute", "manage"],
      integrations: ["create", "read", "update", "delete", "manage"],
      organization_settings: ["read", "update"],
      workspace_settings: ["read", "update", "manage"],
    },
  },
  
  ai_assistant: {
    id: "ai_assistant",
    name: "AI Assistant",
    description: "Balanced permissions for AI agents to assist with workspace operations",
    category: "operational",
    permissions: {
      projects: ["read", "search"],
      tasks: ["create", "read", "update", "search"],
      documents: ["read", "search", "download"],
      document_folders: ["read", "search"],
      clients: ["read", "search"],
      deals: ["read", "search"],
      media: ["read", "search", "download"],
      calendar: ["read", "search"],
      notifications: ["read"],
      search: ["execute"],
      ai: ["read", "execute"],
      integrations: ["read"],
      organization_settings: ["read"],
      workspace_settings: ["read"],
    },
  },
  
  workspace_admin: {
    id: "workspace_admin",
    name: "Workspace Admin",
    description: "Full administrative access within a workspace",
    category: "administrative",
    permissions: {
      projects: ["create", "read", "update", "delete", "search", "manage"],
      tasks: ["create", "read", "update", "delete", "search", "manage"],
      documents: ["create", "read", "update", "delete", "search", "upload", "download", "manage", "archive"],
      document_folders: ["create", "read", "update", "delete", "search", "manage", "archive"],
      clients: ["create", "read", "update", "delete", "search", "manage"],
      deals: ["create", "read", "update", "delete", "search", "manage"],
      media: ["create", "read", "update", "delete", "search", "upload", "download", "manage", "archive"],
      calendar: ["create", "read", "update", "delete", "search", "manage"],
      notifications: ["create", "read", "update", "delete", "manage"],
      search: ["execute", "manage"],
      ai: ["read", "execute", "manage"],
      integrations: ["create", "read", "update", "delete", "manage"],
      organization_settings: ["read"],
      workspace_settings: ["create", "read", "update", "delete", "manage"],
    },
  },
  
  organization_admin: {
    id: "organization_admin",
    name: "Organization Admin",
    description: "Full administrative access across entire organization",
    category: "administrative",
    permissions: {
      projects: ["create", "read", "update", "delete", "search", "manage"],
      tasks: ["create", "read", "update", "delete", "search", "manage"],
      documents: ["create", "read", "update", "delete", "search", "upload", "download", "manage", "archive"],
      document_folders: ["create", "read", "update", "delete", "search", "manage", "archive"],
      clients: ["create", "read", "update", "delete", "search", "manage"],
      deals: ["create", "read", "update", "delete", "search", "manage"],
      media: ["create", "read", "update", "delete", "search", "upload", "download", "manage", "archive"],
      calendar: ["create", "read", "update", "delete", "search", "manage"],
      notifications: ["create", "read", "update", "delete", "manage"],
      search: ["execute", "manage"],
      ai: ["read", "execute", "manage"],
      integrations: ["create", "read", "update", "delete", "manage"],
      organization_settings: ["create", "read", "update", "delete", "manage"],
      workspace_settings: ["create", "read", "update", "delete", "manage"],
    },
  },
};

/**
 * Get quick role by ID
 */
export function getQuickRole(id: QuickRoleId): QuickRole | undefined {
  return QUICK_ROLES[id];
}

/**
 * Get all quick roles by category
 */
export function getQuickRolesByCategory(category: QuickRole["category"]): QuickRole[] {
  return Object.values(QUICK_ROLES).filter((role) => role.category === category);
}

/**
 * Get all quick role IDs
 */
export function getQuickRoleIds(): QuickRoleId[] {
  return Object.keys(QUICK_ROLES) as QuickRoleId[];
}
