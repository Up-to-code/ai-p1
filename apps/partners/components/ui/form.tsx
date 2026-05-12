import type { ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

export function Field({
  label,
  error,
  children,
  className,
  htmlFor,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("block space-y-1.5 text-sm font-medium text-foreground", className)}>
      <span>{label}</span>
      {children}
      {error ? <span className="block text-xs font-medium text-destructive">{error}</span> : null}
    </label>
  );
}
