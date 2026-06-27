import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

export type ResourceType =
  | "clients"
  | "projects"
  | "deals"
  | "tasks"
  | "docs"
  | "custom-fields"
  | "organization"
  | "opportunities"
  | "calendar"
  | "spaces"
  | "profile";

export type InvalidationTarget =
  | { type: "list"; resource: ResourceType }
  | { type: "detail"; resource: ResourceType; id: string }
  | { type: "stats"; resource: ResourceType }
  | { type: "custom"; queryKey: readonly unknown[] };

function resourceQueryKeys(resource: ResourceType, orgId?: string): readonly unknown[][] {
  switch (resource) {
    case "clients":
      return orgId
        ? [["clients-index", orgId], ["clients-stats", orgId]]
        : [["clients-index"], ["clients-stats"]];
    case "projects":
      return orgId
        ? [["projects-index", orgId], ["projects-paged", orgId], ["projects-options"]]
        : [["projects-index"], ["projects-paged"], ["projects-options"]];
    case "deals":
      return orgId
        ? [["deals", orgId], ["deals-stats", orgId]]
        : [["deals"], ["deals-stats"]];
    case "tasks":
      return orgId
        ? [["tasks", orgId]]
        : [["tasks"]];
    case "docs":
      return orgId
        ? [["docs", orgId]]
        : [["docs"]];
    case "custom-fields":
      return [["custom-field-definitions"], ["custom-field-definitions-table"], ["custom-field-values"], ["custom-field-values-all"]];
    case "organization":
      return orgId
        ? [
            ["organization-members", orgId],
            ["organization-invitations", orgId],
            ["organization-roles", orgId],
            ["organization-capabilities", orgId],
            ["organization-api-keys", orgId],
            ["organization-mcp-connections", orgId],
            ["organization-notification-settings", orgId],
          ]
        : [
            ["organization-members"],
            ["organization-invitations"],
            ["organization-roles"],
            ["organization-capabilities"],
            ["organization-api-keys"],
            ["organization-mcp-connections"],
            ["organization-notification-settings"],
          ];
    case "opportunities":
      return orgId
        ? [["opportunities", orgId], ["opportunities-stats", orgId]]
        : [["opportunities"], ["opportunities-stats"]];
    case "calendar":
      return orgId
        ? [["calendar-read", orgId]]
        : [["calendar-read"]];
    case "spaces":
      return orgId
        ? [["spaces", orgId]]
        : [["spaces"]];
    case "profile":
      return orgId
        ? [["notification-settings", orgId, "me"]]
        : [["notification-settings"]];
    default:
      return [];
  }
}

export function useOptimisticInvalidation(organizationId?: string) {
  const queryClient = useQueryClient();

  const invalidate = useCallback(
    async (targets: InvalidationTarget | InvalidationTarget[]) => {
      const all = Array.isArray(targets) ? targets : [targets];
      const keys: readonly unknown[][] = [];

      for (const target of all) {
        if (target.type === "custom") {
          keys.push(target.queryKey);
        } else if (target.type === "list") {
          keys.push(...resourceQueryKeys(target.resource, organizationId));
        } else if (target.type === "stats") {
          const statsKeys = resourceQueryKeys(target.resource, organizationId)
            .filter((k) => {
              const last = k[k.length - 1];
              return typeof last === "string" && last.includes("stats");
            });
          keys.push(...statsKeys);
        } else if (target.type === "detail") {
          const baseKeys = resourceQueryKeys(target.resource, organizationId);
          const detailKeys = baseKeys
            .filter((k) => k[0] === target.resource)
            .map((k) => [...k, target.id]);
          keys.push(...detailKeys);
        }
      }

      await Promise.all(
        keys.map((queryKey) =>
          queryClient.invalidateQueries({ queryKey }),
        ),
      );
    },
    [queryClient, organizationId],
  );

  return { invalidate };
}
