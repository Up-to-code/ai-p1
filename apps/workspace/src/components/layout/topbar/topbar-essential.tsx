"use client";

import { useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { authClient } from "@/lib/auth-client";
import { useOrganizationSwitch } from "@/components/layout/sidebar/hooks/use-organization-switch";
import type { BetterAuthOrganization } from "@/components/layout/sidebar/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopbarEssential() {
  const session = useAuthSession();
  const organizationsQuery = authClient.useListOrganizations();
  const allOrgs = useMemo(
    () =>
      ((organizationsQuery.data ?? []) as BetterAuthOrganization[])
        .filter((organization) => organization.id),
    [organizationsQuery.data],
  );
  const { switchingOrganizationId, switchOrganization } = useOrganizationSwitch(session.organization.id ?? "");
  const organizationDisplayName = session.organization.name || "Organization";

  return (
    <div className="flex items-center gap-1.5">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-accent"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-[10px] font-black uppercase">
                {session.organization.logo ? (
                  <img src={session.organization.logo} alt="" className="h-full w-full object-cover" />
                ) : (
                  organizationDisplayName.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex flex-col items-start min-w-0 leading-tight">
                <span className="max-w-[120px] truncate text-[12px] font-semibold text-foreground">{organizationDisplayName}</span>
                <span className="text-[10px] font-medium text-muted-foreground">{session.organization.type === "company" ? "Business" : "Free"}</span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            </button>
          }
        />
        <DropdownMenuContent
          align="start"
          sideOffset={6}
          className="w-64 rounded-xl border-border p-1.5"
        >
          <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Workspaces
          </div>
          {allOrgs.map((org) => {
            const isActive = org.id === session.organization.id;
            const displayName = org.name || "Organization";
            return (
              <DropdownMenuItem
                key={org.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 cursor-pointer"
                onClick={() => {
                  if (!isActive && org.id) {
                    switchOrganization(org.id);
                  }
                }}
                disabled={isActive || switchingOrganizationId === org.id}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xs font-black uppercase bg-muted">
                  {org.logo ? (
                    <img src={org.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    displayName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-foreground truncate">{displayName}</span>
                    {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
          {allOrgs.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">No organizations found</div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
