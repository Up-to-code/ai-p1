"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import { authClient } from "@/lib/auth-client";
import { AuthAccountButton } from "./auth-account-button";
import { resolveAuthEntryCallbackUrl } from "../utils/auth-callback-url";

type VerifyEmailClientProps = {
  callbackURL?: string | null;
  locale: string;
};

function authErrorMessage(error: unknown, fallback: string) {
  if (!error) return fallback;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return fallback;
}

function toRouterPath(locale: string, localizedHref: string) {
  const localePrefix = `/${locale}`;
  return localizedHref.startsWith(`${localePrefix}/`)
    ? localizedHref.slice(localePrefix.length)
    : localizedHref;
}

async function sendEmailVerificationCode(email: string) {
  const emailOtpClient = (authClient as any).emailOtp;
  const sendVerificationOtp =
    emailOtpClient?.sendVerificationOtp ?? emailOtpClient?.sendVerificationOTP;
  const result = sendVerificationOtp
    ? await sendVerificationOtp({ email, type: "email-verification" })
    : await (authClient as any).$fetch("/email-otp/send-verification-otp", {
        method: "POST",
        body: { email, type: "email-verification" },
      });

  if (result?.error) throw result.error;
}

async function verifyEmailCode(email: string, otp: string) {
  const emailOtpClient = (authClient as any).emailOtp;
  const verifyEmail =
    emailOtpClient?.verifyEmail ?? emailOtpClient?.verifyEmailOTP;
  const result = verifyEmail
    ? await verifyEmail({ email, otp })
    : await (authClient as any).$fetch("/email-otp/verify-email", {
        method: "POST",
        body: { email, otp },
      });

  if (result?.error) throw result.error;
}

export function VerifyEmailClient({
  callbackURL,
  locale,
}: VerifyEmailClientProps) {
  const t = useTranslations("VerifyEmail");
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "verifying" | "verified"
  >("idle");
  const [error, setError] = useState("");
  const sentInitialCode = useRef(false);
  const user = session?.user as
    | { email?: string; emailVerified?: boolean }
    | undefined;
  const email = user?.email ?? "";
  const resolvedCallbackURL = useMemo(
    () => resolveAuthEntryCallbackUrl(locale, callbackURL, "/choose-org"),
    [callbackURL, locale],
  );

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.replace(
        `/sign-in?callbackURL=${encodeURIComponent(`/${locale}/verify-email?callbackURL=${encodeURIComponent(resolvedCallbackURL)}`)}`,
      );
      return;
    }
    if (user?.emailVerified) {
      router.replace(toRouterPath(locale, resolvedCallbackURL));
    }
  }, [
    email,
    isPending,
    locale,
    resolvedCallbackURL,
    router,
    session?.user,
    user?.emailVerified,
  ]);

  useEffect(() => {
    if (isPending || !email || user?.emailVerified || sentInitialCode.current)
      return;
    sentInitialCode.current = true;
    void sendCode();
    // sendCode is intentionally not a dependency; this effect only starts the first send.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, isPending, user?.emailVerified]);

  async function sendCode() {
    if (!email) return;
    setStatus("sending");
    setError("");
    try {
      await sendEmailVerificationCode(email);
      setStatus("sent");
    } catch (caught) {
      setStatus("idle");
      setError(authErrorMessage(caught, t("sendError")));
    }
  }

  async function submitCode() {
    const otp = code.trim();
    if (!otp) {
      setError(t("codeRequired"));
      return;
    }

    setStatus("verifying");
    setError("");
    try {
      await verifyEmailCode(email, otp);
      setStatus("verified");
      router.replace(toRouterPath(locale, resolvedCallbackURL));
    } catch (caught) {
      setStatus("sent");
      setError(authErrorMessage(caught, t("verifyError")));
    }
  }

  const isBusy = isPending || status === "sending" || status === "verifying";

  return (
    <main className="min-h-svh bg-muted/30 text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-3xl flex-col px-5 py-5 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark className="h-6 w-6" priority />
            <span className="text-base font-black tracking-tight">qentrah</span>
          </Link>
          <AuthAccountButton
            label={t("useAnotherAccount")}
            onClick={() =>
              void authClient.signOut().then(() => router.replace("/sign-in"))
            }
            user={user}
          />
        </header>

        <section className="flex flex-1 items-center py-10">
          <div className="w-full rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-start gap-4 border-b border-border pb-6">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {status === "verified" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <MailCheck className="h-5 w-5" />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-muted-foreground">
                  {t("eyebrow")}
                </p>
                <h1 className="mt-2 text-2xl font-black tracking-0 text-foreground sm:text-3xl">
                  {t("title")}
                </h1>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  {t("subtitle", { email })}
                </p>
              </div>
            </div>

            {error ? (
              <div className="mt-5 flex items-start gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-semibold leading-6 text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              <label htmlFor="verification-code" className="text-sm font-black">
                {t("codeLabel")}
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  className="h-11 rounded-lg"
                  disabled={isBusy}
                  id="verification-code"
                  inputMode="numeric"
                  onChange={(event) => {
                    setCode(event.target.value);
                    setError("");
                  }}
                  placeholder={t("codePlaceholder")}
                  value={code}
                />
                <Button
                  className="h-11 rounded-lg sm:w-auto"
                  disabled={isBusy}
                  onClick={() => void submitCode()}
                  type="button"
                >
                  {status === "verifying" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {status === "verifying" ? t("verifying") : t("verifyButton")}
                </Button>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-muted-foreground">
                  {status === "sending" ? t("sending") : t("sentHelp")}
                </p>
                <Button
                  className="h-9 rounded-lg px-0 text-muted-foreground"
                  disabled={isBusy}
                  onClick={() => void sendCode()}
                  type="button"
                  variant="link"
                >
                  {t("resendButton")}
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
