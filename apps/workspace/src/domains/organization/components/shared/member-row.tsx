"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrganizationMember } from "../../api/clerk-organization-api";
import { defaultRoleNames, formatDate, formatRoleName, getInitials, memberEmail, memberName } from "../../settings-view-model";

export function MemberRow({
  member,
  roles,
  roleLabels,
  isCurrentUser,
  isLastOwner,
  canUpdateRole,
  canRemove,
  onChangeRole,
  onRemove,
  labels,
}: {
  member: OrganizationMember;
  roles: string[];
  roleLabels: Record<(typeof defaultRoleNames)[number], string>;
  isCurrentUser: boolean;
  isLastOwner: boolean;
  canUpdateRole: boolean;
  canRemove: boolean;
  onChangeRole: (role: string) => void;
  onRemove: () => void;
  labels: { currentUser: string; remove: string; role: string; joined: string };
}) {
  const name = memberName(member);
  const email = memberEmail(member);

  return (
    <div className="flex flex-col gap-4 py-4.5 border-b border-border/60 last:border-b-0 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-xs font-black uppercase text-muted-foreground">
          {member.user?.image ? <img src={member.user.image} alt={name} className="h-full w-full object-cover" /> : getInitials(name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-black text-foreground">
            {name} {isCurrentUser && <span className="text-[9px] font-bold text-muted-foreground">({labels.currentUser})</span>}
          </p>
          <p className="mt-0.5 truncate text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{labels.joined} {formatDate(member.createdAt)}</span>
        <select
          value={member.role}
          disabled={isLastOwner || !canUpdateRole}
          onChange={(event) => onChangeRole(event.target.value)}
          className="h-8.5 rounded-lg border border-border bg-card px-2.5 text-xs font-bold transition-colors"
          aria-label={labels.role}
        >
          {roles.map((role) => <option key={role} value={role}>{formatRoleName(role, roleLabels)}</option>)}
        </select>
        <Button variant="outline" disabled={isCurrentUser || isLastOwner || !canRemove} onClick={onRemove} className="h-8.5 rounded-lg border-red-100 bg-red-500/5 px-3 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-500/10 dark:border-red-500/15">
          <Trash2 className="me-1.5 h-3.5 w-3.5" />
          {labels.remove}
        </Button>
      </div>
    </div>
  );
}
