import { redirect } from "next/navigation";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { getToken } from "@/lib/auth-server";
import { partnerAccountRepository } from "@/server/partnerAccount";

export default async function DashboardLayoutWrapper({ children }: { children: ReactNode }) {
  const token = await getToken().catch(() => null);

  if (!token) {
    const currentPath = (await headers()).get("x-qentrah-current-path") || "/dashboard";
    redirect(`/signin?returnTo=${encodeURIComponent(currentPath)}`);
  }

  const account = await partnerAccountRepository.getCurrent(token).catch(() => null);

  return <DashboardLayout account={account}>{children}</DashboardLayout>;
}
