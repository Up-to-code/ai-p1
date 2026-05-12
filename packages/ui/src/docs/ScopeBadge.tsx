export type ScopeBadgeProps = {
  scopeId: string;
  label?: string;
};

export default function ScopeBadge({ scopeId, label }: ScopeBadgeProps) {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
      <span className="inline-flex rounded-md border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
        {scopeId}
      </span>
      {label ? <div className="mt-2 text-xs text-foreground/85">{label}</div> : null}
    </div>
  );
}
