import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full bg-zinc-50 p-4 text-zinc-950 dark:bg-[#0A0A0A] dark:text-white md:p-8 lg:p-10">
      <div className="mx-auto grid max-w-[1500px] gap-6">{children}</div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="grid gap-5 border-b border-zinc-100 pb-8 dark:border-white/5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-400">{eyebrow}</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-black tracking-tight text-zinc-950 dark:text-white md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm font-bold leading-6 text-zinc-500 dark:text-zinc-400">{description}</p>
      </div>
      {action}
    </header>
  );
}

export function Panel({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "dark" | "warn";
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border p-5 shadow-none",
        tone === "default" && "border-zinc-100 bg-white dark:border-white/5 dark:bg-white/[0.02]",
        tone === "dark" && "border-white/10 bg-zinc-950 text-white dark:bg-white/[0.03]",
        tone === "warn" && "border-amber-400/35 bg-amber-50 text-zinc-950 dark:border-amber-400/25 dark:bg-amber-500/[0.06] dark:text-white",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon: LucideIcon;
}) {
  return (
    <Panel className="p-5 transition hover:border-blue-500/20">
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-5 dark:border-white/5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">{label}</p>
          <p className="mt-4 text-4xl font-black tracking-tight text-zinc-950 dark:text-white">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-blue-500/20 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-right text-xs font-black text-zinc-500 dark:text-zinc-400">{hint}</p>
    </Panel>
  );
}

export function StatusBadge({ value, label }: { value: string; label?: string }) {
  const normalized = value.toLowerCase();
  const className =
    normalized === "approved" || normalized === "active" || normalized === "ok"
      ? "border-emerald-500/10 bg-emerald-100/50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      : normalized === "pending" || normalized === "warning"
        ? "border-amber-500/10 bg-amber-100/50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
        : normalized === "danger" || normalized === "rejected" || normalized === "suspended"
          ? "border-rose-500/10 bg-rose-100/50 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
          : "border-zinc-200 bg-zinc-100 text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400";

  return (
    <span className={cn("inline-flex rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-widest", className)}>
      {label ?? value.replace(/_/gu, " ")}
    </span>
  );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex h-11 items-center justify-center rounded-full bg-blue-600 px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-700">
      {children}
    </Link>
  );
}
