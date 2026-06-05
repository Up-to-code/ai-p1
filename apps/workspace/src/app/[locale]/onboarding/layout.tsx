export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[oklch(97.5%_0.006_255)] dark:bg-[oklch(8.5%_0.012_255)] flex flex-col relative">
      <main className="relative z-10 flex-1 flex flex-col items-center p-6 sm:p-12">
        {children}
      </main>
    </div>
  );
}
