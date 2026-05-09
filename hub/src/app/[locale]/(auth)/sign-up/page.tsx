"use client";

import { Link } from "@/i18n/routing";
import { UserPlus, ChevronLeft, ShieldCheck, Gavel } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { createLocaleAuthCallbackUrl, useGoogleSignIn } from "@/domains/auth";

export default function SignUpPage() {
  const t = useTranslations("signin");
  const locale = useLocale();
  const googleSignIn = useGoogleSignIn({
    callbackURL: createLocaleAuthCallbackUrl(locale, "/choose-org"),
  });

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-white p-6 dark:bg-[#0A0A0A]">
      {/* Decorative atmospheric background */}
      <div className="absolute top-0 left-1/2 h-[600px] w-full max-w-[1200px] -translate-x-1/2 bg-gradient-to-b from-blue-50/50 to-transparent blur-3xl dark:from-blue-900/10 pointer-events-none" />

      <div className="absolute top-10 left-10 rtl:left-auto rtl:right-10 z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
          {t("backToHome")}
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div className="space-y-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] bg-blue-600 shadow-2xl shadow-blue-500/20 transition-transform hover:scale-105">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white md:text-5xl">
              {t("createAccount")}
            </h1>
            <p className="text-sm font-medium leading-relaxed tracking-tight text-zinc-500">
              {t("createAccountDesc")}
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <button
            onClick={googleSignIn.signIn}
            disabled={googleSignIn.isPending}
            className="group relative flex h-16 w-full items-center justify-center gap-4 overflow-hidden rounded-[32px] bg-zinc-900 text-white transition-all hover:bg-black active:scale-[0.98] disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 shadow-2xl shadow-zinc-900/20 dark:shadow-white/10"
          >
            <div className="flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[11px]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {googleSignIn.isPending ? t("connecting") : t("google")}
            </div>
          </button>

          <p className="text-[10px] font-black uppercase tracking-[0.25em] leading-relaxed text-zinc-400">
            {t("agreementPrefix")}{" "}
            <Link href="/terms" className="text-blue-600 hover:underline underline-offset-4">{t("agreementTerms")}</Link>
            {" "}{t("agreementAnd")}{" "}
            <Link href="/policy" className="text-blue-600 hover:underline underline-offset-4">{t("agreementPrivacy")}</Link>
            {" "}{t("agreementSuffix")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 border-t border-zinc-100 pt-16 dark:border-white/5">
          <div className="flex flex-col items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-zinc-300 transition-colors hover:text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t("encrypted")}</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Gavel className="h-5 w-5 text-zinc-300 transition-colors hover:text-blue-500" />
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{t("clearTerms")}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
