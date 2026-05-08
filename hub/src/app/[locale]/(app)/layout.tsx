import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { PendingApprovalBanner } from "@/components/layout/pending-approval-banner";
import { ToastProvider } from "@/components/ui/toast";
import { SidebarProvider } from "@/components/layout/sidebar-context";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hardcoded for demonstration. In a real app, this comes from the user's organization state.
  const isPendingApproval = true;

  return (
    <ToastProvider>
      <SidebarProvider>
        <div className="h-full overflow-hidden flex bg-background text-text-primary">
          {/* Desktop Sidebar */}
          <div className="hidden lg:flex h-full">
            <Sidebar />
          </div>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-surface">
            {isPendingApproval && <PendingApprovalBanner />}
            <Topbar />
            <main className="flex-1 overflow-y-auto outline-none">
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}
