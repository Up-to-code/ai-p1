import type { ReactNode } from "react";

export default function ClientsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-background p-6">
      {children}
    </div>
  );
}
