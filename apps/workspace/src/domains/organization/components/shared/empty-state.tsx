"use client";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
      <p className="text-sm font-black text-foreground">{title}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{description}</p>
    </div>
  );
}
