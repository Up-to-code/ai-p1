"use client";

import { type UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrgField({ id, label, type = "text", registration, error, disabled }: { id: string; label: string; type?: string; registration: UseFormRegisterReturn; error?: string; disabled?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</Label>
      <Input
        id={id}
        type={type}
        disabled={disabled}
        className="h-10 rounded-lg border-border bg-card/50 text-xs font-semibold shadow-none transition-colors focus-visible:border-ring focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:text-muted-foreground"
        aria-invalid={Boolean(error)}
        {...registration}
      />
      {error && <p className="text-[9px] font-bold uppercase tracking-wider text-red-500">{error}</p>}
    </div>
  );
}
