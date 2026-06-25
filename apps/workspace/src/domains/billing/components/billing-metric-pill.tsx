import type React from "react";

export function BillingMetricPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}:
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
        {value}
      </span>
    </div>
  );
}
