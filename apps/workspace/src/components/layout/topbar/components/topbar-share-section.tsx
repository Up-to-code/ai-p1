"use client";

import { useMemo, useState } from "react";
import { SharePopover } from "@/components/shared/share-popover";
import { mapOrganizationMembersToShareUsers } from "../lib/map-share-members";
import { useTopbarShareMutations } from "../hooks/use-topbar-share-mutations";
import { useTopbarShareQueries } from "../queries/use-topbar-share-queries";

type TopbarShareSectionProps = {
  organizationId: string | undefined;
};

/** Organization share popover wired to topbar queries and mutations. */
export function TopbarShareSection({ organizationId }: TopbarShareSectionProps) {
  const [shareAccess, setShareAccess] = useState<"invited" | "link">("invited");
  const [shareUrl, setShareUrl] = useState("");

  const { membersQuery, capabilitiesQuery } = useTopbarShareQueries(organizationId);
  const capabilities = capabilitiesQuery.data;
  const { inviteMutation, inviteLinkMutation, mcpLinkMutation } = useTopbarShareMutations(
    organizationId,
    capabilities,
  );

  const shareUsers = useMemo(
    () => mapOrganizationMembersToShareUsers(membersQuery.data ?? []),
    [membersQuery.data],
  );

  const canCreateMcpLink = Boolean(capabilities?.canReadOrganization);

  return (
    <SharePopover
      url={shareUrl}
      users={shareUsers}
      generalAccess={shareAccess}
      allowInvite
      showMcpSection
      canCreateMcp={canCreateMcpLink}
      onInvite={(email, permission) =>
        inviteMutation.mutateAsync({ email, permission }).then(() => undefined)
      }
      onCreateInviteLink={(permission) => {
        void inviteLinkMutation.mutateAsync(permission).then((result) => {
          if (result?.inviteUrl) {
            setShareUrl(result.inviteUrl);
            setShareAccess("link");
          }
        });
      }}
      onCreateMcp={({ permission }) => {
        void mcpLinkMutation.mutateAsync(permission).then((result) => {
          if (result?.agentLink) {
            setShareUrl(result.agentLink);
            setShareAccess("link");
          }
        });
      }}
    />
  );
}
