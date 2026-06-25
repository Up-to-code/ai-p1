import type {
  McpPermissionResource,
  OrganizationCapabilities,
} from "@/domains/organization/api/clerk-organization-api";
import type { ExpiryDuration } from "@/lib/utils/expiry-timestamp";

/** React Query keys for topbar share data. */
export const topbarShareQueryKeys = {
  members: (organizationId: string) => ["topbar-share-members", organizationId] as const,
  capabilities: (organizationId: string) => ["topbar-share-capabilities", organizationId] as const,
};

/** Default MCP share-link lifetime (matches organization API key presets). */
export const shareMcpDefaultExpiry: ExpiryDuration = "30d";

type CapabilityKey = keyof OrganizationCapabilities;

/** Maps each MCP resource to the organization capability flags that gate share access. */
export type ShareMcpResourceDefinition = {
  resource: McpPermissionResource;
  canRead: CapabilityKey;
  canCreate?: CapabilityKey;
  canUpdate?: CapabilityKey;
};

export const shareMcpResourceDefinitions: ShareMcpResourceDefinition[] = [
  { resource: "organization", canRead: "canReadOrganization" },
  {
    resource: "client",
    canRead: "canReadClients",
    canCreate: "canCreateClients",
    canUpdate: "canUpdateClients",
  },
  {
    resource: "project",
    canRead: "canReadProjects",
    canCreate: "canCreateProjects",
    canUpdate: "canUpdateProjects",
  },
  {
    resource: "deal",
    canRead: "canReadClients",
    canCreate: "canCreateClients",
    canUpdate: "canUpdateClients",
  },
  {
    resource: "calendar",
    canRead: "canReadCalendarEvents",
    canCreate: "canCreateCalendarEvents",
    canUpdate: "canUpdateCalendarEvents",
  },
  {
    resource: "task",
    canRead: "canReadTasks",
    canCreate: "canCreateTasks",
    canUpdate: "canUpdateTasks",
  },
  {
    resource: "media",
    canRead: "canReadMedia",
    canCreate: "canCreateMedia",
    canUpdate: "canUpdateMedia",
  },
];
