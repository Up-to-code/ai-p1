"use client";

import { UserRoundCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { defaultRoleNames, formatRoleName } from "../../settings-view-model";

export function RoleRow({
  role,
  roleLabels,
  memberCount,
  locked,
  onEdit,
  onDelete,
  editDisabled,
  deleteDisabled,
  labels,
}: {
  role: string;
  roleLabels: Record<(typeof defaultRoleNames)[number], string>;
  memberCount?: number;
  locked?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  labels: { builtIn: string; edit: string; delete: string };
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <UserRoundCog className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-black text-foreground">{formatRoleName(role, roleLabels)}</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{labels.builtIn}{typeof memberCount === "number" ? ` / ${memberCount}` : ""}</p>
        </div>
      </div>
      {!locked && (
        <div className="flex gap-2">
          <Button variant="outline" disabled={editDisabled} onClick={onEdit} className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest">{labels.edit}</Button>
          <Button variant="outline" disabled={deleteDisabled} onClick={onDelete} className="h-9 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-600">{labels.delete}</Button>
        </div>
      )}
    </div>
  );
}
