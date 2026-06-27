"use client";

import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MCP_MODULES, MCP_ACTIONS, type QuickRoleId } from "@/server/domains/agents/constants/quick-roles";

export interface PermissionMatrixProps {
  permissions: Record<string, string[]>;
  onPermissionToggle: (module: string, action: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * MCP Permission Matrix Component
 * 
 * Displays permissions in a searchable list grouped by module with badge-based actions.
 * Replaces card-based UI with compact list rows for better readability and scan speed.
 */
export function PermissionMatrix({ 
  permissions, 
  onPermissionToggle, 
  disabled = false,
  className 
}: PermissionMatrixProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(MCP_MODULES));

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

  const toggleModuleExpand = (module: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(module)) {
        next.delete(module);
      } else {
        next.add(module);
      }
      return next;
    });
  };

  const expandAll = () => setExpandedModules(new Set(MCP_MODULES));
  const collapseAll = () => setExpandedModules(new Set());

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Expand Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search modules or permissions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 rounded-lg"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={expandAll}
            className="h-9 rounded-lg text-xs font-semibold"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={collapseAll}
            className="h-9 rounded-lg text-xs font-semibold"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="space-y-2">
        {filteredModules.map((module) => {
          const isExpanded = expandedModules.has(module);
          const modulePermissions = permissions[module] || [];
          const hasPermissions = modulePermissions.length > 0;

          return (
            <div
              key={module}
              className="rounded-lg border border-border bg-card overflow-hidden"
            >
              {/* Module Header */}
              <button
                type="button"
                onClick={() => toggleModuleExpand(module)}
                disabled={disabled}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold capitalize text-foreground">
                    {formatModuleName(module)}
                  </span>
                  {hasPermissions && (
                    <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {modulePermissions.length}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {/* Permission Badges */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/30 px-4 py-3">
                  <div className="flex flex-wrap gap-2">
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
              )}
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

/**
 * Individual Permission Badge Component
 */
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
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all",
        "border",
        enabled
          ? "bg-primary border-primary text-primary-foreground hover:bg-primary/90"
          : "bg-background border-border text-muted-foreground hover:bg-muted hover:text-foreground",
        disabled && "opacity-50 cursor-not-allowed hover:bg-background hover:text-muted-foreground"
      )}
    >
      {enabled && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {formatActionName(action)}
    </button>
  );
}

/**
 * Format module name for display
 */
function formatModuleName(module: string): string {
  return module
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format action name for display
 */
function formatActionName(action: string): string {
  return action.charAt(0).toUpperCase() + action.slice(1);
}

/**
 * Quick Role Selector Component
 */
export interface QuickRoleSelectorProps {
  selectedRole: QuickRoleId | null;
  onRoleSelect: (roleId: QuickRoleId) => void;
  disabled?: boolean;
}

export function QuickRoleSelector({ selectedRole, onRoleSelect, disabled }: QuickRoleSelectorProps) {
  const { QUICK_ROLES, getQuickRolesByCategory } = require("@/server/domains/agents/constants/quick-roles");
  
  const basicRoles = getQuickRolesByCategory("basic");
  const operationalRoles = getQuickRolesByCategory("operational");
  const administrativeRoles = getQuickRolesByCategory("administrative");

  const RoleGroup = ({ 
    title, 
    roles 
  }: { 
    title: string; 
    roles: typeof QUICK_ROLES[QuickRoleId][] 
  }) => (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        {title}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => !disabled && onRoleSelect(role.id)}
            disabled={disabled}
            className={cn(
              "flex flex-col items-start rounded-lg border p-3 text-left transition-all",
              "hover:bg-muted",
              selectedRole === role.id
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border bg-card",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <span className="text-sm font-bold text-foreground">{role.name}</span>
            <span className="text-xs text-muted-foreground line-clamp-2">{role.description}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <RoleGroup title="Basic Access" roles={basicRoles} />
      <RoleGroup title="Operational Roles" roles={operationalRoles} />
      <RoleGroup title="Administrative Roles" roles={administrativeRoles} />
    </div>
  );
}
