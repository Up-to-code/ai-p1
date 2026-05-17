import type { ReactNode } from "react";
import Link from "next/link";
import { PartnerLogo } from "@/components/brand/PartnerLogo";
import { ThemeToggle } from "@/components/brand/theme-toggle";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-border bg-background/92 px-4 backdrop-blur-lg sm:px-6">
        <PartnerLogo />
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/docs" className="hidden rounded-[6px] px-2 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex">Docs</Link>
          <Link href="/pricing" className="hidden rounded-[6px] px-2 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex">Pricing</Link>
          <Link href="/security" className="hidden rounded-[6px] px-2 py-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:inline-flex">Security</Link>
          <ThemeToggle />
          <Link href="/signin" className="rounded-[6px] px-3 py-2 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted">Sign in</Link>
          <Link href="/signup" className="rounded-[6px] bg-primary px-3 py-2 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90">Create app</Link>
        </div>
      </header>
      {children}
    </>
  );
}
