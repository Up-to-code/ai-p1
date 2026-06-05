"use client";

import { AlertCircle, ArrowRight, ChevronLeft, KeyRound, Loader2, Mail, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/routing";
import type { AuthFlowPhase, ClerkSocialProvider } from "@/domains/auth/hooks/use-headless-clerk-auth";

type AuthAccessScreenProps = {
  mode: "sign-in" | "sign-up";
  error?: string | null;
  phase: AuthFlowPhase;
  isPending: boolean;
  pendingProvider?: ClerkSocialProvider | null;
  onCredentialsSubmit: (input: { emailAddress: string; firstName?: string; lastName?: string; password: string }) => void;
  onSocialSignIn: (provider: ClerkSocialProvider) => void;
  onVerifyCode: (code: string) => void;
};

const authVideoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4";
const isAppleAuthEnabled = process.env.NEXT_PUBLIC_ENABLE_APPLE_AUTH === "true";

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LegalAgreement({ isAr }: { isAr: boolean }) {
  const t = useTranslations("signin");

  return (
    <p className="mt-5 text-center text-xs leading-6 text-text-secondary">
      {isAr ? (
        <>
          {t("agreementPrefix")}{" "}
          <Link href="/terms" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("agreementTerms")}
          </Link>
          {" و"}
          <Link href="/privacy" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("agreementPrivacy")}
          </Link>{" "}
          {t("agreementSuffix")}
        </>
      ) : (
        <>
          {t("agreementPrefix")}{" "}
          <Link href="/terms" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("agreementTerms")}
          </Link>{" "}
          {t("agreementAnd")}{" "}
          <Link href="/privacy" className="font-semibold text-primary underline-offset-2 hover:underline">
            {t("agreementPrivacy")}
          </Link>
          {t("agreementSuffix")}
        </>
      )}
    </p>
  );
}

function AuthBrandLockup({ className = "" }: { className?: string }) {
  const locale = useLocale();
  const isAr = locale === "ar";
  const brandLabel = isAr ? "كانترا" : "qentrah";

  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <BrandMark className="h-7 w-7 transition-transform duration-200 group-hover:scale-105" priority />
      <span className="text-lg font-black leading-none tracking-tight text-foreground">
        {brandLabel}
      </span>
    </Link>
  );
}

function PendingSpinner() {
  return <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />;
}

