"use client";

import {
  Check,
  ChevronDown,
  Clock3,
  Layers3,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { McpAction, McpResource } from "@qentrah/mcp-contracts";
import type { McpConsentGrantController } from "./use-mcp-consent-grant";

const resourceLabels: Record<McpResource, string> = {
  organization: "Organization",
  space: "Spaces",
  project: "Projects",
  task: "Tasks",
  client: "Clients",
  deal: "Deals",
  calendar: "Calendar",
  media: "Media",
};

const actionLabels: Record<McpAction, string> = {
  read: "View",
  create: "Create",
  update: "Edit",
  delete: "Delete",
};

const scopeLabels = {
  organization: "Entire organization",
  space: "Selected spaces",
  project: "Selected projects",
} as const;

export function McpGrantFields({
  controller,
}: {
  controller: McpConsentGrantController;
}) {
  const enabledResources = controller.permissions.filter(
    (permission) => permission.actions.length > 0,
  );
  const enabledActionCount = enabledResources.reduce(
    (total, permission) => total + permission.actions.length,
    0,
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <ConsentSelectField
          icon={Layers3}
          label="Access scope"
          description="Choose where the agent can work."
        >
          <Select
            value={controller.scopeType}
            onValueChange={(value) => {
              if (value) controller.setScopeType(value);
            }}
          >
            <SelectTrigger size="sm" aria-label="Access scope">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              {Object.entries(scopeLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ConsentSelectField>

        <ConsentSelectField
          icon={Clock3}
          label="Connection duration"
          description="Access ends automatically."
        >
          <Select
            value={String(controller.lifetimeDays)}
            onValueChange={(value) => {
              if (value) {
                controller.setLifetimeDays(Number(value) as 7 | 30 | 90);
              }
            }}
          >
            <SelectTrigger size="sm" aria-label="Connection duration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </ConsentSelectField>
      </div>

      <ScopeResourcePicker controller={controller} />

      <Collapsible className="overflow-hidden rounded-xl border border-border bg-background">
        <CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors hover:bg-muted/40">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              {enabledResources.length} resources · {enabledActionCount}{" "}
              permissions
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              Recommended access is selected. Expand to customize it.
            </span>
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <SlidersHorizontal className="size-3.5" aria-hidden="true" />
            Customize
            <ChevronDown
              className="size-4 transition-transform group-data-[panel-open]:rotate-180"
              aria-hidden="true"
            />
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent className="border-t border-border">
          <div className="space-y-1 p-2">
            {controller.resources.map((resource) => {
              const selected =
                controller.permissions.find(
                  (permission) => permission.resource === resource,
                )?.actions ?? [];
              return (
                <div
                  key={resource}
                  className="flex flex-col gap-2 rounded-lg px-2 py-2.5 hover:bg-muted/30 sm:flex-row sm:items-center"
                >
                  <div className="min-w-28 flex-1 text-sm font-medium text-foreground">
                    {resourceLabels[resource]}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {controller.actions.map((action) => (
                      <PermissionActionToggle
                        key={action}
                        action={action}
                        checked={selected.includes(action)}
                        disabled={action !== "read" && !controller.canWrite}
                        onToggle={() =>
                          controller.togglePermission(resource, action)
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function ConsentSelectField({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: typeof Layers3;
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3.5">
      <div className="mb-3 flex items-start gap-2.5">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-semibold text-foreground">{label}</p>
          <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ScopeResourcePicker({
  controller,
}: {
  controller: McpConsentGrantController;
}) {
  if (controller.scopeType === "organization") return null;

  const scopeType = controller.scopeType;
  const options =
    scopeType === "space"
      ? controller.spaces.map((space) => ({ id: space.id, name: space.name }))
      : controller.projects.map((project) => ({
          id: project._id,
          name: project.name,
        }));
  const selectedIds =
    scopeType === "space"
      ? controller.selectedSpaceIds
      : controller.selectedProjectIds;

  return (
    <div className="rounded-xl border border-border bg-background p-3.5">
      <div className="mb-2">
        <p className="text-xs font-semibold text-foreground">
          Choose {scopeType === "space" ? "spaces" : "projects"}
        </p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Select at least one. You can change this access later.
        </p>
      </div>
      <div className="grid max-h-40 gap-1 overflow-y-auto sm:grid-cols-2">
        {options.map((option) => {
          const checked = selectedIds.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => controller.toggleId(scopeType, option.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-start text-xs font-medium transition-colors",
                checked
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-transparent bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded border",
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background",
                )}
              >
                {checked ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : null}
              </span>
              <span className="truncate">{option.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PermissionActionToggle({
  action,
  checked,
  disabled,
  onToggle,
}: {
  action: McpAction;
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium transition-colors",
        checked
          ? "border-primary/30 bg-primary/10 text-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted",
        disabled && "cursor-not-allowed opacity-40",
      )}
    >
      <span
        className={cn(
          "flex size-3.5 items-center justify-center rounded-sm border",
          checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border",
        )}
      >
        {checked ? <Check className="size-2.5" aria-hidden="true" /> : null}
      </span>
      {actionLabels[action]}
    </button>
  );
}
