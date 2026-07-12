"use client";

import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@/components/ui/toast";
import {
  createOrganizationInvitation,
  createOrganizationInviteLink,
  type OrganizationCapabilities,
} from "@/domains/organization/api";
import {
  buildMcpSetupPrompt,
  defaultMcpEndpoint,
  type McpPromptPreset,
} from "@/domains/mcp";
import { buildMcpPermissionsForPreset } from "../lib/share-mcp-permissions";
import { sharePermissionToOrganizationRole } from "../lib/share-role";

type ShareToastKey =
  | "inviteSent"
  | "inviteFailed"
  | "inviteLinkCreated"
  | "linkFailed"
  | "mcpLinkCreated";

function useShareToast() {
  const { toast } = useToast();
  const t = useTranslations("Topbar.share");

  return {
    success(key: ShareToastKey) {
      toast({
        title: t(`${key}.title`),
        description: t(`${key}.description`),
        type: "success",
      });
    },
    error(key: ShareToastKey, description?: string) {
      toast({
        title: t(`${key}.title`),
        description: description ?? t(`${key}.description`),
        type: "error",
      });
    },
  };
}

/** Share popover mutations: invites, invite links, and MCP connections. */
export function useTopbarShareMutations(
  organizationId: string | undefined,
  capabilities: OrganizationCapabilities | undefined,
) {
  const locale = useLocale();
  const shareToast = useShareToast();
  const t = useTranslations("Topbar.share");

  const inviteMutation = useMutation({
    mutationFn: ({ email, permission }: { email: string; permission: string }) =>
      createOrganizationInvitation(organizationId ?? "", {
        email,
        role: sharePermissionToOrganizationRole(permission),
      }),
    onSuccess: () => shareToast.success("inviteSent"),
    onError: (error) => shareToast.error("inviteFailed", error.message),
  });

  const inviteLinkMutation = useMutation({
    mutationFn: (permission: string) =>
      createOrganizationInviteLink(organizationId ?? "", {
        role: sharePermissionToOrganizationRole(permission),
        locale,
      }),
    onSuccess: async (result) => {
      await navigator.clipboard?.writeText(result.inviteUrl).catch(() => undefined);
      shareToast.success("inviteLinkCreated");
      return result;
    },
    onError: (error) => shareToast.error("linkFailed", error.message),
  });

  const mcpLinkMutation = useMutation({
    mutationFn: ({ name, permission }: { name: string; permission: string }) => {
      const preset = permission as McpPromptPreset;
      const permissions = buildMcpPermissionsForPreset(capabilities, preset);
      if (permissions.length === 0) {
        throw new Error(t("mcpNoPermissions"));
      }

      const endpoint = defaultMcpEndpoint;
      return Promise.resolve({
        agentLink: endpoint,
        agentPrompt: buildMcpSetupPrompt({
          agentName: name,
          endpoint,
          preset,
        }),
      });
    },
    onSuccess: async (result) => {
      await navigator.clipboard?.writeText(result.agentPrompt).catch(() => undefined);
      shareToast.success("mcpLinkCreated");
      return result;
    },
    onError: (error) => shareToast.error("linkFailed", error.message),
  });

  return { inviteMutation, inviteLinkMutation, mcpLinkMutation };
}
