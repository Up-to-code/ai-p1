"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, LogIn, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { writeAuthHandoff } from "@/domains/auth";
import { acceptOrganizationInvitation, acceptOrganizationInviteLink } from "../api/clerk-organization-api";
import type { OrganizationInvitationAcceptance, OrganizationInviteLink } from "../api/clerk-organization-api";

function getAcceptedOrganizationId(result: OrganizationInviteLink | OrganizationInvitationAcceptance) {
  return (
    ("organizationId" in result ? result.organizationId : undefined) ??
    ("invitation" in result ? result.invitation?.organizationId : undefined) ??
    ("member" in result ? result.member?.organizationId : undefined)
  );
}

export function AcceptInviteScreen() {
  const t = useTranslations("Organization.acceptInvite");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  const clerk = useClerk();
  const invitationId = searchParams.get("invitationId");
  const inviteToken = searchParams.get("inviteToken");
  const [status, setStatus] = useState<"idle" | "accepting" | "accepted" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const hasStartedAccepting = useRef(false);
  const [stabilized, setStabilized] = useState(false);
  const isLoading = !authLoaded || !userLoaded;

  useEffect(() => {
    if (isLoading) {
      setStabilized(false);
      return;
    }
    const timer = setTimeout(() => setStabilized(true), 800);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if ((!invitationId && !inviteToken) || isLoading || !stabilized || !isSignedIn || !user || hasStartedAccepting.current) return;

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
              await clerk.setActive({ organization: organizationId });
            } catch (setActiveError) {
              console.warn("[accept-invite] setActive failed, falling back to hard reload:", setActiveError);
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
  }, [invitationId, inviteToken, locale, isSignedIn, user, isLoading, stabilized, clerk, t]);

  const isSignedOut = stabilized && !isSignedIn;
  const isMissingInvite = !invitationId && !inviteToken;
  const currentInvitePath = `/${locale}/accept-invite?${inviteToken ? `inviteToken=${encodeURIComponent(inviteToken)}` : `invitationId=${encodeURIComponent(invitationId ?? "")}`}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted px-6 py-12">
      <section className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          {status === "accepted" ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : status === "error" || isMissingInvite ? (
            <TriangleAlert className="h-6 w-6 text-red-500" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin" />
          )}
        </div>
        <h1 className="mt-6 text-2xl font-black uppercase tracking-tight text-foreground">
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
            className="mt-6 h-11 rounded-2xl bg-primary px-6 text-primary-foreground hover:bg-primary/90"
            onClick={() => router.push(`/${locale}/sign-in?callbackURL=${encodeURIComponent(currentInvitePath)}`)}
          >
            <LogIn className="me-2 h-4 w-4" />
            {t("signInButton")}
          </Button>
        )}
        {(status === "error" || isMissingInvite) && (
          <Button
            variant="outline"
            className="mt-6 h-11 rounded-2xl"
            onClick={() => router.push(`/${locale}/ws`)}
          >
            {t("dashboardButton")}
          </Button>
        )}
      </section>
    </main>
  );
}
