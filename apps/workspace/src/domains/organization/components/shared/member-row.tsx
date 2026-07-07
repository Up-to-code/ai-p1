"use client";

import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { OrganizationMember } from "../../api";
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
    <div className="flex flex-col gap-4 py-4 border-b border-border/60 last:border-b-0 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-xs font-black uppercase text-muted-foreground">
          {member.user?.image ? <img src={member.user.image} alt={name} className="h-full w-full object-cover" /> : getInitials(name)}
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{name}</p>
            {isCurrentUser && <Badge variant="secondary" className="h-5 px-2 text-[9px]">{labels.currentUser}</Badge>}
          </div>
          <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{email}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground">{labels.joined} {formatDate(member.createdAt)}</span>
        <Select
          value={member.role}
          disabled={isLastOwner || !canUpdateRole}
          onValueChange={(value: string | null) => value && onChangeRole(value)}
        >
          <SelectTrigger aria-label={labels.role} className="h-9 w-36 rounded-lg border-border bg-background text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {roles.map((role) => <SelectItem key={role} value={role}>{formatRoleName(role, roleLabels)}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" disabled={isCurrentUser || isLastOwner || !canRemove} onClick={onRemove} className="h-9 rounded-lg border-destructive/20 bg-destructive/5 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10">
          <Trash2 className="me-1.5 h-3.5 w-3.5" />
          {labels.remove}
        </Button>
      </div>
    </div>
  );
}
