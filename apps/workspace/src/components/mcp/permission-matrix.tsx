"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  MCP_ACTIONS,
  MCP_MODULES,
  getQuickRolesByCategory,
  type QuickRole,
  type QuickRoleId,
} from "./constants/quick-roles";

export interface PermissionMatrixProps {
  permissions: Record<string, string[]>;
  onPermissionToggle: (module: string, action: string) => void;
  disabled?: boolean;
  className?: string;
}

export function PermissionMatrix({ 
  permissions, 
  onPermissionToggle, 
  disabled = false,
  className 
}: PermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredModules = MCP_MODULES.filter((module) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      module.toLowerCase().includes(query) ||
      MCP_ACTIONS.some((action) => 
        action.toLowerCase().includes(query) && 
        permissions[module]?.includes(action)
      )
    );
  });

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      <div className="shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search modules or permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-lg pl-9 text-sm"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {filteredModules.map((module) => {
          const modulePermissions = permissions[module] || [];
          const hasPermissions = modulePermissions.length > 0;

          return (
            <div
              key={module}
              className="grid gap-2 border-b border-border py-3 last:border-b-0 md:grid-cols-[180px_minmax(0,1fr)] md:items-start"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold capitalize text-foreground">
                  {formatModuleName(module)}
                </span>
                {hasPermissions && (
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                    {modulePermissions.length}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {MCP_ACTIONS.map((action) => {
                  const isEnabled = modulePermissions.includes(action);
                  return (
                    <PermissionBadge
                      key={action}
                      action={action}
                      enabled={isEnabled}
                      onClick={() => !disabled && onPermissionToggle(module, action)}
                      disabled={disabled}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-muted/50 px-4 py-8 text-center">
            <p className="text-sm font-semibold text-muted-foreground">
              No modules found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface PermissionBadgeProps {
  action: string;
  enabled: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function PermissionBadge({ action, enabled, onClick, disabled }: PermissionBadgeProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors",
        "border",
        enabled
          ? "bg-primary border-primary text-primary-foreground hover:bg-primary/90"
          : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed hover:bg-background hover:text-muted-foreground"
      )}
    >
      {formatActionName(action)}
    </button>
  );
}

function formatModuleName(module: string): string {
  return module
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatActionName(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

export interface QuickRoleSelectorProps {
  selectedRole: QuickRoleId | null;
  onRoleSelect: (roleId: QuickRoleId) => void;
  disabled?: boolean;
}

export function QuickRoleSelector({ selectedRole, onRoleSelect, disabled }: QuickRoleSelectorProps) {
  const basicRoles = getQuickRolesByCategory("basic");
  const operationalRoles = getQuickRolesByCategory("operational");
  const administrativeRoles = getQuickRolesByCategory("administrative");

  const RoleGroup = ({ 
    title, 
    roles
  }: { 
    title: string; 
    roles: QuickRole[];
  }) => (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => !disabled && onRoleSelect(role.id)}
            disabled={disabled}
            className={cn(
              "flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors",
              "hover:bg-muted/70",
              selectedRole === role.id
                ? "border-primary bg-primary/5 text-foreground"
                : "border-border bg-card",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">{role.name}</span>
            </span>
            <span className="shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {Object.values(role.permissions).reduce((sum, actions) => sum + actions.length, 0)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <RoleGroup title="Basic Access" roles={basicRoles} />
      <RoleGroup title="Operational Roles" roles={operationalRoles} />
      <RoleGroup title="Administrative Roles" roles={administrativeRoles} />
    </div>
  );
}
