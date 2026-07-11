"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "@convex/_generated/api";
import { useRouter } from "@/i18n/routing";
import { writeAuthHandoff } from "@/domains/auth";
import { acceptOrganizationInvitation } from "@/domains/organization/api";
import { authClient } from "@/lib/auth-client";
import { resolveAuthEntryCallbackUrl } from "../utils/auth-callback-url";
import { completeOrganizationEntry } from "../organization-selection";

export type UserOrganizationInvitation = {
  id: string;
  email?: string;
  role: string;
  status: string;
  organizationId: string;
  organizationName?: string | null;
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

function authErrorText(error: unknown) {
  return authErrorMessage(error, "").toLowerCase();
}

function isEmailVerificationRequiredError(error: unknown) {
  const message = authErrorText(error);
  return (
    message.includes("email verification required") ||
    (message.includes("verify") && message.includes("email"))
  );
}

function isOrganizationsDisabledError(error: unknown) {
  const message = authErrorText(error);
  return (
    message.includes("organization") &&
    (message.includes("disabled") ||
      message.includes("not enabled") ||
      message.includes("plugin"))
  );
}

function isOrganizationSlugsDisabledError(error: unknown) {
  const message = authErrorText(error);
  return (
    message.includes("slug") &&
    (message.includes("disabled") || message.includes("not enabled"))
  );
}

function createOrganizationWithoutSlug(name: string) {
  const create = authClient.organization.create as unknown as (input: {
    name: string;
  }) => ReturnType<typeof authClient.organization.create>;
  return create({ name });
}

export function organizationSlugFromName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function toRouterPath(locale: string, localizedHref: string) {
  const localePrefix = `/${locale}`;
  return localizedHref.startsWith(`${localePrefix}/`)
    ? localizedHref.slice(localePrefix.length)
    : localizedHref;
}

async function listPendingUserInvitations() {
  const response = await fetch("/api/v1/organizations/invitations/mine", {
    credentials: "include",
    headers: { accept: "application/json" },
  });

  if (!response.ok) {
    let message = "Could not load invitations.";
    try {
      const body = (await response.json()) as { message?: string };
      message = body.message ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  const payload = (await response.json()) as
    | { invitations?: UserOrganizationInvitation[] }
    | UserOrganizationInvitation[];
  const invitations = Array.isArray(payload)
    ? payload
    : (payload.invitations ?? []);
  return invitations.filter((invitation) => invitation.status === "pending");
}

export function useOrganizationEntry({
  callbackURL,
  locale,
}: {
  callbackURL?: string | null;
  locale: string;
}) {
  const t = useTranslations("ChooseOrg");
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: organizations, isPending: organizationsPending } =
    authClient.useListOrganizations();
  const seedWorkspaceDefaults = useMutation(
    api.modelization.write.seedWorkspaceDefaults,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [organizationName, setOrganizationNameState] = useState("");
  const [invitations, setInvitations] = useState<UserOrganizationInvitation[]>([]);
  const [busyId, setBusyId] = useState("");
  const [busyAction, setBusyAction] = useState<"create" | "sign-out" | "">("");
  const [error, setError] = useState("");

  const isInitialLoading = sessionPending || organizationsPending;
  const currentOrganizationIds = useMemo(
    () => new Set((organizations ?? []).map((organization) => organization.id)),
    [organizations],
  );
  const visibleInvitations = useMemo(
    () =>
      invitations.filter(
        (invitation) => !currentOrganizationIds.has(invitation.organizationId),
      ),
    [currentOrganizationIds, invitations],
  );
  const organizationSlug = useMemo(
    () => organizationSlugFromName(organizationName),
    [organizationName],
  );
  const resolvedCallbackURL = useMemo(
    () => resolveAuthEntryCallbackUrl(locale, callbackURL, "/ws"),
    [callbackURL, locale],
  );

  useEffect(() => {
    if (!isInitialLoading && !session?.user) {
      router.replace(
        `/sign-in?callbackURL=${encodeURIComponent(resolvedCallbackURL)}`,
      );
    }
  }, [isInitialLoading, session, resolvedCallbackURL, router]);

  useEffect(() => {
    if (isInitialLoading || !session?.user) return;

    let cancelled = false;
    listPendingUserInvitations()
      .then((nextInvitations) => {
        if (!cancelled) setInvitations(nextInvitations);
      })
      .catch((caught) => {
        if (!cancelled) setError(authErrorMessage(caught, t("errorDesc")));
      });

    return () => {
      cancelled = true;
    };
  }, [isInitialLoading, session?.user, t]);

  async function finishOrganizationSelection(
    organizationId: string,
    nextHref = toRouterPath(locale, resolvedCallbackURL),
  ) {
    await completeOrganizationEntry({
      organizationId,
      setActive: authClient.organization.setActive,
      writeHandoff: writeAuthHandoff,
      seedWorkspace: (id) => seedWorkspaceDefaults({ organizationId: id }),
      navigate: (href) => router.replace(href),
      nextHref,
      errorMessage: t("errorDesc"),
    });
  }

  async function selectOrganization(organizationId: string) {
    setBusyId(organizationId);
    setError("");
    try {
      await finishOrganizationSelection(organizationId);
    } catch (caught) {
      setError(authErrorMessage(caught, t("errorDesc")));
    } finally {
      setBusyId("");
    }
  }

  async function acceptInvitation(invitation: UserOrganizationInvitation) {
    setBusyId(`invitation:${invitation.id}`);
    setError("");
    try {
      const accepted = await acceptOrganizationInvitation(invitation.id);
      const organizationId =
        accepted.organizationId ??
        accepted.invitation?.organizationId ??
        accepted.member?.organizationId ??
        invitation.organizationId;

      await finishOrganizationSelection(organizationId);
    } catch (caught) {
      if (isEmailVerificationRequiredError(caught)) {
        const verifyCallbackURL = `/${locale}/choose-org?callbackURL=${encodeURIComponent(resolvedCallbackURL)}`;
        router.push(
          `/verify-email?callbackURL=${encodeURIComponent(verifyCallbackURL)}`,
        );
        return;
      }
      setError(authErrorMessage(caught, t("errorDesc")));
    } finally {
      setBusyId("");
    }
  }

  async function createOrganization() {
    const name = organizationName.trim();
    if (!name) {
      setError(t("nameRequired"));
      return;
    }

    setBusyAction("create");
    setError("");
    try {
      let result = await authClient.organization.create({
        name,
        slug: organizationSlug || `workspace-${Date.now()}`,
      });
      if (result.error && isOrganizationSlugsDisabledError(result.error)) {
        result = await createOrganizationWithoutSlug(name);
      }
      if (result.error) {
        if (isOrganizationsDisabledError(result.error)) {
          throw new Error(t("organizationsDisabled"));
        }
        if (isOrganizationSlugsDisabledError(result.error)) {
          throw new Error(t("slugsDisabled"));
        }
        throw new Error(authErrorMessage(result.error, t("errorDesc")));
      }
      if (!result.data?.id) {
        throw new Error(t("errorDesc"));
      }

      await finishOrganizationSelection(result.data.id, "/onboarding");
      setCreateOpen(false);
    } catch (caught) {
      setError(authErrorMessage(caught, t("errorDesc")));
    } finally {
      setBusyAction("");
    }
  }

  async function useAnotherAccount() {
    setBusyAction("sign-out");
    setError("");
    try {
      await authClient.signOut();
      router.replace("/sign-in");
    } catch (caught) {
      setError(authErrorMessage(caught, t("errorDesc")));
    } finally {
      setBusyAction("");
    }
  }

  function setOrganizationName(value: string) {
    setOrganizationNameState(value);
    setError("");
  }

  return {
    session,
    organizations,
    createOpen,
    setCreateOpen,
    organizationName,
    setOrganizationName,
    busyId,
    busyAction,
    error,
    isInitialLoading,
    visibleInvitations,
    organizationSlug,
    selectOrganization,
    acceptInvitation,
    createOrganization,
    useAnotherAccount,
  };
}
