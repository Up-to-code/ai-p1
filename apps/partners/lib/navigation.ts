import { Activity, LayoutGrid, UserCircle } from "lucide-react";
import type { PartnerAppStatus } from "@/server/partnerApps";
import type { DashboardNavItem } from "@/types/nav";

export const marketingNav = [
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  { href: "/security", label: "Security" },
  { href: "/policies", label: "Policies" },
] as const;

export const dashboardNav: DashboardNavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/apps", label: "Apps", icon: LayoutGrid },
  { href: "/dashboard/status", label: "Status", icon: Activity },
  { href: "/dashboard/account", label: "Account", icon: UserCircle },
];

export function getStatusLabel(status: PartnerAppStatus) {
  return status.replaceAll("_", " ");
}

export function getStatusTone(status: PartnerAppStatus): "default" | "success" | "warning" | "danger" | "info" {
  if (status === "active") return "success";
  if (status === "pending_review") return "warning";
  if (status === "rejected" || status === "suspended") return "danger";
  return "default";
}

export function canEditPartnerApp(status: PartnerAppStatus) {
  return status === "draft" || status === "rejected";
}
