import type { ReactNode } from "react";
import Link from "next/link";
import { PartnerLogo } from "@/components/brand/PartnerLogo";
import { ThemeToggle } from "@/components/brand/theme-toggle";
import { MarketingFooter } from "@/components/brand/MarketingFooter";
import { PartnersMarketingJsonLd } from "@/components/seo-json-ld";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PartnersMarketingJsonLd />

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-background/92 px-4 backdrop-blur-lg sm:px-6">
          <PartnerLogo />
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
              <Link href="/docs" className="transition-colors hover:text-foreground">Documentation</Link>
              <Link href="/pricing" className="transition-colors hover:text-foreground">Pricing</Link>
              <Link href="/security" className="transition-colors hover:text-foreground">Security</Link>
            </nav>
            <Link href="/signin" className="text-sm font-medium text-foreground">Sign in</Link>
            <Link href="/signup" className="hidden rounded-full bg-primary px-4 py-2 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex">Create app</Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
        
        <MarketingFooter />
      </section>
    </div>
  );
}
