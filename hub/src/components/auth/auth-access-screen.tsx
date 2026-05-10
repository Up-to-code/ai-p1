"use client";

import Image from "next/image";
import { ArrowRight, ChevronLeft, Gavel, LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/routing";
import { AuroraShaders } from "@/components/ui/aurora";
import { cn } from "@/lib/utils";

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
  const Icon = isSignUp ? UserPlus : LogIn;

  const panelTitle = isAr
    ? "مساحة عمل واحدة للمشاريع والمخزون والعملاء."
    : "One workspace for projects, inventory, and clients.";
  const panelDescription = isAr
    ? "ادخل إلى طبقة تشغيل موثوقة تجمع الفريق والبيانات وسير العمل في مكان واحد."
    : "Enter the trusted operating layer where teams, data, and daily work stay aligned.";
  const signals = isAr
    ? ["مخزون موثق", "فرق متزامنة", "وصول آمن"]
    : ["Verified inventory", "Aligned teams", "Secure access"];

  return (
    <main className="relative min-h-dvh overflow-hidden bg-background px-4 py-5 text-foreground sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <AuroraShaders
          speed={0.42}
          intensity={1.45}
          vibrancy={1.18}
          frequency={0.78}
          stretch={1.6}
          className="absolute left-1/2 top-[-18%] h-[78vh] min-h-[560px] w-[138vw] -translate-x-1/2 opacity-60 [mask-image:linear-gradient(to_bottom,black_0%,black_62%,transparent_100%)] dark:opacity-80"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(247,249,252,0.18),var(--color-background)_82%)] dark:bg-[linear-gradient(to_bottom,rgba(10,10,10,0.12),var(--color-background)_84%)]" />
        <div className="absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.22),transparent_66%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(11,92,255,0.34),transparent_68%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(11,92,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(11,92,255,0.05)_1px,transparent_1px)] bg-[size:80px_80px] opacity-35 [mask-image:radial-gradient(ellipse_at_top,black,transparent_82%)] dark:opacity-20" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100dvh-2.5rem)] max-w-7xl grid-cols-1 items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
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

        <section className="hidden max-w-2xl pt-28 text-start lg:block">
          <p className="mb-5 text-[10px] font-black uppercase tracking-[0.34em] text-blue-600 dark:text-blue-300">
            {isAr ? "دخول موثوق" : "Trusted access"}
          </p>
          <h1 className={cn(
            "text-6xl font-bold text-zinc-950 dark:text-white",
            isAr ? "leading-[1.16]" : "leading-[0.95] tracking-tight",
          )}>
            {panelTitle}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-300">
            {panelDescription}
          </p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {signals.map((signal) => (
              <div className="rounded-2xl border border-zinc-200/70 bg-white/45 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]" key={signal}>
                <div className="mb-5 h-1.5 w-8 rounded-full bg-blue-500" />
                <p className="text-sm font-bold text-zinc-800 dark:text-white">{signal}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-md pt-28 lg:ms-auto lg:me-0">
          <div className="rounded-[2rem] border border-zinc-200/70 bg-white/72 p-6 backdrop-blur-3xl dark:border-white/10 dark:bg-zinc-950/58 sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
                <Icon className="h-5 w-5" />
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-500/15 dark:text-blue-200">
                {isAr ? "مساحة العمل" : "Workspace"}
              </span>
            </div>

            <div className="space-y-3 text-start">
              <h2 className={cn(
                "text-4xl font-bold text-zinc-950 dark:text-white",
                isAr ? "leading-[1.18]" : "leading-[0.98] tracking-tight",
              )}>
                {isSignUp ? t("createAccount") : t("title")}
              </h2>
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

            <p className="mt-6 text-start text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              {t("agreementPrefix")}{" "}
              <Link href="/terms" className="font-bold text-zinc-950 underline-offset-4 hover:underline dark:text-white">{t("agreementTerms")}</Link>
              {" "}{t("agreementAnd")}{" "}
              <Link href="/privacy" className="font-bold text-zinc-950 underline-offset-4 hover:underline dark:text-white">{t("agreementPrivacy")}</Link>
              {" "}{t("agreementSuffix")}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3 border-t border-zinc-200/70 pt-6 dark:border-white/10">
              <div className="flex items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-3 dark:bg-white/[0.04]">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">{t("encrypted")}</span>
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-zinc-50 px-3 py-3 dark:bg-white/[0.04]">
                <Gavel className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                <span className="text-[10px] font-black uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">{t("clearTerms")}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
