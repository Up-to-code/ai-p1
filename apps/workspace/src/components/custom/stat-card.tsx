import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ label, value, trend, icon, className }: StatCardProps) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-2", className)}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
        {icon && <div className="text-zinc-300">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-3">
        <div className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</div>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
