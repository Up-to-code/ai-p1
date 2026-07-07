"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrganizationInviteLink } from "../../api";
import { defaultRoleNames, formatDate, formatRoleName } from "../../settings-view-model";

export function PendingInviteLinkRow({
  inviteLink,
  onCancel,
  canceling,
  roleLabels,
  labels,
}: {
  inviteLink: OrganizationInviteLink;
  onCancel: () => void;
  canceling: boolean;
  roleLabels: Record<(typeof defaultRoleNames)[number], string>;
  labels: { linkTitle: string; expires: string; cancel: string };
}) {
  return (
    <div className="flex flex-col gap-4 py-4.5 border-b border-border/60 last:border-b-0 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-foreground">{labels.linkTitle}</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {formatRoleName(inviteLink.role, roleLabels)} &bull; {inviteLink.status} &bull; {labels.expires} {formatDate(inviteLink.expiresAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onCancel} disabled={canceling} className="h-8.5 rounded-lg text-[9px] font-black uppercase tracking-widest px-3 text-red-600 border-red-100 bg-red-500/5 hover:bg-red-500/10 dark:border-red-500/15">
          <Trash2 className="me-1.5 h-3.5 w-3.5" />
          {labels.cancel}
        </Button>
      </div>
    </div>
  );
}
