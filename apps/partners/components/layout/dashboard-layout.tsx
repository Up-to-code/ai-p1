import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import type { PartnerAccountView } from "@/types/account";

export function DashboardLayout({ children, account }: { children: React.ReactNode; account: PartnerAccountView | null }) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <Topbar account={account} />
      <div className="relative flex flex-1 overflow-hidden">
        <Sidebar className="hidden md:flex" />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 md:py-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
