import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/brand/theme-toggle";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Shared Marketing Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-lg px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
          anan<span className="text-primary">portal</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/docs" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Security</Link>
          <Link href="/support" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">Support</Link>
          <ThemeToggle />
          <Link href="/signin" className="text-sm font-semibold text-foreground hover:text-primary transition-colors">Sign in</Link>
        </div>
      </header>
      {children}
    </>
  );
}
