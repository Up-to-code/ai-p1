"use client";

import Image from "next/image";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";

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

  return (
    <main className="auth-viewport relative overflow-hidden bg-white px-4 py-5 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(11,92,255,0.18),transparent_34%),radial-gradient(circle_at_82%_84%,rgba(34,197,94,0.13),transparent_30%),linear-gradient(180deg,#fff,rgba(247,249,252,0.94))] dark:bg-[radial-gradient(circle_at_28%_18%,rgba(11,92,255,0.22),transparent_34%),radial-gradient(circle_at_82%_84%,rgba(34,197,94,0.12),transparent_30%),linear-gradient(180deg,#09090b,rgba(9,9,11,0.96))]" />
      <div className="auth-viewport-frame relative mx-auto flex max-w-7xl flex-col">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-zinc-950 text-white transition group-hover:scale-[1.03] dark:bg-white dark:text-zinc-950">
              <Image src="/brand-logo.svg" alt="Anan" width={22} height={22} className="h-5.5 w-5.5 invert dark:invert-0" priority />
            </span>
            <span className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">
              {isAr ? "عنان" : "anan"}
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl transition hover:border-blue-200 hover:text-zinc-950 dark:border-white/10 dark:bg-white/[0.07] dark:text-zinc-300 dark:shadow-none dark:hover:border-blue-400/30 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {t("backToHome")}
          </Link>
        </div>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-12">
          <div className="w-full max-w-[470px]">
            <div className="rounded-[32px] bg-white/86 p-8 text-start shadow-[0_24px_70px_rgba(11,92,255,0.12),0_10px_35px_rgba(15,23,42,0.08)] ring-1 ring-white/80 backdrop-blur-2xl dark:bg-zinc-900/82 dark:shadow-[0_24px_70px_rgba(11,92,255,0.12)] dark:ring-white/10 sm:p-9">
              <div className="mb-9 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[18px] bg-zinc-950 shadow-[0_10px_25px_rgba(11,92,255,0.18)] dark:bg-white">
                  <Image src="/brand-logo.svg" alt="Anan" width={24} height={24} className="h-6 w-6 invert dark:invert-0" priority />
                </span>
                <span className="text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                  {isAr ? "عنان" : "anan"}
                </span>
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                  {isSignUp ? t("createAccount") : t("title")}
                </h1>
                <p className="text-base text-zinc-500 dark:text-zinc-400">
                  {isSignUp ? t("createAccountDesc") : t("description")}
                </p>
              </div>

              <button
                className="mt-7 flex h-12 w-full items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-white/90 px-5 text-sm font-semibold text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition hover:border-blue-200 hover:bg-blue-50/50 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-55 dark:border-white/10 dark:bg-zinc-950/80 dark:text-white dark:hover:border-blue-400/30 dark:hover:bg-zinc-900"
                disabled={isPending}
                onClick={onGoogleSignIn}
                type="button"
              >
                <GoogleMark />
                <span>{isPending ? t("connecting") : t("google")}</span>
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>

            <p className="mt-5 text-center text-sm text-zinc-700 dark:text-zinc-300">
              {t("agreementPrefix")}{" "}
              <Link href="/terms" className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">
                {t("agreementTerms")}
              </Link>{" "}
              {t("agreementAnd")}{" "}
              <Link href="/privacy" className="text-blue-600 underline-offset-2 hover:underline dark:text-blue-400">
                {t("agreementPrivacy")}
              </Link>
              {t("agreementSuffix")}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
