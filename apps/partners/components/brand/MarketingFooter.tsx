import Link from "next/link";
import { PartnerLogo } from "./PartnerLogo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <PartnerLogo />
          <p className="mt-4 max-w-xl text-[13px] leading-6 text-muted-foreground">
            Build trusted real-estate authorization apps with scoped OAuth, OIDC claims, and a review workflow designed for production integrations.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 text-[13px] font-semibold text-muted-foreground">
          <Link href="/docs" className="rounded-[6px] px-3 py-2 transition-colors hover:bg-muted hover:text-foreground">Docs</Link>
          <Link href="/pricing" className="rounded-[6px] px-3 py-2 transition-colors hover:bg-muted hover:text-foreground">Pricing</Link>
          <Link href="/security" className="rounded-[6px] px-3 py-2 transition-colors hover:bg-muted hover:text-foreground">Security</Link>
          <Link href="/policies" className="rounded-[6px] px-3 py-2 transition-colors hover:bg-muted hover:text-foreground">Policies</Link>
        </nav>
      </div>
    </footer>
  );
}
