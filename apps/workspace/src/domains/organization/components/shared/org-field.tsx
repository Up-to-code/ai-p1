"use client";

import { type UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function OrgField({ id, label, type = "text", registration, error, disabled }: { id: string; label: string; type?: string; registration: UseFormRegisterReturn; error?: string; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-muted-foreground">{label}</Label>
      <Input
        id={id}
        type={type}
        disabled={disabled}
        className="h-10 rounded-lg border-border bg-card text-sm font-medium shadow-none transition-colors focus-visible:border-ring focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
        aria-invalid={Boolean(error)}
        {...registration}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}
