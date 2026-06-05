"use client";

import { useEffect, useMemo, useState } from "react";
import { useClerk, useOrganization, useUser } from "@clerk/nextjs";
import { AlertCircle, ArrowRight, Building2, CheckCircle2, Loader2, LogOut, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type ChooseOrganizationClientProps = {
  locale: string;
};

type ClerkOrganization = {
  id: string;
  name?: string | null;
  slug?: string | null;
};

type ClerkMembership = {
  organization?: ClerkOrganization | null;
};

type ClerkMembershipList = ClerkMembership[] | { data?: ClerkMembership[] } | null | undefined;

function normalizeMemberships(memberships: ClerkMembershipList) {
  const data = Array.isArray(memberships) ? memberships : memberships?.data ?? [];
  return data
    .map((membership) => membership.organization)
    .filter((organization): organization is ClerkOrganization => Boolean(organization?.id));
}

function isOrganizationsDisabledError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("organizations feature is not enabled");
}

function isOrganizationSlugsDisabledError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("does not have slugs enabled");
}

function WorkspaceListSkeleton({ label }: { label: string }) {
  return (
    <div className="p-5">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
          <div className="mt-3 h-2.5 w-44 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="h-11 w-11 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="space-y-3">
        {[0, 1, 2].map((item) => (
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4" key={item}>
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-2xl bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
              <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-xs font-semibold text-text-secondary">{label}</p>
    </div>
  );
}

export function ChooseOrganizationClient({ locale }: ChooseOrganizationClientProps) {
  const t = useTranslations("ChooseOrg");
  const router = useRouter();
  const clerk = useClerk();
  const { isLoaded: userLoaded, user } = useUser();
  const { isLoaded: organizationLoaded, organization } = useOrganization();
  const [choice, setChoice] = useState<"create" | null>(null);
  const [organizationName, setOrganizationName] = useState("");
  const [remoteMemberships, setRemoteMemberships] = useState<{ userId: string; organizations: ClerkOrganization[] } | null>(null);
  const [busyId, setBusyId] = useState("");
  const [busyAction, setBusyAction] = useState<"create" | "sign-out" | "">("");
  const [error, setError] = useState("");

  const cachedOrganizations = useMemo(
    () => normalizeMemberships(user?.organizationMemberships as ClerkMembershipList),
    [user],
  );
  const remoteOrganizations =
    remoteMemberships && remoteMemberships.userId === user?.id ? remoteMemberships.organizations : null;
  const organizations = remoteOrganizations ?? cachedOrganizations;
  const canRefreshMemberships = Boolean(
    user &&
      (user as unknown as { getOrganizationMemberships?: () => Promise<ClerkMembershipList> }).getOrganizationMemberships,
  );
  const membershipsLoading = Boolean(user && canRefreshMemberships && remoteMemberships?.userId !== user.id);
  const currentOrganizationId = organization?.id ?? null;
  const isBusy = Boolean(busyId || busyAction);
  const isLoading = !userLoaded || !organizationLoaded || membershipsLoading;
  const activeChoice = choice ?? (!isLoading && organizations.length === 0 ? "create" : null);

  useEffect(() => {
    if (!userLoaded) return;
    if (!user) {
      router.replace(`/sign-in?callbackURL=${encodeURIComponent(`/${locale}/choose-org`)}`);
      return;
    }

    let active = true;
    const getOrganizationMemberships = (user as unknown as {
      getOrganizationMemberships?: () => Promise<ClerkMembershipList>;
    }).getOrganizationMemberships;

    if (!getOrganizationMemberships) return;

    void getOrganizationMemberships
      .call(user)
      .then((memberships) => {
        if (active) setRemoteMemberships({ userId: user.id, organizations: normalizeMemberships(memberships) });
      })
      .catch(() => {
        if (active) setRemoteMemberships({ userId: user.id, organizations: cachedOrganizations });
      });

    return () => {
      active = false;
    };
  }, [cachedOrganizations, locale, router, user, userLoaded]);

  async function selectOrganization(organizationId: string) {
    setBusyId(organizationId);
    setError("");
    try {
      await clerk.setActive({ organization: organizationId });
      router.replace("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : t("errorDesc"));
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
      const clerkApi = clerk as unknown as {
        createOrganization?: (input: { name: string }) => Promise<ClerkOrganization>;
      };
      const organization = await clerkApi.createOrganization?.({
        name,
      });
      if (!organization?.id) throw new Error(t("errorDesc"));
      await clerk.setActive({ organization: organization.id });
      router.replace("/onboarding");
    } catch (error) {
      if (isOrganizationsDisabledError(error)) {
        setError(t("organizationsDisabled"));
        return;
      }
      if (isOrganizationSlugsDisabledError(error)) {
        setError(t("slugsDisabled"));
        return;
      }
      setError(error instanceof Error ? error.message : t("errorDesc"));
    } finally {
      setBusyAction("");
    }
  }

  async function handleUseAnotherAccount() {
    setBusyAction("sign-out");
    setError("");
    try {
      await clerk.signOut();
      router.replace("/sign-in");
    } catch (error) {
      setError(error instanceof Error ? error.message : t("errorDesc"));
    } finally {
      setBusyAction("");
    }
  }

  return (
    <main className="relative min-h-svh overflow-hidden bg-[oklch(96.5%_0.008_255)] px-4 py-6 text-foreground dark:bg-[oklch(8.5%_0.012_255)] sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_24%,oklch(90%_0.035_255)_0%,transparent_32%),linear-gradient(135deg,transparent,oklch(99%_0.004_255)_55%,transparent)] dark:bg-[radial-gradient(circle_at_70%_24%,oklch(24%_0.045_255)_0%,transparent_32%),linear-gradient(135deg,transparent,oklch(12%_0.018_255)_55%,transparent)]" />
      <div className="relative mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-5xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
            <BrandMark className="h-7 w-auto" priority />
            <span className="text-lg font-black tracking-tight">qentrah</span>
          </Link>
          <Button disabled={busyAction === "sign-out"} onClick={() => void handleUseAnotherAccount()} size="sm" type="button" variant="ghost">
            {busyAction === "sign-out" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            {busyAction === "sign-out" ? t("signingOut") : t("useAnotherAccount")}
          </Button>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="max-w-xl">
            <p className="text-[10px] font-black uppercase tracking-[0.08em] text-primary">
              {t("eyebrow")}
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-0 text-foreground sm:text-5xl rtl:leading-[1.18]">
              {t("title")}
            </h1>
            <p className="mt-4 max-w-md text-base font-medium leading-8 text-text-secondary">
              {t("subtitle")}
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-[oklch(87%_0.014_255)] bg-[oklch(99%_0.004_255)] dark:border-white/10 dark:bg-[oklch(13%_0.016_255)]">
            {isLoading ? (
              <WorkspaceListSkeleton label={t("loading")} />
            ) : (
              <div className="divide-y divide-border">
                {error ? (
                  <div className="flex items-start gap-3 bg-red-50 px-5 py-4 text-sm font-semibold leading-6 text-red-700 dark:bg-red-400/10 dark:text-red-200">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{error}</p>
                  </div>
                ) : null}

                {organizations.length > 0 ? (
                  <div className="bg-muted/40 px-5 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-text-secondary">
                    {t("existingTitle")}
                  </div>
                ) : null}

                {organizations.map((organization) => {
                  const isCurrent = currentOrganizationId === organization.id;
                  return (
                    <button
                      className="flex w-full items-center gap-4 p-5 text-start transition hover:bg-muted disabled:pointer-events-none disabled:opacity-60"
                      disabled={isBusy}
                      key={organization.id}
                      onClick={() => void selectOrganization(organization.id)}
                      type="button"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface">
                        {busyId === organization.id || isCurrent ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Building2 className="h-5 w-5 text-foreground" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-foreground">
                          {organization.name ?? t("untitledWorkspace")}
                        </span>
                        <span className="mt-1 block truncate text-xs font-semibold text-text-secondary">
                          {isCurrent ? t("currentWorkspace") : organization.slug ?? organization.id}
                        </span>
                      </span>
                      {busyId === organization.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
                      ) : (
                        <ArrowRight className="h-4 w-4 text-text-secondary rtl:rotate-180" />
                      )}
                    </button>
                  );
                })}

                <div className="bg-muted/40 px-5 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-text-secondary">
                  {t("setupAccess")}
                </div>

                <button
                  className={cn(
                    "flex w-full items-center gap-4 p-5 text-start transition hover:bg-muted",
                    activeChoice === "create" && "bg-muted",
                  )}
                  disabled={isBusy}
                  onClick={() => {
                    setError("");
                    setChoice(choice === "create" ? null : "create");
                  }}
                  type="button"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface">
                    <Plus className="h-5 w-5 text-foreground" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-foreground">{t("createTitle")}</span>
                    <span className="mt-1 block text-xs font-semibold leading-5 text-text-secondary">{t("createDesc")}</span>
                  </span>
                </button>

                {activeChoice === "create" ? (
                  <div className="space-y-4 bg-muted/60 p-5">
                    <div className="space-y-2">
                      <Label htmlFor="organization-name" className="text-xs font-black uppercase tracking-[0.08em] text-text-secondary">
                        {t("createNameLabel")}
                      </Label>
                      <Input
                        className="h-12 rounded-2xl"
                        id="organization-name"
                        onChange={(event) => {
                          setOrganizationName(event.target.value);
                          setError("");
                        }}
                        placeholder={t("createNamePlaceholder")}
                        value={organizationName}
                      />
                    </div>
                    <Button className="h-12 w-full rounded-2xl text-sm font-bold" disabled={busyAction === "create"} onClick={() => void createOrganization()} type="button">
                      {busyAction === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      {busyAction === "create" ? t("creating") : t("createBtn")}
                      {busyAction === "create" ? null : <ArrowRight className="h-4 w-4 rtl:rotate-180" />}
                    </Button>
                  </div>
                ) : null}

                {currentOrganizationId ? (
                  <div className="bg-background p-5">
                    <Button className="h-12 w-full rounded-2xl text-sm font-bold" disabled={isBusy} onClick={() => router.replace("/dashboard")} type="button">
                      {t("continueWorkspace")}
                      <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
