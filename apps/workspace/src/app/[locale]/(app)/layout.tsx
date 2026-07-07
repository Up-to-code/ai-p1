import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardAppWrapper } from "@/components/providers/dashboard-app-wrapper";
import { RouteTransition } from "@/components/layout/route-transition";

export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return (
    <DashboardAppWrapper>
      <RouteTransition>{children}</RouteTransition>
    </DashboardAppWrapper>
  );
}
