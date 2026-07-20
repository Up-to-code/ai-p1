"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import type {
  McpGrantResource,
  McpPermission,
} from "@qentrah/mcp-contracts";
import {
  defaultMcpConsentPermissions,
  mcpConsentActions,
  mcpConsentResources,
} from "./mcp-consent-permissions";

export function useMcpConsentGrant(input: {
  enabled: boolean;
  organizationId?: string;
  clientId: string;
  clientName: string;
  canWrite: boolean;
}) {
  const [scopeType, setScopeType] = useState<
    "organization" | "space" | "project"
  >("organization");
  const [selectedSpaceIds, setSelectedSpaceIds] = useState<string[]>([]);
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<McpPermission[]>(() =>
    defaultMcpConsentPermissions(input.canWrite),
  );
  const [lifetimeDays, setLifetimeDays] = useState<7 | 30 | 90>(30);
  const organizationId = input.organizationId ?? "";
  const spaces = useQuery(
    api.spaces.read.options,
    input.enabled && organizationId ? { organizationId, limit: 100 } : "skip",
  );
  const projects = useQuery(
    api.projects.read.list,
    input.enabled && organizationId ? { organizationId } : "skip",
  );
  const upsert = useMutation(api.mcp.oauthGrants.upsert);

  const scopeIsValid =
    scopeType === "organization" ||
    (scopeType === "space"
      ? selectedSpaceIds.length > 0
      : selectedProjectIds.length > 0);
  const hasPermission = permissions.some(
    (permission) => permission.actions.length > 0,
  );
  const canApprove = Boolean(
    input.enabled &&
    organizationId &&
    input.clientId &&
    scopeIsValid &&
    hasPermission,
  );

  function togglePermission(
    resource: McpGrantResource,
    action: McpPermission["actions"][number],
  ) {
    if (!mcpConsentActions(resource).includes(action)) return;
    if (action !== "read" && !input.canWrite) return;
    setPermissions((current) =>
      current.map((permission) => {
        if (permission.resource !== resource) return permission;
        const enabled = permission.actions.includes(action);
        return {
          ...permission,
          actions: enabled
            ? permission.actions.filter((candidate) => candidate !== action)
            : [...permission.actions, action],
        };
      }),
    );
  }

  function toggleId(kind: "space" | "project", id: string) {
    const setter =
      kind === "space" ? setSelectedSpaceIds : setSelectedProjectIds;
    setter((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  async function persistGrant() {
    if (!canApprove)
      throw new Error("Select an MCP scope and at least one permission.");
    const scope =
      scopeType === "space"
        ? {
            type: "space" as const,
            spaceIds: selectedSpaceIds as Id<"spaces">[],
          }
        : scopeType === "project"
          ? {
              type: "project" as const,
              projectIds: selectedProjectIds as Id<"projects">[],
            }
          : { type: "organization" as const };
    return upsert({
      organizationId,
      oauthClientId: input.clientId,
      clientName: input.clientName,
      permissions,
      scope,
      lifetimeDays,
    });
  }

  return useMemo(
    () => ({
      resources: mcpConsentResources,
      actionsForResource: mcpConsentActions,
      scopeType,
      setScopeType,
      selectedSpaceIds,
      selectedProjectIds,
      permissions,
      lifetimeDays,
      setLifetimeDays,
      canWrite: input.canWrite,
      spaces: spaces ?? [],
      projects: projects ?? [],
      togglePermission,
      toggleId,
      persistGrant,
      canApprove,
    }),
    [
      scopeType,
      selectedSpaceIds,
      selectedProjectIds,
      permissions,
      lifetimeDays,
      input.canWrite,
      spaces,
      projects,
      canApprove,
    ],
  );
}

export type McpConsentGrantController = ReturnType<typeof useMcpConsentGrant>;
