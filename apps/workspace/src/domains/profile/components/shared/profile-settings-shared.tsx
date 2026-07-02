"use client";

import { CheckCircle2, HelpCircle, ShieldCheck } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground dark:text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-[10px] font-medium text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

export function LockedProfileField({
  id,
  label,
  value,
}: {
  id: string;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </Label>
      <Input
        id={id}
        type="email"
        value={value}
        disabled
        aria-readonly="true"
        className="h-12 cursor-not-allowed rounded-xl border-border bg-muted font-medium text-muted-foreground disabled:opacity-100 dark:border-border dark:bg-muted dark:text-muted-foreground"
      />
    </div>
  );
}

export function ProfileField({
  id,
  label,
  type = "text",
  autoComplete,
  registration,
  error,
  tooltip,
  readOnly,
  disabled,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  tooltip?: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label
          htmlFor={id}
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
        >
          {label}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger className="inline-flex cursor-help">
              <HelpCircle className="w-3 h-3 text-muted-foreground hover:text-secondary-foreground transition-colors" />
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <Input
        id={id}
        type={type}
        autoComplete={autoComplete}
        className="h-12 rounded-xl border-border bg-background font-medium focus-visible:ring-blue-600/20 dark:border-border dark:bg-background"
        aria-invalid={Boolean(error)}
        readOnly={readOnly}
        disabled={disabled}
        data-readonly={readOnly ? "" : undefined}
        {...registration}
      />
      {error && (
        <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
          {error}
        </p>
      )}
    </div>
  );
}

export function RolePermissionsList({
  roleColor,
  roleLabel,
  activeLabel,
  currentRoleLabel,
  permissionsLabel,
  adminNote,
  permissionLabels,
}: {
  roleColor: string;
  roleLabel: string;
  activeLabel: string;
  currentRoleLabel: string;
  permissionsLabel: string;
  adminNote: string;
  permissionLabels: string[];
}) {
  return (
    <div className="space-y-5 border-y border-border py-5 dark:border-border">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted dark:bg-muted">
            <ShieldCheck className="h-4 w-4 text-muted-foreground dark:text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
              {currentRoleLabel}
            </p>
            <p className="truncate text-sm font-black text-foreground dark:text-foreground">
              {roleLabel}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest",
            roleColor,
          )}
        >
          {activeLabel}
        </span>
      </div>
      <div>
        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
          {permissionsLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          {permissionLabels.map((label) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-[10px] font-bold text-secondary-foreground dark:border-border dark:text-muted-foreground"
            >
              <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
              {label}
            </span>
          ))}
        </div>
      </div>
      <p className="text-[9px] font-medium text-muted-foreground">{adminNote}</p>
    </div>
  );
}
