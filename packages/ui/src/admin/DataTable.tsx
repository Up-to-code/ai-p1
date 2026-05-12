import type { ReactNode } from "react";
import { cn } from "@anan/platform-core/classnames";

type DataTableProps = {
  headers: string[];
  children: ReactNode;
  className?: string;
  maxHeightClassName?: string;
  stickyHeader?: boolean;
  tableClassName?: string;
  scrollClassName?: string;
};

/**
 * WHY:   Admin pages render dense operational tables and should share one clean, modern table frame.
 * WHAT:  Wraps a semantic table with the rebuilt admin border, sticky header, and bounded scrolling behavior.
 * HOW:   Accepts header labels and arbitrary row content while capping height so large datasets scroll inside the panel instead of stretching the whole page.
 */
export default function DataTable({
  headers,
  children,
  className,
  maxHeightClassName = "max-h-[min(68vh,920px)]",
  stickyHeader = true,
  tableClassName,
  scrollClassName,
}: DataTableProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[32px] border border-[color:color-mix(in_srgb,var(--workspace-border)_76%,transparent)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_96%,transparent)] shadow-[0_16px_48px_-32px_rgba(15,23,42,0.24)]",
        className,
      )}
    >
      <div className={cn("min-w-0 overflow-auto overscroll-contain [scrollbar-gutter:stable]", maxHeightClassName, scrollClassName)}>
        <table className={cn("min-w-full border-separate border-spacing-0", tableClassName)}>
          <thead
            className={cn(
              stickyHeader &&
                "sticky top-0 z-10 bg-[color:color-mix(in_srgb,var(--workspace-elevated)_88%,transparent)] backdrop-blur supports-[backdrop-filter]:bg-[color:color-mix(in_srgb,var(--workspace-elevated)_80%,transparent)]",
            )}
          >
            <tr className="bg-[color:color-mix(in_srgb,var(--workspace-elevated)_82%,transparent)]">
              {headers.map((header) => (
                <th
                  key={header}
                  className="border-b border-[color:color-mix(in_srgb,var(--workspace-border)_74%,transparent)] px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.18em] text-[var(--workspace-muted)]"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[color:color-mix(in_srgb,var(--workspace-border)_68%,transparent)]">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
