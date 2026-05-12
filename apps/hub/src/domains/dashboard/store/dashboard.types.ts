import type { LucideIcon } from "lucide-react";

export interface DashboardMetric {
  label: string;
  value: string;
  trend: string;
  icon: LucideIcon;
}

export interface Thread {
  id: string;
  title: string;
  date: string;
  excerpt?: string;
}
