import type { QueryClient } from "@tanstack/react-query";

export const organizationSettingsKeys = {
  members: (organizationId: string) => ["organization-members", organizationId] as const,
  invitations: (organizationId: string) => ["organization-invitations", organizationId] as const,
  roles: (organizationId: string) => ["organization-roles", organizationId] as const,
  capabilities: (organizationId: string) => ["organization-capabilities", organizationId] as const,
  apiKeys: (organizationId: string) => ["organization-api-keys", organizationId] as const,
  mcpConnections: (organizationId: string) => ["organization-mcp-connections", organizationId] as const,
  notifications: (organizationId: string) => ["organization-notification-settings", organizationId] as const,
};

export async function invalidateOrganizationSettings(
  queryClient: QueryClient,
  organizationId: string,
  targets: Array<keyof typeof organizationSettingsKeys> = [
    "members",
    "invitations",
    "roles",
    "capabilities",
    "apiKeys",
    "mcpConnections",
    "notifications",
  ],
) {
  await Promise.all(
    targets.map((target) =>
      queryClient.invalidateQueries({
        queryKey: organizationSettingsKeys[target](organizationId),
      }),
    ),
  );
}
