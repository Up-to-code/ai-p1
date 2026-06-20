"use client";

import { Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export function StatusPill({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral" | "info";
}) {
  const toneClassName = {
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-400",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-400",
    danger: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-400",
    info: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400",
    neutral: "border-border bg-muted text-muted-foreground",
  }[tone];

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest", toneClassName)}>
      {label}
    </span>
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
    <div className="flex min-h-64 flex-col items-center justify-center rounded-[24px] border border-dashed border-border p-10 text-center">
      <Icon className="h-8 w-8 text-muted-foreground/40" />
      <h3 className="mt-5 text-sm font-black uppercase tracking-widest text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-xs font-medium uppercase leading-relaxed tracking-tight text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}
