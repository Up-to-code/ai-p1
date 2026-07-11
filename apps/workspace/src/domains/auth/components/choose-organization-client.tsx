"use client";

import { type MouseEvent, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Loader2,
  MailCheck,
  Plus,
} from "lucide-react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "@convex/_generated/api";
import { BrandMark } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    { invitations?: UserInvitation[] } | UserInvitation[];
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
    <main className="relative flex min-h-svh flex-col bg-[var(--q-bg)] text-foreground">
      <div className="flex flex-1 animate-in items-center justify-center fade-in zoom-in-95 duration-300">
        <header className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark className="h-5 w-5" priority />
            <span className="text-xs font-semibold tracking-tight">
              qentrah
            </span>
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

        {error ? (
          <div className="absolute inset-x-6 top-16 mx-auto flex max-w-md items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {isInitialLoading ? (
          <div className="w-full max-w-md px-6">
            <WorkspaceListSkeleton label={t("loading")} />
          </div>
        ) : (
          <div className="flex w-full max-w-md flex-col gap-3 px-6">
            {visibleInvitations.map((invitation) => {
              const invitationBusy = busyId === `invitation:${invitation.id}`;
              return (
                <button
                  className="group flex min-h-24 items-center gap-4 rounded-2xl border border-border bg-card p-4 text-start transition duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
                  disabled={Boolean(busyId || busyAction)}
                  key={invitation.id}
                  onClick={() => void acceptInvitation(invitation)}
                  type="button"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    {invitationBusy ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <MailCheck className="size-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {invitation.organizationName || invitation.organizationId}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {invitationBusy
                        ? t("acceptingInvite")
                        : t("acceptInvite")}
                    </span>
                  </span>
                </button>
              );
            })}
            {orgs?.map((org) => {
              const isBusy = busyId === org.id;
              return (
                <button
                  className="group flex min-h-24 items-center gap-4 rounded-2xl border border-border bg-card p-4 text-start transition duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
                  disabled={Boolean(busyId || busyAction)}
                  key={org.id}
                  onClick={() => void selectOrganization(org.id)}
                  type="button"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground">
                    {isBusy ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : org.logo ? (
                      <img
                        alt=""
                        className="size-full object-cover"
                        src={org.logo}
                      />
                    ) : (
                      <BrandMark className="size-7" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {org.name ?? t("untitledWorkspace")}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {isBusy ? t("loading") : (org.slug ?? "")}
                    </span>
                  </span>
                </button>
              );
            })}
            <button
              className="group flex min-h-24 items-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 p-4 text-start transition duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
              disabled={Boolean(busyId || busyAction)}
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition duration-200 group-hover:scale-110 group-hover:text-foreground">
                <Plus className="size-5" />
              </span>
              <span className="text-sm font-medium text-foreground">
                {t("createNew")}
              </span>
            </button>
          </div>
        )}
      </div>

      <div className="hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark className="h-5 w-5" priority />
            <span className="text-xs font-semibold tracking-tight">
              qentrah
            </span>
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

        <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              {t("title")}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {session?.session?.activeOrganizationId ? (
              <Button
                className="h-9 rounded-lg px-4 text-sm font-medium"
                onClick={() => router.replace("/ws")}
                type="button"
                variant="outline"
              >
                {t("continueWorkspace")}
                <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            ) : null}
            <Button
              className="h-9 rounded-lg px-4 text-sm font-medium"
              disabled={Boolean(busyId || busyAction)}
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              <Plus className="h-4 w-4" />
              {t("createNew")}
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[var(--q-bg)]">
          {error ? (
            <div className="mx-6 mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          ) : null}

          {isInitialLoading ? (
            <div className="mx-6 mt-4 max-w-5xl">
              <WorkspaceListSkeleton label={t("loading")} />
            </div>
          ) : (
            <div className="space-y-6 pb-8">
              {hasInvitations || invitationsPending ? (
                <section className="mx-6 mt-6 max-w-5xl">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">
                        {t("invitedTitle")}
                      </h2>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {t("invitedDesc")}
                      </p>
                    </div>
                    {invitationsPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : null}
                  </div>
                  {hasInvitations ? (
                    <div className="overflow-hidden rounded-xl border border-border bg-card">
                      <Table>
                        <TableHeader className="bg-muted/40">
                          <TableRow className="hover:bg-transparent">
                            <TableHead>Organization</TableHead>
                            <TableHead className="w-40">Access</TableHead>
                            <TableHead className="w-36 text-right">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {visibleInvitations.map((invitation) => {
                            const invitationBusy =
                              busyId === `invitation:${invitation.id}`;
                            return (
                              <TableRow key={invitation.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                      {invitationBusy ? (
                                        <Loader2 className="size-4 animate-spin" />
                                      ) : (
                                        <MailCheck className="size-4" />
                                      )}
                                    </span>
                                    <span className="min-w-0">
                                      <span className="block truncate font-medium text-foreground">
                                        {invitation.organizationName ||
                                          invitation.organizationId}
                                      </span>
                                      <span className="block truncate text-xs text-muted-foreground">
                                        {invitation.email}
                                      </span>
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="secondary"
                                    className="h-5 normal-case tracking-normal"
                                  >
                                    {invitation.role}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    className="h-8 rounded-lg px-3 text-xs"
                                    disabled={Boolean(busyId || busyAction)}
                                    onClick={() =>
                                      void acceptInvitation(invitation)
                                    }
                                    type="button"
                                  >
                                    {invitationBusy ? (
                                      <Loader2 className="size-3.5 animate-spin" />
                                    ) : null}
                                    {invitationBusy
                                      ? t("acceptingInvite")
                                      : t("acceptInvite")}
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : null}
                </section>
              ) : null}

              <section className="mx-6 max-w-5xl">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-semibold text-foreground">
                      {t("existingTitle")}
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {hasOrganizations
                        ? t("subtitle")
                        : t("noOrganizationsDesc")}
                    </p>
                  </div>
                </div>
                {hasOrganizations ? (
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <Table>
                      <TableHeader className="bg-muted/40">
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Organization</TableHead>
                          <TableHead className="w-40">Status</TableHead>
                          <TableHead className="w-32 text-right">
                            Action
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orgs?.map((org) => {
                          const isCurrent =
                            session?.session?.activeOrganizationId === org.id;
                          const isBusy = busyId === org.id;
                          return (
                            <TableRow
                              key={org.id}
                              className="cursor-pointer"
                              onClick={() => void selectOrganization(org.id)}
                            >
                              <TableCell>
                                <div className="flex min-w-0 items-center gap-3">
                                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                                    {isBusy ? (
                                      <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                      <Building2 className="size-4" />
                                    )}
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block truncate font-medium text-foreground">
                                      {org.name ?? t("untitledWorkspace")}
                                    </span>
                                    <span className="block truncate text-xs text-muted-foreground">
                                      {org.slug ?? org.id}
                                    </span>
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {isCurrent ? (
                                  <Badge
                                    variant="secondary"
                                    className="h-5 normal-case tracking-normal"
                                  >
                                    {t("currentWorkspace")}
                                  </Badge>
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  className="h-8 rounded-lg px-3 text-xs"
                                  disabled={Boolean(busyId || busyAction)}
                                  onClick={(
                                    event: MouseEvent<HTMLButtonElement>,
                                  ) => {
                                    event.stopPropagation();
                                    void selectOrganization(org.id);
                                  }}
                                  type="button"
                                  variant={isCurrent ? "outline" : "ghost"}
                                >
                                  {isBusy ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                  ) : null}
                                  <span className="sr-only">{org.name}</span>
                                  <ArrowRight className="size-3.5 rtl:rotate-180" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-border bg-card px-4 py-8 text-sm text-muted-foreground">
                    {t("noOrganizationsDesc")}
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-md p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {t("createModalTitle")}
            </DialogTitle>
            <DialogDescription>{t("createModalDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label htmlFor="organization-name" className="text-sm font-black">
              {t("createNameLabel")}
            </label>
            <Input
              className="h-10 rounded-md"
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
              className="h-9 rounded-md"
              disabled={busyAction === "create"}
              onClick={() => setCreateOpen(false)}
              type="button"
              variant="outline"
            >
              {t("hideCreate")}
            </Button>
            <Button
              className="h-9 rounded-md"
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
