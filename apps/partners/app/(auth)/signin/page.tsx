import Link from "next/link";
import { SignInForm } from "@/components/forms/SignInForm";
import { PartnerLogo } from "@/components/brand/PartnerLogo";

function safeReturnTo(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const redirectTo = safeReturnTo(returnTo);

  return (
    <main className="grid min-h-dvh bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <div className="hidden flex-col justify-between bg-[#071A34] p-12 text-white lg:flex">
        <div>
          <PartnerLogo inverse />
        </div>
        <div className="max-w-md">
          <p className="mb-4 text-xs font-bold uppercase text-[#B1BCC7]">Developer console</p>
          <blockquote className="text-balance text-4xl font-bold leading-tight">
            The fastest path from OAuth draft to reviewed partner app.
          </blockquote>
          <p className="mt-6 text-sm font-medium leading-6 text-[#B1BCC7]">
            Qentrah Partner Developer Portal
          </p>
        </div>
        <p className="text-xs text-[#737883]">© 2026 Qentrah Partners</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden">
            <PartnerLogo />
          </div>
          <div className="mt-8 lg:mt-0">
            <h1 className="text-2xl font-bold text-foreground">Sign in to your account</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Use the same partner account that owns your programmer organization.
            </p>
          </div>
          <div className="mt-8">
            <SignInForm redirectTo={redirectTo} />
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Need a developer account?{" "}
            <Link className="font-semibold text-primary hover:text-primary/80 transition-colors" href={`/signup?returnTo=${encodeURIComponent(redirectTo)}`}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
