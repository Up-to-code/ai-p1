"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, LogIn, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { writeAuthHandoff } from "@/domains/auth";
import {
  acceptOrganizationInvitation,
  acceptOrganizationInviteLink,
} from "../api";
import type {
  OrganizationInvitationAcceptance,
  OrganizationInviteLink,
} from "../api";

function getAcceptedOrganizationId(
  result: OrganizationInviteLink | OrganizationInvitationAcceptance,
) {
  return (
    ("organizationId" in result ? result.organizationId : undefined) ??
    ("invitation" in result ? result.invitation?.organizationId : undefined) ??
    ("member" in result ? result.member?.organizationId : undefined)
  );
}

function validInviteParam(value: string | null) {
  if (!value || value === "undefined" || value === "null") return null;
  return value;
}

export function AcceptInviteScreen() {
  const t = useTranslations("Organization.acceptInvite");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: authPending } = authClient.useSession();
  const invitationId = validInviteParam(searchParams.get("invitationId"));
  const inviteToken = validInviteParam(searchParams.get("inviteToken"));
  const [status, setStatus] = useState<
    "idle" | "accepting" | "accepted" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const hasStartedAccepting = useRef(false);
  const [stabilized, setStabilized] = useState(false);
  const isLoading = authPending;

  useEffect(() => {
    if (isLoading) {
      setStabilized(false);
      return;
    }
    const timer = setTimeout(() => setStabilized(true), 800);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (
      (!invitationId && !inviteToken) ||
      isLoading ||
      !stabilized ||
      !session?.user ||
      hasStartedAccepting.current
    )
      return;

    let cancelled = false;
    hasStartedAccepting.current = true;
    const accept = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setStatus("accepting");

      const operation = inviteToken
        ? acceptOrganizationInviteLink(inviteToken)
        : acceptOrganizationInvitation(invitationId as string);

      operation
        .then(async (result) => {
          if (cancelled) return;
          const organizationId = getAcceptedOrganizationId(result);

          if (organizationId) {
            try {
              await authClient.organization.setActive({ organizationId });
            } catch (setActiveError) {
              console.warn(
                "[accept-invite] setActive failed, falling back to hard reload:",
                setActiveError,
              );
            }
            writeAuthHandoff(organizationId);
          }

          if (cancelled) return;
          setStatus("accepted");
          setTimeout(() => window.location.replace(`/${locale}/ws`), 1000);
        })
        .catch((caught) => {
          if (cancelled) return;
          hasStartedAccepting.current = false;
          setStatus("error");
          setError(caught instanceof Error ? caught.message : t("errorDesc"));
        });
    };

    accept();

    return () => {
      cancelled = true;
    };
  }, [invitationId, inviteToken, locale, session, isLoading, stabilized, t]);

  const isSignedOut = stabilized && !session?.user;
  const isMissingInvite = !invitationId && !inviteToken;
  const currentInvitePath = `/${locale}/accept-invite?${inviteToken ? `inviteToken=${encodeURIComponent(inviteToken)}` : `invitationId=${encodeURIComponent(invitationId ?? "")}`}`;

  return (
    <main className="min-h-screen bg-background px-5 py-6 text-foreground sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center gap-2 border-b border-border pb-5">
          <span className="text-sm font-semibold tracking-tight">qentrah</span>
        </header>
        <section className="flex flex-1 items-start justify-center py-16">
          <div className="w-full max-w-md border-y border-border bg-surface p-8 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center border border-border bg-background text-muted-foreground">
              {status === "accepted" ? (
                <CheckCircle2 className="h-6 w-6 text-primary" />
              ) : status === "error" || isMissingInvite ? (
                <TriangleAlert className="h-6 w-6 text-destructive" />
              ) : (
                <Loader2 className="h-6 w-6 animate-spin" />
              )}
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-foreground">
              {isMissingInvite
                ? t("missingTitle")
                : !stabilized
                  ? t("loadingTitle")
                  : isSignedOut
                    ? t("signInTitle")
                    : status === "accepted"
                      ? t("acceptedTitle")
                      : status === "error"
                        ? t("errorTitle")
                        : t("loadingTitle")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {isMissingInvite
                ? t("missingDesc")
                : !stabilized
                  ? t("loadingDesc")
                  : isSignedOut
                    ? t("signInDesc")
                    : status === "accepted"
                      ? t("acceptedDesc")
                      : status === "error"
                        ? error
                        : t("loadingDesc")}
            </p>
            {isSignedOut && (
              <Button
                className="mt-6 h-9 rounded-md px-4 text-xs"
                onClick={() =>
                  router.push(
                    `/${locale}/sign-in?callbackURL=${encodeURIComponent(currentInvitePath)}`,
                  )
                }
              >
                <LogIn className="me-2 h-4 w-4" />
                {t("signInButton")}
              </Button>
            )}
            {(status === "error" || isMissingInvite) && (
              <Button
                variant="outline"
                className="mt-6 h-9 rounded-md px-4 text-xs"
                onClick={() => router.push(`/${locale}/ws`)}
              >
                {t("dashboardButton")}
              </Button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
