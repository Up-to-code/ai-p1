"use client";

import { organizationPermissionStatement } from "@/packages/authz";
import { cn } from "@/lib/utils";
import { type WorkAction, type WorkArea, type PermissionResource } from "../../settings-view-model";
import { workAreaIcon } from "./work-area-icon";

export function WorkRoleGrid({
  permission,
  areas,
  actionColumns,
  onToggle,
  labels,
  getAreaLabel,
  getAreaHelp,
}: {
  permission: Partial<Record<PermissionResource, string[]>>;
  areas: WorkArea[];
  actionColumns: WorkAction[];
  onToggle: (resource: PermissionResource, action: string) => void;
  labels: Record<WorkAction | "area" | "allowedWork" | "unavailable", string>;
  getAreaLabel: (key: string) => string;
  getAreaHelp: (key: string) => string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border">
      <table className="min-w-[760px] w-full border-collapse bg-card text-start">
        <thead>
          <tr className="border-b border-border bg-muted/80">
            <th className="w-[260px] px-4 py-3 text-start text-[10px] font-black uppercase tracking-widest text-muted-foreground">{labels.area}</th>
            {actionColumns.map((action) => (
              <th key={action} className="px-3 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {labels[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => {
            const actions = organizationPermissionStatement[area.resource] as readonly string[];
            const Icon = workAreaIcon(area.resource);

            return (
              <tr key={area.resource} className="border-b border-border last:border-b-0">
                <td className="px-4 py-4 align-top">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black text-foreground">{getAreaLabel(area.labelKey)}</p>
                      <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{getAreaHelp(area.helperKey)}</p>
                    </div>
                  </div>
                </td>
                {actionColumns.map((action) => {
                  const available = actions.includes(action);
                  const checked = (permission[area.resource] ?? []).includes(action);

                  return (
                    <td key={action} className="px-3 py-4 text-center align-top">
                      {available ? (
                        <button
                          type="button"
                          onClick={() => onToggle(area.resource, action)}
                          aria-pressed={checked}
                          title={`${getAreaLabel(area.labelKey)}: ${labels[action]}`}
                          className={cn(
                            "mx-auto flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-[10px] font-black uppercase tracking-widest transition-colors",
                            checked
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-muted-foreground hover:border-ring hover:text-foreground",
                          )}
                        >
                          {checked ? "✓" : ""}
                        </button>
                      ) : (
                        <span title={labels.unavailable} className="mx-auto flex h-8 min-w-8 items-center justify-center rounded-lg border border-dashed border-border text-[10px] font-black text-muted-foreground/50">
                          -
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="border-t border-border bg-muted/80 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {labels.allowedWork}
      </div>
    </div>
  );
}
