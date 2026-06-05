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
    <main className="min-h-svh bg-[oklch(96.5%_0.008_255)] px-4 py-6 text-foreground dark:bg-[oklch(8.5%_0.012_255)] sm:px-6">
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-3xl flex-col">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <Button
            className="justify-self-start text-text-secondary"
            disabled={busyAction === "sign-out"}
            onClick={() => void handleUseAnotherAccount()}
            size="sm"
            type="button"
            variant="ghost"
          >
            {busyAction === "sign-out" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            <span className="hidden sm:inline">{busyAction === "sign-out" ? t("signingOut") : t("useAnotherAccount")}</span>
          </Button>
          <Link href="/" className="group flex items-center gap-2 justify-self-center">
            <span className="text-sm font-black tracking-tight">qentrah</span>
            <BrandMark className="h-6 w-auto" priority />
          </Link>
        </header>

        <section className="flex flex-1 flex-col items-center justify-center gap-7 py-8 sm:py-10">
          <div className="max-w-sm text-center">
            <p className="text-[11px] font-black text-primary">
              {t("eyebrow")}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-[1.08] tracking-0 text-foreground sm:text-4xl rtl:leading-[1.14]">
              {t("title")}
            </h1>
            <p className="mt-3 text-sm font-medium leading-6 text-text-secondary">
              {t("subtitle")}
            </p>
          </div>

          <div className="w-full max-w-[424px] overflow-hidden rounded-3xl border border-[oklch(86%_0.014_255)] bg-[oklch(99%_0.004_255)] dark:border-white/10 dark:bg-[oklch(13%_0.016_255)]">
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
