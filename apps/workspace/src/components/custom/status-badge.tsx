"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

type StatusVariant = "draft" | "pending" | "approved" | "rejected" | "synced" | "blocked" | "under-construction" | "completed" | "off-plan" | "available" | "sold" | "reserved";

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  statusLabel?: string;
  className?: string;
}

const STATUS_CONFIG: Record<StatusVariant, { label: string; dot: string; bg: string; text: string; ring: string }> = {
  draft:    { label: "Draft",    dot: "bg-text-muted", bg: "bg-surface",    text: "text-text-secondary", ring: "ring-border/70" },
  pending:  { label: "Pending",  dot: "bg-warning",    bg: "bg-warning/10", text: "text-warning",        ring: "ring-warning/20" },
  approved: { label: "Approved", dot: "bg-success",    bg: "bg-success/10", text: "text-success",        ring: "ring-success/20" },
  rejected: { label: "Rejected", dot: "bg-danger",     bg: "bg-danger/10",  text: "text-danger",         ring: "ring-danger/20" },
  synced:   { label: "Synced",   dot: "bg-primary",    bg: "bg-primary/10", text: "text-primary",        ring: "ring-primary/20" },
  blocked:  { label: "Blocked",  dot: "bg-text-muted", bg: "bg-surface",    text: "text-text-muted",     ring: "ring-border/70" },
  "under-construction": { label: "Under Construction", dot: "bg-orange-500", bg: "bg-orange-500/10", text: "text-orange-600", ring: "ring-orange-500/20" },
  completed: { label: "Completed", dot: "bg-green-500", bg: "bg-green-500/10", text: "text-green-600", ring: "ring-green-500/20" },
  "off-plan": { label: "Off-Plan", dot: "bg-blue-500", bg: "bg-blue-500/10", text: "text-blue-600", ring: "ring-blue-500/20" },
  available: { label: "Available", dot: "bg-success", bg: "bg-success/10", text: "text-success", ring: "ring-success/20" },
  sold:      { label: "Sold",      dot: "bg-text-muted", bg: "bg-surface", text: "text-text-secondary", ring: "ring-border/70" },
  reserved:  { label: "Reserved",  dot: "bg-warning", bg: "bg-warning/10", text: "text-warning", ring: "ring-warning/20" },
};

export function StatusBadge({ status, label, statusLabel, className }: StatusBadgeProps) {
  const t = useTranslations("Statuses");
  const config = STATUS_CONFIG[status];

  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-6 min-w-20 justify-start gap-1.5 rounded-md border-0 px-2.5 py-0 text-xs font-semibold leading-none ring-1",
        config.bg,
        config.text,
        config.ring,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", config.dot)} />
      <span className="truncate">{label ?? statusLabel ?? t(status)}</span>
    </Badge>
  );
}
