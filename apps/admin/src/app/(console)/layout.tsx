import type { ReactNode } from "react";
import { AdminShell } from "@/components/layout/admin-shell";
import { getAdminLocale } from "@/lib/i18n";
import { requireAdminIdentity } from "@/lib/admin-auth";

export default async function AdminConsoleLayout({ children }: { children: ReactNode }) {
  const locale = await getAdminLocale();
  const identity = await requireAdminIdentity(locale);

  return (
    <AdminShell locale={locale} identity={identity}>
      {children}
    </AdminShell>
  );
}
