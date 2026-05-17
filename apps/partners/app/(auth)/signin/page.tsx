import Link from "next/link";
import { SignInForm } from "@/components/forms/SignInForm";
import { PartnerLogo } from "@/components/brand/PartnerLogo";

function safeReturnTo(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const redirectTo = safeReturnTo(returnTo);

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
      <section className="hidden border-r border-border bg-sidebar p-8 lg:flex lg:flex-col lg:justify-between">
        <PartnerLogo inverse />
        <div className="max-w-md">
          <p className="mb-4 text-xs font-bold uppercase text-primary">Developer console</p>
          <h1 className="text-balance text-4xl font-bold leading-tight text-foreground">
            Return to the OAuth command deck.
          </h1>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Pick up drafts, review notes, runtime sync, and app credentials from the same operating surface.
          </p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">qentrah.partners.auth</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <PartnerLogo />
          </div>
          <div className="command-panel mt-8 p-5 lg:mt-0">
            <p className="text-xs font-bold uppercase text-primary">Sign in</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Open partner console</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use the partner account that owns your programmer organization.
            </p>
            <div className="mt-6">
              <SignInForm redirectTo={redirectTo} />
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Need a developer account?{" "}
            <Link className="font-semibold text-primary transition-colors hover:text-primary/80" href={`/signup?returnTo=${encodeURIComponent(redirectTo)}`}>
              Create one
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
