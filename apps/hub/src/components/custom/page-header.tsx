import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode; // Action buttons slot
  className?: string;
}

export function PageHeader({ title, subtitle, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2", className)}>
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] font-medium text-zinc-400 tracking-tight">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 shrink-0 pb-1">
          {children}
        </div>
      )}
    </div>
  );
}
