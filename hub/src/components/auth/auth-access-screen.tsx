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
    <main className="min-h-dvh overflow-hidden bg-white px-4 py-5 text-zinc-950 dark:bg-zinc-950 dark:text-white sm:px-6">
      <div className="relative mx-auto flex min-h-[calc(100dvh-2.5rem)] max-w-7xl items-center justify-center">
        <div className="absolute inset-x-0 top-0 flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-zinc-950 dark:bg-white">
              <Image src="/brand-logo.svg" alt="Anan" width={22} height={22} className="h-5.5 w-5.5 invert dark:invert-0" priority />
            </span>
            <span className="text-lg font-black tracking-tight text-zinc-950 dark:text-white">
              {isAr ? "عنان" : "anan"}
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-white/55 px-4 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500 backdrop-blur-xl transition hover:text-zinc-950 dark:bg-white/10 dark:text-zinc-300 dark:hover:text-white"
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
            {t("backToHome")}
          </Link>
        </div>

        <section className="w-full max-w-sm pt-24">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-zinc-950 dark:bg-white">
              <Image src="/brand-logo.svg" alt="Anan" width={24} height={24} className="h-6 w-6 invert dark:invert-0" priority />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {isSignUp ? t("createAccount") : t("title")}
              </h1>
              <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                {isSignUp ? t("createAccountDesc") : t("description")}
              </p>
            </div>

            <button
              className="mt-8 flex h-13 w-full items-center justify-center gap-3 rounded-full bg-zinc-950 px-5 text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-zinc-800 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-55 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              disabled={isPending}
              onClick={onGoogleSignIn}
              type="button"
            >
              <GoogleMark />
              <span>{isPending ? t("connecting") : t("google")}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
