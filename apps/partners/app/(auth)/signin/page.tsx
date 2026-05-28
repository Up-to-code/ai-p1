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
    <main className="min-h-dvh bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-4 sm:px-6">
        <PartnerLogo />
        <Link className="text-sm font-semibold text-primary transition-colors hover:text-primary/80" href={`/signup?returnTo=${encodeURIComponent(redirectTo)}`}>
          Create account
        </Link>
      </header>

      <section className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="command-panel p-5">
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
