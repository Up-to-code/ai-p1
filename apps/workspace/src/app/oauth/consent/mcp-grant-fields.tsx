"use client";

import {
  Check,
  ChevronDown,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { McpAction, McpResource } from "@qentrah/mcp-contracts";
import type { McpConsentGrantController } from "./use-mcp-consent-grant";

const resourceLabels: Record<McpResource, string> = {
  organization: "Organization",
  member: "Members",
  role: "Roles",
  space: "Spaces",
  project: "Projects",
  task: "Tasks",
  client: "Clients",
  deal: "Deals",
  calendar: "Calendar",
  media: "Media",
  finance: "Finance",
  report: "Reports",
};

const actionLabels: Record<McpAction, string> = {
  read: "View",
  create: "Create",
  update: "Edit",
  delete: "Delete",
};

const scopeOptions = [
  { value: "organization", label: "Organization" },
  { value: "space", label: "Spaces" },
  { value: "project", label: "Projects" },
] as const;

const lifetimeOptions = [
  { value: "7", label: "7 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
] as const;

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
    <div className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="space-y-4 p-4">
        <ChoiceGroup
          label="Access scope"
          value={controller.scopeType}
          options={scopeOptions}
          onSelect={controller.setScopeType}
        />

        <ChoiceGroup
          label="Duration"
          value={String(controller.lifetimeDays)}
          options={lifetimeOptions}
          onSelect={(value) =>
            controller.setLifetimeDays(Number(value) as 7 | 30 | 90)
          }
        />

        <ScopeResourcePicker controller={controller} />
      </div>

      <Collapsible className="border-t border-border">
        <CollapsibleTrigger className="group flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/40">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 text-sm font-semibold text-foreground">
            {enabledResources.length} resources · {enabledActionCount}{" "}
            permissions
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
                    {controller.actionsForResource(resource).map((action) => (
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

function ChoiceGroup<TValue extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: TValue;
  options: ReadonlyArray<{ value: TValue; label: string }>;
  onSelect: (value: TValue) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-xs font-semibold text-foreground">
        {label}
      </legend>
      <div
        className="flex flex-wrap gap-2"
        role="radiogroup"
        aria-label={label}
      >
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => onSelect(option.value)}
              className={cn(
                "inline-flex min-h-9 flex-1 items-center gap-2 rounded-lg border px-3 text-start text-xs font-medium transition-colors sm:flex-none",
                checked
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <SelectionBox checked={checked} />
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
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
    <div className="border-t border-border pt-4">
      <p className="mb-2 text-xs font-semibold text-foreground">
        Choose {scopeType === "space" ? "spaces" : "projects"}
      </p>
      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
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
                "inline-flex min-h-9 min-w-0 items-center gap-2 rounded-lg border px-3 text-start text-xs font-medium transition-colors",
                checked
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <SelectionBox checked={checked} />
              <span className="max-w-48 truncate">{option.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectionBox({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded border",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background",
      )}
      aria-hidden="true"
    >
      {checked ? <Check className="size-3" /> : null}
    </span>
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
      <SelectionBox checked={checked} />
      {actionLabels[action]}
    </button>
  );
}