export function AuthAccessScreen({
  error,
  isPending,
  mode,
  onCredentialsSubmit,
  onSocialSignIn,
  onVerifyCode,
  pendingProvider,
  phase,
}: AuthAccessScreenProps) {
  const t = useTranslations("signin");
  const locale = useLocale();
  const isAr = locale === "ar";
  const isSignUp = mode === "sign-up";
  const [emailAddress, setEmailAddress] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const isEmailPending = isPending && !pendingProvider;

  function handleCredentialsSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCredentialsSubmit({ emailAddress, firstName, lastName, password });
  }

  function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onVerifyCode(verificationCode);
  }

  return (
    <main className="min-h-svh overflow-x-hidden bg-[oklch(97.5%_0.006_255)] text-foreground dark:bg-[oklch(8.5%_0.012_255)] lg:grid lg:min-h-screen lg:grid-cols-2">
      <section className={`flex min-h-svh flex-col px-4 py-5 sm:px-8 lg:min-h-screen lg:px-12 lg:py-8 ${isAr ? "lg:[grid-column:2]" : "lg:[grid-column:1]"}`}>
        <div className="flex items-center justify-between gap-4">
          <AuthBrandLockup />
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[10px] font-black uppercase tracking-[0.08em] text-text-secondary transition hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {t("backToHome")}
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[min(420px,calc(100vw-2rem))] min-w-0 text-start">
            <AuthBrandLockup className="mb-8 lg:hidden [&>img]:h-8 [&>img]:w-8 [&>span]:text-2xl" />

            <div className="space-y-3">
              <h1 className="text-[32px] font-semibold leading-tight tracking-0 text-foreground sm:text-4xl rtl:leading-[1.25]">
                {isSignUp ? t("createAccount") : t("title")}
              </h1>
              <p className="max-w-sm text-sm font-medium leading-6 text-text-secondary">
                {isSignUp ? t("createAccountDesc") : t("description")}
              </p>
            </div>

            <div className={`mt-8 grid gap-3 ${isAppleAuthEnabled ? "sm:grid-cols-2" : ""}`}>
              <Button
                className="h-12 rounded-2xl border-zinc-200 bg-white text-sm font-bold text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                disabled={isPending}
                onClick={() => onSocialSignIn("google")}
                type="button"
                variant="outline"
              >
                {isPending && pendingProvider === "google" ? <PendingSpinner /> : <GoogleMark />}
                <span className="min-w-0 truncate">
                  {isPending && pendingProvider === "google" ? t("connectingGoogle") : t("google")}
                </span>
              </Button>
              {isAppleAuthEnabled ? (
                <Button
                  className="h-12 rounded-2xl border-zinc-200 bg-white text-sm font-bold text-zinc-950 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                  disabled={isPending}
                  onClick={() => onSocialSignIn("apple")}
                  type="button"
                  variant="outline"
                >
                  {isPending && pendingProvider === "apple" ? <PendingSpinner /> : <span className="text-lg leading-none"></span>}
                  <span className="min-w-0 truncate">
                    {isPending && pendingProvider === "apple" ? t("connectingApple") : t("apple")}
                  </span>
                </Button>
              ) : null}
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-black uppercase tracking-[0.08em] text-text-secondary">
                {t("or")}
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            {phase === "credentials" ? (
              <form className="space-y-4" onSubmit={handleCredentialsSubmit}>
                {isSignUp ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="auth-first-name" className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary">
                        {t("firstNameLabel")}
                      </Label>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                        <Input
                          autoComplete="given-name"
                          className="h-12 rounded-2xl ps-11 text-start"
                          id="auth-first-name"
                          onChange={(event) => setFirstName(event.target.value)}
                          placeholder={t("firstNamePlaceholder")}
                          required
                          type="text"
                          value={firstName}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="auth-last-name" className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary">
                        {t("lastNameLabel")}
                      </Label>
                      <div className="relative">
                        <UserRound className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                        <Input
                          autoComplete="family-name"
                          className="h-12 rounded-2xl ps-11 text-start"
                          id="auth-last-name"
                          onChange={(event) => setLastName(event.target.value)}
                          placeholder={t("lastNamePlaceholder")}
                          required
                          type="text"
                          value={lastName}
                        />
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="auth-email" className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary">
                    {t("emailLabel")}
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <Input
                      autoComplete="email"
                      className="h-12 rounded-2xl ps-11 text-start"
                      id="auth-email"
                      inputMode="email"
                      onChange={(event) => setEmailAddress(event.target.value)}
                      placeholder={t("emailPlaceholder")}
                      required
                      type="email"
                      value={emailAddress}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auth-password" className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary">
                    {t("passwordLabel")}
                  </Label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
                    <Input
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      className="h-12 rounded-2xl ps-11 text-start"
                      id="auth-password"
                      minLength={8}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder={t("passwordPlaceholder")}
                      required
                      type="password"
                      value={password}
                    />
                  </div>
                </div>
                {error ? (
                  <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200" role="alert">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>{error}</p>
                  </div>
                ) : null}
                <Button className="h-12 w-full rounded-2xl text-sm font-bold" disabled={isPending} type="submit">
                  {isEmailPending ? (
                    <>
                      <PendingSpinner />
                      {t("connectingEmail")}
                    </>
                  ) : (
                    <>
                      {isSignUp ? t("createAccountButton") : t("continueWithEmail")}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleVerifySubmit}>
                <div className="space-y-2">
                  <Label htmlFor="auth-code" className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary">
                    {t("verificationCodeLabel")}
                  </Label>
                  <Input
                    autoComplete="one-time-code"
                    className="h-12 rounded-2xl text-center text-lg font-black tracking-[0.16em]"
                    id="auth-code"
                    inputMode="numeric"
                    onChange={(event) => setVerificationCode(event.target.value)}
                    placeholder={t("verificationCodePlaceholder")}
                    required
                    value={verificationCode}
                  />
                </div>
                {error ? (
                  <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-200" role="alert">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                    <p>{error}</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium leading-6 text-text-secondary">
                    {phase === "verify_email" ? t("verificationEmailHelp") : t("verificationSecondFactorHelp")}
                  </p>
                )}
                <Button className="h-12 w-full rounded-2xl text-sm font-bold" disabled={isPending} type="submit">
                  {isEmailPending ? (
                    <>
                      <PendingSpinner />
                      {t("verifyingCode")}
                    </>
                  ) : (
                    <>
                      {t("verifyCode")}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </>
                  )}
                </Button>
              </form>
            )}

            <LegalAgreement isAr={isAr} />

            <p className="mt-5 text-center text-sm font-semibold text-text-secondary">
              {isSignUp ? t("hasAccount") : t("noAccount")}{" "}
              <Link className="text-primary hover:underline" href={isSignUp ? "/sign-in" : "/sign-up"}>
                {isSignUp ? t("signInLink") : t("signUpLink")}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section
        className={`relative hidden min-h-screen overflow-hidden bg-[var(--auth-visual-base)] text-[var(--auth-visual-text)] [--auth-visual-base:#f5f4f0] [--auth-visual-copy:rgba(17,17,17,0.62)] [--auth-visual-logo-bg:rgba(245,244,240,0.75)] [--auth-visual-logo-border:rgba(17,17,17,0.1)] [--auth-visual-text:#111111] dark:[--auth-visual-base:oklch(9.5%_0.014_255)] dark:[--auth-visual-copy:oklch(78%_0.014_255)] dark:[--auth-visual-logo-bg:oklch(14%_0.016_255_/_0.76)] dark:[--auth-visual-logo-border:rgba(255,255,255,0.12)] dark:[--auth-visual-text:oklch(96%_0.008_255)] lg:block ${isAr ? "lg:[grid-column:1] lg:[grid-row:1]" : "lg:[grid-column:2] lg:[grid-row:1]"}`}
      >
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 h-full w-full scale-105 object-cover transition-opacity dark:opacity-45"
          loop
          muted
          playsInline
          src={authVideoUrl}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            height: "68%",
            background:
              "linear-gradient(to top, var(--auth-visual-base) 0%, var(--auth-visual-base) 18%, color-mix(in srgb, var(--auth-visual-base) 86%, transparent) 36%, color-mix(in srgb, var(--auth-visual-base) 50%, transparent) 56%, color-mix(in srgb, var(--auth-visual-base) 15%, transparent) 76%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            height: "28%",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            height: "48%",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            maskImage: "linear-gradient(to top, black 0%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 100%)",
          }}
        />

        <div className="relative z-10 flex min-h-screen flex-col justify-between p-10">
          <AuthBrandLockup className="[&>span]:text-[var(--auth-visual-text)]" />

          <div className="max-w-xl pb-6">
            {t("visualEyebrow") ? (
              <p className="mb-5 max-w-sm text-[10px] font-black uppercase leading-5 tracking-[0.08em] text-[#0b5cff]">
                {t("visualEyebrow")}
              </p>
            ) : null}
            <h2 className="max-w-[14ch] text-5xl font-light leading-none tracking-0 xl:text-6xl rtl:leading-[1.16]">
              {t("visualTitle")}
            </h2>
            <p className="mt-6 max-w-md text-base font-medium leading-8 text-[var(--auth-visual-copy)]">
              {t("visualDescription")}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
