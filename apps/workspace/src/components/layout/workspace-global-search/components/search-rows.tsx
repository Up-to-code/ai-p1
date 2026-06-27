import type { LucideIcon } from "lucide-react";

type SearchGroupProps = {
  title: string;
  children: React.ReactNode;
};

export function SearchGroup({ title, children }: SearchGroupProps) {
  if (!children || (Array.isArray(children) && children.length === 0)) return null;

  return (
    <section className="py-2">
      <h3 className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.18em] text-text-muted">{title}</h3>
      <div className="space-y-1">{children}</div>
    </section>
  );
}

type SearchRowProps = {
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  title: string;
};

export function SearchRow({ description, icon: Icon, onClick, title }: SearchRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-[16px] border border-transparent px-3 py-2.5 text-start transition hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/50 text-text-secondary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-black text-text-primary">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-text-secondary">{description}</span>
      </span>
    </button>
  );
}
