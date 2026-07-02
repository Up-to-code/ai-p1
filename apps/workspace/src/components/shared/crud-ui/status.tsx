"use client";

import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { StatusPill as SharedStatusPill, EmptyState as SharedEmptyState, type StatusPillTone } from "@qentrah/ui";

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral" | "info";
}) {
  return (
    <SharedStatusPill
      tone={tone as StatusPillTone}
      label={label}
      size="sm"
      className="px-3 py-1 text-[9px] tracking-widest"
    />
  );
}

export function SearchBox({
  value,
  onChange,
  placeholder,
  name = "search",
  ariaLabel,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
  ariaLabel?: string;
  className?: string;
}) {
  const t = useTranslations("Common");
  return (
    <div className={cn("flex items-center gap-2 rounded-xl border border-border bg-muted px-3 focus-within:ring-2 focus-within:ring-ring", className)}>
      <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <input
        aria-label={ariaLabel || t('searchAriaLabel')}
        autoComplete="off"
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || t('searchPlaceholder')}
        className="h-9 w-40 border-none bg-transparent text-[10px] font-black uppercase tracking-widest text-foreground outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

export function EmptyWorkspace({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <SharedEmptyState
      icon={<Icon className="h-8 w-8" />}
      title={title}
      description={description}
      size="lg"
      className="rounded-[24px] min-h-64"
    >
      {children}
    </SharedEmptyState>
  );
}
