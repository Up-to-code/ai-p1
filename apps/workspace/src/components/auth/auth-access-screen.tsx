"use client";

import { ArrowRight, ChevronLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { BrandMark } from "@/components/logo";

type AuthAccessScreenProps = {
  mode: "sign-in" | "sign-up";
  isPending: boolean;
  onGoogleSignIn: () => void;
};

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

export function AuthAccessScreen({ mode, isPending, onGoogleSignIn }: AuthAccessScreenProps) {
  const t = useTranslations("signin");
  const locale = useLocale();
  const isAr = locale === "ar";
  const isSignUp = mode === "sign-up";
  const googleLabel = isAr ? (
    <span dir="rtl">
      الدخول عبر <bdi dir="ltr">Google</bdi>
    </span>
  ) : (
    t("google")
  );

  return (
    <main className="auth-viewport bg-background px-4 py-5 text-foreground sm:px-6">
      <div className="auth-viewport-frame mx-auto flex max-w-7xl flex-col">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface text-foreground transition group-hover:bg-muted">
              <BrandMark className="h-5.5 w-5.5" priority />
            </span>
            <span className="text-lg font-black tracking-tight text-foreground">
              {isAr ? "كانترا" : "qentrah"}
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[10px] font-black uppercase tracking-[0.12em] text-text-secondary transition hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {t("backToHome")}
          </Link>
        </div>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <div className="w-full max-w-[430px]">
            <div className="text-start">
              <div className="mb-7 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background">
                  <BrandMark className="h-5.5 w-5.5" priority />
                </span>
                <span className="text-2xl font-black tracking-tight text-foreground">
                  {isAr ? "كانترا" : "qentrah"}
                </span>
              </div>

              <div className="space-y-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {isSignUp ? t("createAccount") : t("title")}
                </h1>
                <p className="text-sm leading-6 text-text-secondary">
                  {isSignUp ? t("createAccountDesc") : t("description")}
                </p>
              </div>

              <button
                className="mt-7 flex h-11 w-full items-center justify-center gap-3 rounded-2xl bg-zinc-950 px-5 text-sm font-bold text-white transition hover:bg-zinc-800 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-55 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                disabled={isPending}
                onClick={onGoogleSignIn}
                type="button"
              >
                <GoogleMark />
                <span>{isPending ? t("connecting") : googleLabel}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>

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
          </div>
        </section>
      </div>
    </main>
  );
}
