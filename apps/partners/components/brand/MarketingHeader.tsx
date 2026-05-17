import Link from "next/link";
import { marketingNav } from "@/lib/navigation";
import { PartnerLogo } from "./PartnerLogo";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
        <PartnerLogo />
        <nav className="hidden items-center gap-2 text-[13px] font-semibold text-muted-foreground md:flex">
          {marketingNav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-[6px] px-3 py-2 transition-colors hover:bg-muted hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/signin" className="inline-flex h-9 items-center rounded-[6px] px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted">
            Sign in
          </Link>
          <Link href="/signup" className="inline-flex h-9 items-center rounded-[6px] bg-primary px-3 text-[13px] font-bold text-primary-foreground transition-colors hover:bg-primary/90">
            Create app
          </Link>
        </div>
      </div>
    </header>
  );
}
