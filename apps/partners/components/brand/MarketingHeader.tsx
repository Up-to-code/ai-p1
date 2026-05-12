import Link from "next/link";
import { marketingNav } from "@/lib/navigation";
import { PartnerLogo } from "./PartnerLogo";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--workspace-border)] bg-[var(--workspace-chrome-header-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <PartnerLogo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {marketingNav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/signin" className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="inline-flex h-9 items-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Create app
          </Link>
        </div>
      </div>
    </header>
  );
}
