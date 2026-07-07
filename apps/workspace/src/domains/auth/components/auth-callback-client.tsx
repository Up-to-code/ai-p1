"use client";

import { useEffect } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/logo";
import { useAuthFlow } from "../hooks/use-auth-flow";

type AuthCallbackClientProps = {
  callbackURL?: string | null;
  locale: string;
};

export function AuthCallbackClient({ callbackURL, locale }: AuthCallbackClientProps) {
  const t = useTranslations("Auth.callback");
  const auth = useAuthFlow({ callbackURL, locale, mode: "sign-in" });
  const { finalizeCallback } = auth;

  useEffect(() => {
    void finalizeCallback();
  }, [finalizeCallback]);

  return (
    <main className="flex min-h-svh items-center justify-center overflow-hidden bg-[oklch(97.5%_0.006_255)] px-4 text-foreground dark:bg-[oklch(8.5%_0.012_255)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,oklch(91%_0.03_255)_0%,transparent_34%),linear-gradient(180deg,transparent,oklch(94%_0.01_255))] dark:bg-[radial-gradient(circle_at_50%_42%,oklch(22%_0.04_255)_0%,transparent_34%),linear-gradient(180deg,transparent,oklch(8.5%_0.012_255))]" />
      <div className="relative w-full max-w-sm rounded-[24px] border border-[oklch(88%_0.014_255)] bg-[oklch(99%_0.004_255)] p-5 dark:border-white/10 dark:bg-[oklch(13%_0.016_255)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-surface">
              <BrandMark className="h-5 w-5" priority />
            </span>
            <div>
              <p className="text-sm font-black">qentrah</p>
              <p className="mt-0.5 text-xs font-semibold text-text-secondary">
                {t("title")}
              </p>
            </div>
          </div>
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        </div>

        <div className="mt-6 space-y-3">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
          </div>
          <div className="space-y-2 rounded-2xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div className="h-3 w-36 animate-pulse rounded-full bg-muted" />
            </div>
            <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded-full bg-muted" />
          </div>
        </div>

        <p className="mt-5 text-center text-xs font-semibold leading-5 text-text-secondary">
          {t("preparing")}
        </p>
      </div>
    </main>
  );
}
