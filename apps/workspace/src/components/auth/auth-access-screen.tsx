"use client";

import { ArrowRight, ChevronLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { BrandMark } from "@/components/logo";
import { Link } from "@/i18n/routing";

type AuthAccessScreenProps = {
  mode: "sign-in" | "sign-up";
  isPending: boolean;
  onGoogleSignIn: () => void;
};

const authVideoUrl = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/agentic-hero-9yW3wnTNMfn2U6lsVhTTZSJFEvAoSj.mp4";

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

export function AuthAccessScreen({ mode, isPending, onGoogleSignIn }: AuthAccessScreenProps) {
  const t = useTranslations("signin");
  const locale = useLocale();
  const isAr = locale === "ar";
  const isSignUp = mode === "sign-up";
  const brandLabel = isAr ? "كانترا" : "qentrah";
  const googleLabel = isAr ? (
    <span dir="rtl">
      الدخول عبر <bdi dir="ltr">Google</bdi>
    </span>
  ) : (
    t("google")
  );

  return (
    <main className="min-h-svh overflow-x-hidden bg-[oklch(97.5%_0.006_255)] text-foreground dark:bg-[oklch(8.5%_0.012_255)] lg:grid lg:min-h-screen lg:grid-cols-2">
      <section className={`flex min-h-svh flex-col px-4 py-5 sm:px-8 lg:min-h-screen lg:px-12 lg:py-8 ${isAr ? "lg:[grid-column:2]" : "lg:[grid-column:1]"}`}>
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface text-foreground transition group-hover:bg-muted">
              <BrandMark className="h-5.5 w-5.5" priority />
            </span>
            <span className="text-lg font-black tracking-tight text-foreground">
              {brandLabel}
            </span>
          </Link>
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
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
                <BrandMark className="h-6 w-6" priority />
              </span>
              <span className="text-2xl font-black tracking-tight text-foreground">
                {brandLabel}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-[32px] font-semibold leading-tight tracking-0 text-foreground sm:text-4xl rtl:leading-[1.25]">
                {isSignUp ? t("createAccount") : t("title")}
              </h1>
              <p className="max-w-sm text-sm font-medium leading-6 text-text-secondary">
                {isSignUp ? t("createAccountDesc") : t("description")}
              </p>
            </div>

            <button
              className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[oklch(13%_0.024_255)] px-5 text-sm font-bold text-[oklch(98%_0.006_255)] transition hover:bg-[oklch(20%_0.03_255)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99] disabled:pointer-events-none disabled:opacity-55 dark:bg-[oklch(96%_0.006_255)] dark:text-[oklch(13%_0.024_255)] dark:hover:bg-[oklch(90%_0.008_255)]"
              disabled={isPending}
              onClick={onGoogleSignIn}
              type="button"
            >
              <GoogleMark />
              <span className="min-w-0 truncate">{isPending ? t("connecting") : googleLabel}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>

            <LegalAgreement isAr={isAr} />
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
          <Link href="/" className="group flex w-fit items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-[var(--auth-visual-logo-border)] bg-[var(--auth-visual-logo-bg)] text-[var(--auth-visual-text)] backdrop-blur-xl transition group-hover:bg-[var(--auth-visual-base)]">
              <BrandMark className="h-5.5 w-5.5" priority />
            </span>
            <span className="text-base font-black tracking-tight">
              {brandLabel}
            </span>
          </Link>

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
