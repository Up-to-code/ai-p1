"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, LogIn, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { requireOrganizationResult, type AuthResult } from "@/domains/auth/organization-selection";
import { writeAuthHandoff } from "@/domains/auth";
import { acceptOrganizationInvitation, acceptOrganizationInviteLink } from "../api/better-auth-organization";
import type { OrganizationInvitationAcceptance, OrganizationInviteLink } from "../api/better-auth-organization";

type BetterAuthOrganization = { id?: string | null };
type AcceptInviteAuthClient = typeof authClient & {
  organization: {
    setActive: (input: { organizationId: string }) => Promise<AuthResult<BetterAuthOrganization | null>>;
  };
};

const organizationApi = authClient as AcceptInviteAuthClient;

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
  const session = authClient.useSession();
  const invitationId = searchParams.get("invitationId");
  const inviteToken = searchParams.get("inviteToken");
  const [status, setStatus] = useState<"idle" | "accepting" | "accepted" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const hasStartedAccepting = useRef(false);

  useEffect(() => {
    if ((!invitationId && !inviteToken) || session.isPending || !session.data?.user || hasStartedAccepting.current) return;

    let cancelled = false;
    hasStartedAccepting.current = true;
    const accept = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setStatus("accepting");

      const operation = inviteToken
        ? acceptOrganizationInviteLink(inviteToken)
        : acceptOrganizationInvitation(invitationId as string);

      operation.then(async (result) => {
        if (cancelled) return;
        const organizationId = getAcceptedOrganizationId(result);

        if (organizationId) {
          requireOrganizationResult(
            await organizationApi.organization.setActive({ organizationId }),
            t("errorDesc"),
            organizationId,
          );
          writeAuthHandoff(organizationId);
        }

        if (cancelled) return;
        setStatus("accepted");
        setTimeout(() => window.location.replace(`/${locale}/dashboard`), 1000);
      }).catch((caught) => {
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
  }, [invitationId, inviteToken, locale, session.data?.user, session.isPending, t]);

  const isSignedOut = !session.isPending && !session.data?.user;
  const isMissingInvite = !invitationId && !inviteToken;
  const currentInvitePath = `/${locale}/accept-invite?${inviteToken ? `inviteToken=${encodeURIComponent(inviteToken)}` : `invitationId=${encodeURIComponent(invitationId ?? "")}`}`;

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-6 py-12 dark:bg-[#0A0A0A]">
      <section className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-8 text-center dark:border-white/10 dark:bg-[#111]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-white/5 dark:text-zinc-300">
          {status === "accepted" ? (
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          ) : status === "error" || isMissingInvite ? (
            <TriangleAlert className="h-6 w-6 text-red-500" />
          ) : (
            <Loader2 className="h-6 w-6 animate-spin" />
          )}
        </div>
        <h1 className="mt-6 text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
          {isMissingInvite ? t("missingTitle") : isSignedOut ? t("signInTitle") : status === "accepted" ? t("acceptedTitle") : status === "error" ? t("errorTitle") : t("loadingTitle")}
        </h1>
        <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {isMissingInvite ? t("missingDesc") : isSignedOut ? t("signInDesc") : status === "accepted" ? t("acceptedDesc") : status === "error" ? error : t("loadingDesc")}
        </p>
        {isSignedOut && (
          <Button
            className="mt-6 h-11 rounded-2xl bg-zinc-900 px-6 text-white hover:bg-black"
            onClick={() => router.push(`/${locale}/sign-in?callbackURL=${encodeURIComponent(currentInvitePath)}`)}
          >
            <LogIn className="me-2 h-4 w-4" />
            {t("signInButton")}
          </Button>
        )}
        {(status === "error" || isMissingInvite) && (
          <Button variant="outline" className="mt-6 h-11 rounded-2xl" onClick={() => router.push(`/${locale}/dashboard`)}>
            {t("dashboardButton")}
          </Button>
        )}
      </section>
    </main>
  );
}
