"use client";

import { useMemo, useState } from "react";
import { Check, Plus } from "lucide-react";
import { useAuthSession } from "@/domains/auth";
import { authClient } from "@/lib/auth-client";
import { useOrganizationSwitch } from "../hooks/use-organization-switch";
import type { BetterAuthOrganization } from "../lib/types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavTooltip } from "./nav-tooltip";

export function SidebarWorkspaceSwitcher() {
  const session = useAuthSession();
  const [open, setOpen] = useState(false);

  const organizationsQuery = authClient.useListOrganizations();
  const allOrgs = useMemo(
    () =>
      ((organizationsQuery.data ?? []) as BetterAuthOrganization[]).filter(
        (organization) => organization.id,
      ),
    [organizationsQuery.data],
  );

  const { switchingOrganizationId, switchOrganization } = useOrganizationSwitch(
    session.organization.id ?? "",
  );

  const displayName =
    session.organization.legalName?.trim() ||
    session.organization.name ||
    "Workspace";

  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <NavTooltip label={displayName}>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                open
                  ? "bg-accent text-foreground"
                  : "bg-card text-foreground hover:bg-accent",
              )}
              aria-label={`Current workspace: ${displayName}`}
            >
              {session.organization.logo ? (
                <img
                  src={session.organization.logo}
                  alt=""
                  className="h-6 w-6 rounded-md object-cover"
                />
              ) : (
                <span className="text-xs font-black uppercase">{initials}</span>
              )}
            </button>
          }
        />
      </NavTooltip>
      <DropdownMenuContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-64 rounded-xl border-border p-1.5"
      >
        <div className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Workspaces
        </div>
        {allOrgs.map((org) => {
          const isActive = org.id === session.organization.id;
          const name = org.name || "Workspace";
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
                  name.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-foreground truncate">
                    {name}
                  </span>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
        {allOrgs.length === 0 && (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No workspaces found
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center gap-3 rounded-lg px-2 py-2 cursor-pointer"
          onClick={() => {
            setOpen(false);
            window.location.href = "/choose-org";
          }}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Plus className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-semibold text-foreground">Join or create workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
