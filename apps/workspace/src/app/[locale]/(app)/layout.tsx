import type { ReactNode } from "react";
import { DashboardAppWrapper } from "@/components/providers/dashboard-app-wrapper";
import { RouteTransition } from "@/components/layout/route-transition";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardAppWrapper>
      <RouteTransition>{children}</RouteTransition>
    </DashboardAppWrapper>
  );
}
