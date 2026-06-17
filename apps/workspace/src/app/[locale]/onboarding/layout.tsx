export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <main className="relative z-10 flex-1 flex flex-col items-center p-6 sm:p-12">
        {children}
      </main>
    </div>
  );
}
