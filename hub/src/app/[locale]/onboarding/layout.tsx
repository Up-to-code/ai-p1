import { Triangle } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="h-16 px-6 border-b border-border/40 flex items-center bg-background shrink-0">
        <div className="flex items-center gap-2 font-semibold text-text-primary">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Triangle className="h-4 w-4 fill-current" />
          </div>
          <span>Anand Hub</span>
        </div>
      </header>
      <main className="flex-1 flex flex-col items-center p-6 sm:p-12">
        {children}
      </main>
    </div>
  );
}
