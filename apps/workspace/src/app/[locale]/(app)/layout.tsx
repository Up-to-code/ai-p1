import type { ReactNode } from "react";
import { DashboardAppWrapper } from "@/components/providers/dashboard-app-wrapper";

export default function AppLayout({ children }: { children: ReactNode }) {
  return <DashboardAppWrapper>{children}</DashboardAppWrapper>;
}
