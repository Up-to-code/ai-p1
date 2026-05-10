import { Triangle } from "lucide-react";
import { Link } from "@/i18n/routing";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col relative">
      {/* Decorative atmospheric background */}
      <div className="absolute top-0 left-1/2 h-[600px] w-full max-w-[1200px] -translate-x-1/2 bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl dark:from-blue-900/10 pointer-events-none" />

      <header className="relative z-10 h-16 px-6 border-b border-zinc-100 dark:border-white/5 flex items-center shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-blue-600 text-white">
            <Triangle className="h-4 w-4 fill-current" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">Anan Hub</span>
        </Link>
      </header>
      <main className="relative z-10 flex-1 flex flex-col items-center p-6 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {children}
      </main>
    </div>
  );
}
