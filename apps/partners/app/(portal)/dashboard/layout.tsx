import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getToken } from "@/lib/auth-server";
import { partnerAccountRepository } from "@/server/partnerAccount";

export default async function DashboardLayoutWrapper({ children }: { children: ReactNode }) {
  const token = await getToken().catch(() => null);

  if (!token) {
    redirect("/signin?returnTo=/dashboard");
  }

  const account = await partnerAccountRepository.getCurrent(token).catch(() => null);

  return <DashboardLayout account={account}>{children}</DashboardLayout>;
}
