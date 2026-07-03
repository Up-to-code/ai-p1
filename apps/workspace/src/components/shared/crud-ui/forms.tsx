"use client";

import type { LucideIcon } from "lucide-react";
import { AlertTriangle, ArrowLeft, Trash2 } from "lucide-react";
import { AppPrimaryButton } from "@/components/shared";
import { Link } from "@/i18n/routing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorState } from "./loading";

type FieldError = string | undefined;

export function FormErrorSummary({ errors }: { errors: Record<string, string | undefined> }) {
  const t = useTranslations('Common');
  const messages = Object.values(errors).filter(Boolean);
  if (messages.length === 0) return null;

  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4 text-start dark:border-red-900/30 dark:bg-red-950/10" role="alert">
      <p className="text-[10px] font-black uppercase tracking-widest text-red-600">{t('reviewFields')}</p>
      <ul className="mt-2 space-y-1 text-xs font-bold text-red-600/80">
        {messages.slice(0, 4).map((message) => <li key={message}>{message}</li>)}
      </ul>
    </div>
  );
}

export function DetailNotFoundState({
  title,
  description,
  backHref,
  backLabel,
}: {
  title: string;
  description: string;
  backHref: string;
  backLabel?: string;
}) {
  const t = useTranslations('Common');
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-border p-10 text-center">
      <AlertTriangle className="h-8 w-8 text-muted-foreground/40" />
      <h3 className="mt-5 text-sm font-black uppercase tracking-widest text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-xs font-medium uppercase leading-relaxed tracking-tight text-muted-foreground">{description}</p>
      <Link href={backHref} className="mt-6 inline-flex h-10 items-center justify-center rounded-xl border border-border px-5 text-[10px] font-black uppercase tracking-widest text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
        <ArrowLeft className="me-2 h-3.5 w-3.5" aria-hidden="true" />
        {backLabel || t('backToList')}
      </Link>
    </div>
  );
}

export function DeleteRecordDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  isDeleting = false,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  isDeleting?: boolean;
  error?: string | null;
}) {
  const t = useTranslations('Common');
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[24px] border-border bg-card p-6 shadow-none">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-red-50 text-red-600">
            <AlertTriangle className="h-5 w-5" />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-start text-lg font-black uppercase tracking-tight">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-start text-xs font-medium uppercase leading-relaxed tracking-tight">
            {description}
          </AlertDialogDescription>
          {error && <ErrorState description={error} />}
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-5 gap-2">
          <AlertDialogCancel className="h-10 rounded-xl px-5 text-[10px] font-black uppercase tracking-widest">
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            className="h-10 rounded-xl bg-red-600 px-5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-700"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            {isDeleting ? t('deleting') : t('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FormField({
  id,
  label,
  error,
  children,
  className,
}: {
  id?: string;
  label: string;
  error?: FieldError;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2 text-start", className)}>
      <Label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground rtl:text-right">
        {label}
      </Label>
      {children}
      {error && (
        <p id={id ? `${id}-error` : undefined} className="text-[10px] font-bold text-red-600 rtl:text-right" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete = "off",
  inputMode,
  error,
  className,
}: {
  id?: string;
  name?: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  error?: FieldError;
  className?: string;
}) {
  const inputId = id ?? name ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  return (
    <FormField id={inputId} label={label} error={error} className={className}>
      <Input
        id={inputId}
        name={name ?? inputId}
        value={value}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-2xl border-border bg-muted/50 px-4 text-sm font-black uppercase tracking-tight shadow-none transition-all focus:border-ring focus:bg-card focus:ring-4 focus:ring-ring rtl:text-right"
      />
    </FormField>
  );
}

export function FormActions({
  onCancel,
  submitLabel,
  isSubmitting = false,
}: {
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
}) {
  const t = useTranslations('Common');
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <AppPrimaryButton type="submit" disabled={isSubmitting} className="h-11 px-10 shadow-none">
        {submitLabel || t('save')}
      </AppPrimaryButton>
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        className="h-11 rounded-xl px-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
      >
        {t('cancel')}
      </Button>
    </div>
  );
}

export function SelectField<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  error,
  className,
}: {
  id?: string;
  label: string;
  value: TValue;
  options: { value: TValue; label: string; icon?: LucideIcon }[];
  onChange: (value: TValue) => void;
  placeholder?: string;
  error?: FieldError;
  className?: string;
}) {
  return (
    <FormField id={id} label={label} error={error} className={className}>
      <Select value={value} onValueChange={(val: string | null) => { if (val) onChange(val as TValue); }}>
        <SelectTrigger id={id} className="h-11 rounded-xl border-border bg-muted/50 px-4 text-sm font-bold shadow-none transition-all focus:border-ring focus:bg-card focus:ring-4 focus:ring-ring rtl:text-right">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent align="start" className="rounded-xl border-border">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value} className="py-3 px-4 rounded-xl text-xs font-bold">
              <div className="flex items-center gap-2">
                {option.icon && <option.icon className="h-3.5 w-3.5 opacity-50" />}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

export function SegmentedControl<TValue extends string>({
  id,
  label,
  value,
  options,
  onChange,
  error,
  className,
}: {
  id?: string;
  label: string;
  value: TValue;
  options: { value: TValue; label: string; icon?: LucideIcon }[];
  onChange: (value: TValue) => void;
  error?: FieldError;
  className?: string;
}) {
  return (
    <FormField id={id} label={label} error={error} className={className}>
      <div className="flex h-11 w-full gap-1 rounded-xl border border-border bg-muted/50 p-1">
        {options.map((option) => {
          const isActive = option.value === value;
          const Icon = option.icon;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all duration-200",
                isActive
                  ? "bg-white text-foreground dark:bg-white/10"
                  : "text-muted-foreground hover:bg-white/50 hover:text-foreground dark:hover:text-muted-foreground/40"
              )}
            >
              {Icon && <Icon className="h-3 w-3" />}
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </FormField>
  );
}
