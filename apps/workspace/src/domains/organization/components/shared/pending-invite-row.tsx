"use client";

import { CheckCircle2, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrganizationInvitation } from "../../api";
import { defaultRoleNames, formatDate, formatRoleName } from "../../settings-view-model";

export function PendingInviteRow({
  invite,
  copied,
  onCopy,
  onCancel,
  canceling,
  roleLabels,
  labels,
}: {
  invite: OrganizationInvitation;
  copied: boolean;
  onCopy: () => void;
  onCancel: () => void;
  canceling: boolean;
  roleLabels: Record<(typeof defaultRoleNames)[number], string>;
  labels: { emailTitle: string; copy: string; copied: string; cancel: string };
}) {
  return (
    <div className="flex flex-col gap-4 py-4.5 border-b border-border/60 last:border-b-0 md:flex-row md:items-center">
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-foreground">{invite.email}</p>
        <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          {labels.emailTitle} &bull; {formatRoleName(invite.role, roleLabels)} &bull; {invite.status} &bull; {formatDate(invite.expiresAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onCopy} className="h-8.5 rounded-lg text-[9px] font-black uppercase tracking-widest px-3">
          {copied ? <CheckCircle2 className="me-1.5 h-3.5 w-3.5 text-emerald-500" /> : <Copy className="me-1.5 h-3.5 w-3.5" />}
          {copied ? labels.copied : labels.copy}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={canceling} className="h-8.5 rounded-lg text-[9px] font-black uppercase tracking-widest px-3 text-red-600 border-red-100 bg-red-500/5 hover:bg-red-500/10 dark:border-red-500/15">
          <Trash2 className="me-1.5 h-3.5 w-3.5" />
          {labels.cancel}
        </Button>
      </div>
    </div>
  );
}
