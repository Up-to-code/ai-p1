import Link from "next/link";
import { PartnerLogo } from "./PartnerLogo";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <PartnerLogo />
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            Build trusted real-estate authorization apps with scoped OAuth, OIDC claims, and a review workflow designed for production integrations.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
          <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="/security" className="hover:text-foreground transition-colors">Security</Link>
          <Link href="/policies" className="hover:text-foreground transition-colors">Policies</Link>
        </nav>
      </div>
    </footer>
  );
}
