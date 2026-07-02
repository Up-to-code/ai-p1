"use client";

import { CheckCircle2, HelpCircle, ShieldCheck, type LucideIcon } from "lucide-react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// ── Section wrapper ────────────────────────────────────────────────────────────
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
        <h2 className="text-sm font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">
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
        className="text-sm font-medium text-muted-foreground"
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

// ── Form field ─────────────────────────────────────────────────────────────────
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
          className="text-sm font-medium text-muted-foreground"
        >
          {label}
        </Label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger className="inline-flex cursor-help">
              <HelpCircle className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors" />
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
        <p className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function RolePermissionsList({
  roleColor,
  roleLabel,
  currentRoleLabel,
  permissionsLabel,
  permissionLabels,
}: {
  roleColor: string;
  roleLabel: string;
  currentRoleLabel: string;
  permissionsLabel: string;
  permissionLabels: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          <ShieldCheck className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">
            {currentRoleLabel}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {roleLabel}
          </p>
        </div>
      </div>
      {permissionLabels.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            {permissionsLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {permissionLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function NotificationSwitchRow({
  icon: Icon,
  label,
  note,
  enabled,
  pending,
  onToggle,
}: {
  icon: LucideIcon;
  label: string;
  note: string;
  enabled: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="py-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              {label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {note}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          disabled={pending}
          onClick={onToggle}
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full border-2 transition-colors disabled:opacity-60 rtl:flex-row-reverse",
            enabled
              ? "border-foreground bg-foreground"
              : "border-border bg-muted",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform rtl:-translate-x-0.5",
              enabled ? "ltr:translate-x-5 rtl:translate-x-[-1.25rem]" : "ltr:translate-x-0.5 rtl:translate-x-0.5",
            )}
          />
        </button>
      </div>
    </div>
  );
}

export function AccountDataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="py-5">
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </p>
          <p
            className="mt-1 truncate text-sm font-black text-foreground dark:text-foreground"
            title={value}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function BrandDataRow({
  label,
  value,
  name,
  initials,
  logo,
  brandColor,
}: {
  label: string;
  value: string;
  name: string;
  initials: string;
  logo?: string | null;
  brandColor?: string | null;
}) {
  return (
    <div className="py-5">
      <div className="flex items-center gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl text-xs font-black uppercase text-white"
          style={{ backgroundColor: brandColor || "#18181b" }}
        >
          {logo ? (
            <span
              role="img"
              aria-label={name}
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${logo})` }}
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </p>
          <p
            className="mt-1 truncate text-sm font-black text-foreground dark:text-foreground"
            title={value}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Security row ───────────────────────────────────────────────────────────────
export function SecurityRow({
  icon: Icon,
  label,
  value,
  note,
  action,
  warn,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note?: string;
  action?: { label: string; onClick: () => void };
  warn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            warn
              ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-muted dark:bg-muted text-muted-foreground dark:text-muted-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-0.5 text-sm font-bold text-foreground dark:text-foreground">
            {value}
          </p>
          {note && (
            <p className="text-[9px] font-medium text-muted-foreground mt-0.5">
              {note}
            </p>
          )}
        </div>
      </div>
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className={cn(
            "h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
            warn
              ? "border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10"
              : "border-border dark:border-border hover:border-foreground dark:hover:border-foreground",
          )}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
