"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
  MailCheck,
  Plus,
} from "lucide-react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "@convex/_generated/api";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link, useRouter } from "@/i18n/routing";
import { writeAuthHandoff } from "@/domains/auth";
import { acceptOrganizationInvitation } from "@/domains/organization/api";
import { authClient } from "@/lib/auth-client";
import { AuthAccountButton } from "./auth-account-button";
import { resolveAuthEntryCallbackUrl } from "../utils/auth-callback-url";

type ChooseOrganizationClientProps = {
  callbackURL?: string | null;
  locale: string;
};

type UserInvitation = {
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function WorkspaceListSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          className="min-h-20 rounded-lg border border-border bg-card p-4"
          key={item}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
              <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
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
    | { invitations?: UserInvitation[] }
    | UserInvitation[];
  const invitations = Array.isArray(payload)
    ? payload
    : (payload.invitations ?? []);
  return invitations.filter((invitation) => invitation.status === "pending");
}

export function ChooseOrganizationClient({
  callbackURL,
  locale,
}: ChooseOrganizationClientProps) {
  const t = useTranslations("ChooseOrg");
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: orgs, isPending: orgsPending } =
    authClient.useListOrganizations();
  const seedWorkspaceDefaults = useMutation(
    api.modelization.write.seedWorkspaceDefaults,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [organizationName, setOrganizationName] = useState("");
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [invitationsPending, setInvitationsPending] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [busyAction, setBusyAction] = useState<"create" | "sign-out" | "">("");
  const [error, setError] = useState("");

  const isInitialLoading = sessionPending || orgsPending;
  const hasOrganizations = Boolean(orgs?.length);
  const currentOrganizationIds = useMemo(
    () => new Set((orgs ?? []).map((org) => org.id)),
    [orgs],
  );
  const visibleInvitations = useMemo(
    () =>
      invitations.filter(
        (invitation) => !currentOrganizationIds.has(invitation.organizationId),
      ),
    [currentOrganizationIds, invitations],
  );
  const hasInvitations = visibleInvitations.length > 0;
  const organizationSlug = useMemo(
    () => slugify(organizationName),
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
    setInvitationsPending(true);

    listPendingUserInvitations()
      .then((nextInvitations) => {
        if (!cancelled) setInvitations(nextInvitations);
      })
      .catch((caught) => {
        if (!cancelled) setError(authErrorMessage(caught, t("errorDesc")));
      })
      .finally(() => {
        if (!cancelled) setInvitationsPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isInitialLoading, session?.user, t]);

  async function finishOrganizationSelection(organizationId: string) {
    const result = await authClient.organization.setActive({ organizationId });
    if (result.error) {
      throw new Error(authErrorMessage(result.error, t("errorDesc")));
    }
    writeAuthHandoff(organizationId);
    await seedWorkspaceDefaults({ organizationId });
    router.replace(toRouterPath(locale, resolvedCallbackURL));
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

  async function acceptInvitation(invitation: UserInvitation) {
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
      if (result.data?.id) {
        const activeResult = await authClient.organization.setActive({
          organizationId: result.data.id,
        });
        if (activeResult.error) {
          throw new Error(authErrorMessage(activeResult.error, t("errorDesc")));
        }
        writeAuthHandoff(result.data.id);
        await seedWorkspaceDefaults({ organizationId: result.data.id });
        setCreateOpen(false);
        router.replace("/onboarding");
        return;
      }
      throw new Error(t("errorDesc"));
    } catch (caught) {
      setError(authErrorMessage(caught, t("errorDesc")));
    } finally {
      setBusyAction("");
    }
  }

  async function handleUseAnotherAccount() {
    setBusyAction("sign-out");
    setError("");
    try {
      await authClient.signOut();
      router.replace("/sign-in");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("errorDesc"));
    } finally {
      setBusyAction("");
    }
  }

  return (
    <main className="min-h-svh bg-muted/30 text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-4xl flex-col px-5 py-5 sm:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark className="h-6 w-6" priority />
            <span className="text-base font-black tracking-tight">qentrah</span>
          </Link>
          <AuthAccountButton
            disabled={busyAction === "sign-out"}
            label={t("useAnotherAccount")}
            loading={busyAction === "sign-out"}
            loadingLabel={t("signingOut")}
            onClick={() => void handleUseAnotherAccount()}
            user={session?.user}
          />
        </header>

        <section className="flex flex-1 items-center py-10">
          <div className="w-full rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-xl">
                <p className="text-xs font-black uppercase text-muted-foreground">
                  {t("eyebrow")}
                </p>
                <h1 className="mt-3 text-2xl font-black tracking-0 text-foreground sm:text-3xl">
                  {t("title")}
                </h1>
                <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">
                  {t("subtitle")}
                </p>
              </div>
              {session?.session?.activeOrganizationId ? (
                <Button
                  className="h-10 rounded-lg"
                  onClick={() => router.replace("/ws")}
                  type="button"
                  variant="outline"
                >
                  {t("continueWorkspace")}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>
              ) : null}
            </div>

            {error ? (
              <div className="mt-5 flex items-start gap-3 rounded-lg bg-destructive/10 px-4 py-3 text-sm font-semibold leading-6 text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            ) : null}

            <div className="mt-6 space-y-8">
              {isInitialLoading ? (
                <WorkspaceListSkeleton label={t("loading")} />
              ) : (
                <>
                  {hasInvitations || invitationsPending ? (
                    <section className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="text-sm font-black">
                            {t("invitedTitle")}
                          </h2>
                          <p className="mt-1 text-xs font-medium text-muted-foreground">
                            {t("invitedDesc")}
                          </p>
                        </div>
                        {invitationsPending ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : null}
                      </div>

                      {hasInvitations ? (
                        <div className="space-y-2">
                          {visibleInvitations.map((invitation) => {
                            const invitationBusy =
                              busyId === `invitation:${invitation.id}`;
                            return (
                              <div
                                className="flex flex-col gap-3 rounded-lg border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                                key={invitation.id}
                              >
                                <div className="flex min-w-0 items-start gap-3">
                                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                    {invitationBusy ? (
                                      <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                      <MailCheck className="h-5 w-5" />
                                    )}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate text-sm font-black">
                                      {invitation.organizationName ||
                                        invitation.organizationId}
                                    </span>
                                    <span className="mt-1 block text-xs font-semibold text-muted-foreground">
                                      {t("roleLabel")} {invitation.role}
                                    </span>
                                  </span>
                                </div>
                                <Button
                                  className="h-10 rounded-lg sm:w-auto"
                                  disabled={Boolean(busyId || busyAction)}
                                  onClick={() =>
                                    void acceptInvitation(invitation)
                                  }
                                  type="button"
                                >
                                  {invitationBusy ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                  )}
                                  {invitationBusy
                                    ? t("acceptingInvite")
                                    : t("acceptInvite")}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </section>
                  ) : null}

                  {hasOrganizations ? (
                    <section className="space-y-3">
                      <h2 className="text-sm font-black">
                        {t("existingTitle")}
                      </h2>
                      <div className="space-y-2">
                        {orgs?.map((org) => {
                          const isCurrent =
                            session?.session?.activeOrganizationId === org.id;
                          return (
                            <button
                              className="group flex w-full items-center gap-3 rounded-lg border border-border bg-background p-4 text-start transition hover:border-primary/50 hover:bg-accent/40 disabled:pointer-events-none disabled:opacity-60"
                              disabled={Boolean(busyId || busyAction)}
                              key={org.id}
                              onClick={() => void selectOrganization(org.id)}
                              type="button"
                            >
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                                {busyId === org.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                ) : isCurrent ? (
                                  <CheckCircle2 className="h-5 w-5 text-primary" />
                                ) : (
                                  <Building2 className="h-5 w-5 text-muted-foreground" />
                                )}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-black">
                                  {org.name ?? t("untitledWorkspace")}
                                </span>
                                <span className="mt-1 block truncate text-xs font-semibold text-muted-foreground">
                                  {isCurrent
                                    ? t("currentWorkspace")
                                    : (org.slug ?? org.id)}
                                </span>
                              </span>
                              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100 rtl:rotate-180" />
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  ) : null}

                  <section className="space-y-3 border-t border-border pt-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-sm font-black">
                          {t("createTitle")}
                        </h2>
                        <p className="mt-1 text-xs font-medium text-muted-foreground">
                          {hasOrganizations || hasInvitations
                            ? t("createHelp")
                            : t("noOrganizationsDesc")}
                        </p>
                      </div>
                      <Button
                        className="h-10 rounded-lg sm:w-auto"
                        disabled={Boolean(busyId || busyAction)}
                        onClick={() => setCreateOpen(true)}
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                        {t("createNew")}
                      </Button>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-lg p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              {t("createModalTitle")}
            </DialogTitle>
            <DialogDescription>{t("createModalDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label htmlFor="organization-name" className="text-sm font-black">
              {t("createNameLabel")}
            </label>
            <Input
              className="h-11 rounded-lg"
              id="organization-name"
              onChange={(event) => {
                setOrganizationName(event.target.value);
                setError("");
              }}
              placeholder={t("createNamePlaceholder")}
              value={organizationName}
            />
            <p className="text-xs font-semibold text-muted-foreground">
              {organizationSlug || "workspace-slug"}
            </p>
          </div>
          <DialogFooter className="mt-2 rounded-b-lg">
            <Button
              className="h-10 rounded-lg"
              disabled={busyAction === "create"}
              onClick={() => setCreateOpen(false)}
              type="button"
              variant="outline"
            >
              {t("hideCreate")}
            </Button>
            <Button
              className="h-10 rounded-lg"
              disabled={busyAction === "create" || Boolean(busyId)}
              onClick={() => void createOrganization()}
              type="button"
            >
              {busyAction === "create" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {busyAction === "create" ? t("creating") : t("createBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
