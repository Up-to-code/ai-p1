import type { ReactNode } from "react";

type NavTooltipProps = {
  label: string;
  disabled?: boolean;
  children: ReactNode;
};

/** Collapsed-sidebar hover label. */
export function NavTooltip({ label, disabled, children }: NavTooltipProps) {
  if (disabled || !label) return <>{children}</>;

  return (
    <div className="group/tip relative flex items-center">
      {children}
      <div className="pointer-events-none absolute start-full z-50 ms-3 hidden min-w-max rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] font-bold shadow-lg group-hover/tip:flex">
        {label}
      </div>
    </div>
  );
}
