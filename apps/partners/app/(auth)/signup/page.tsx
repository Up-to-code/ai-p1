import Link from "next/link";
import { SignUpForm } from "@/components/forms/SignUpForm";

function safeReturnTo(value: unknown) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/dashboard";
}

export default async function SignUpPage({
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
          <Link href="/" className="text-lg font-bold">
            qentrah<span className="text-primary">portal</span>
          </Link>
        </div>
        <div className="max-w-md">
          <p className="mb-4 text-xs font-bold uppercase text-[#B1BCC7]">Programmer organization</p>
          <blockquote className="text-balance text-4xl font-bold leading-tight">
            Set up the workspace for your app registrations.
          </blockquote>
          <p className="mt-6 text-sm font-medium leading-6 text-[#B1BCC7]">
            Qentrah Partner Developer Portal
          </p>
        </div>
        <p className="text-xs text-[#737883]">© 2026 Qentrah Partners</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg rounded-[22px] border border-border bg-card p-6 text-card-foreground shadow-[0_24px_80px_rgba(7,26,52,0.08)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.34)] sm:p-8">
          <div className="lg:hidden">
            <Link href="/" className="text-lg font-bold text-foreground">
              qentrah<span className="text-primary">portal</span>
            </Link>
          </div>
          <div className="mt-8 lg:mt-0">
            <h1 className="text-2xl font-bold text-foreground">Create your developer account</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Set up your developer login and programmer organization.
            </p>
          </div>
          <div className="mt-8">
            <SignUpForm redirectTo={redirectTo} />
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link className="font-semibold text-primary hover:text-primary/80 transition-colors" href={`/signin?returnTo=${encodeURIComponent(redirectTo)}`}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
