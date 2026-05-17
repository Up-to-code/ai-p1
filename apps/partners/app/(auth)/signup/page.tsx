import Link from "next/link";
import { SignUpForm } from "@/components/forms/SignUpForm";
import { PartnerLogo } from "@/components/brand/PartnerLogo";

function safeReturnTo(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/dashboard";
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const redirectTo = safeReturnTo(returnTo);

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)]">
      <section className="hidden border-r border-border bg-sidebar p-8 lg:flex lg:flex-col lg:justify-between">
        <PartnerLogo inverse />
        <div className="max-w-md">
          <p className="mb-4 text-xs font-bold uppercase text-primary">Programmer organization</p>
          <h1 className="text-balance text-4xl font-bold leading-tight text-foreground">
            Create the workspace for reviewed app registrations.
          </h1>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            Your account owns OAuth clients, review state, runtime sync, and production authorization settings.
          </p>
        </div>
        <p className="font-mono text-xs text-muted-foreground">qentrah.partners.signup</p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-xl">
          <div className="lg:hidden">
            <PartnerLogo />
          </div>
          <div className="command-panel mt-8 p-5 lg:mt-0">
            <p className="text-xs font-bold uppercase text-primary">Create account</p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Set up partner access</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Create your developer login and the programmer organization used for app review.
            </p>
            <div className="mt-6">
              <SignUpForm redirectTo={redirectTo} />
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-semibold text-primary transition-colors hover:text-primary/80" href={`/signin?returnTo=${encodeURIComponent(redirectTo)}`}>
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
