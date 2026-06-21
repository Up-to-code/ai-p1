import { ReactNode } from "react";

export default async function ProjectLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}
