export interface NewBadgeProps {
  className?: string;
}

export function NewBadge({ className }: NewBadgeProps) {
  return (
    <span className={"shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider leading-none text-white bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/30 animate-pulse" + (className ? ` ${className}` : "")}>
      <span className="w-1.5 h-1.5 rounded-full bg-white" />
      New
    </span>
  );
}
