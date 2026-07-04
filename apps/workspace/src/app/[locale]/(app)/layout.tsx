import { auth } from "@clerk/nextjs/server";
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
  const session = await auth();

  // Redirect to choose-org if user is authenticated but doesn't have an organization
  if (session.userId && !session.orgId) {
    redirect(`/${locale}/choose-org`);
  }

  return (
    <DashboardAppWrapper>
      <RouteTransition>{children}</RouteTransition>
    </DashboardAppWrapper>
  );
}
