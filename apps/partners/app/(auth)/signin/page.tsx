import Link from "next/link";
import { SignInForm } from "@/components/forms/SignInForm";

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
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-between bg-black text-white p-12">
        <div>
          <Link href="/" className="text-lg font-bold tracking-tight">
            anan<span className="text-primary">portal</span>
          </Link>
        </div>
        <div className="max-w-md">
          <blockquote className="text-2xl font-bold leading-snug tracking-tight">
            "The fastest way to build trusted integrations for real-estate workflows."
          </blockquote>
          <p className="mt-6 text-sm text-slate-400 font-medium">
            Anan Partner Developer Portal
          </p>
        </div>
        <p className="text-xs text-slate-600">© 2026 Anan Partners</p>
      </div>

      {/* Right panel — form */}
      <div className="flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden">
            <Link href="/" className="text-lg font-bold tracking-tight text-foreground">
              anan<span className="text-primary">portal</span>
            </Link>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Sign in to your account</h1>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Use the same partner account that owns your programmer organization.
            </p>
          </div>
          <SignInForm redirectTo={redirectTo} />
          <p className="text-center text-sm text-muted-foreground">
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
