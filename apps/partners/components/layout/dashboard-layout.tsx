import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { PartnerAccountView } from "@/types/account";

export function DashboardLayout({ children, account }: { children: React.ReactNode; account: PartnerAccountView | null }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Topbar account={account} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 overflow-y-auto p-6 md:p-12">
          <div className="mx-auto max-w-6xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
