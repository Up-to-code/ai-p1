"use client";

import {
  AlertCircle,
  Loader2,
  MailCheck,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { AuthAccountButton } from "./auth-account-button";
import { useOrganizationEntry } from "../hooks/use-organization-entry";

type ChooseOrganizationClientProps = {
  callbackURL?: string | null;
  locale: string;
};

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

export function ChooseOrganizationClient({
  callbackURL,
  locale,
}: ChooseOrganizationClientProps) {
  const t = useTranslations("ChooseOrg");
  const {
    session,
    organizations: orgs,
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
  } = useOrganizationEntry({ callbackURL, locale });

  return (
    <main className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-white text-foreground dark:bg-[oklch(10%_0.008_260)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{ background: "var(--q-entry-canvas-wash)" }}
      />
      <div className="relative flex flex-1 animate-in items-center justify-center px-5 py-6 fade-in duration-300 sm:px-8">
        <header className="absolute inset-x-0 top-0 z-10 flex h-[72px] items-center justify-between px-5 sm:px-8">
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
            onClick={() => void useAnotherAccount()}
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
          <div className="w-full max-w-[368px]">
            <WorkspaceListSkeleton label={t("loading")} />
          </div>
        ) : (
          <div className="w-full max-w-[368px]">
            <div className="mb-7 text-center">
              <div className="mb-4 flex justify-center">
                <BrandMark className="h-9 w-9" priority />
              </div>
              <p className="text-xs font-medium text-text-secondary">{t("eyebrow")}</p>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.025em] text-foreground">
                {t("title")}
              </h1>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{t("subtitle")}</p>
            </div>

            <div className="flex flex-col gap-2.5">
            {visibleInvitations.map((invitation) => {
              const invitationBusy = busyId === `invitation:${invitation.id}`;
              return (
                <button
                  className="group flex min-h-[72px] items-center gap-3 rounded-md border border-border bg-white px-4 py-3 text-start transition hover:border-foreground/30 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 dark:bg-white/5"
                  disabled={Boolean(busyId || busyAction)}
                  key={invitation.id}
                  onClick={() => void acceptInvitation(invitation)}
                  type="button"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
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
                  className="group flex min-h-[72px] items-center gap-3 rounded-md border border-border bg-white px-4 py-3 text-start transition hover:border-foreground/30 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 dark:bg-white/5"
                  disabled={Boolean(busyId || busyAction)}
                  key={org.id}
                  onClick={() => void selectOrganization(org.id)}
                  type="button"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
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
              className="group flex min-h-[72px] items-center gap-3 rounded-md border border-dashed border-border bg-transparent px-4 py-3 text-start transition hover:border-foreground/35 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
              disabled={Boolean(busyId || busyAction)}
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition group-hover:text-foreground">
                <Plus className="size-5" />
              </span>
              <span className="text-sm font-medium text-foreground">
                {t("createNew")}
              </span>
            </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-[520px] gap-0 rounded-lg border border-border bg-card p-8 shadow-none">
          <DialogHeader className="gap-2 pe-8">
            <DialogTitle className="text-xl font-semibold tracking-[-0.02em]">
              {t("createModalTitle")}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6">
              {t("createModalDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-8">
            <label htmlFor="organization-name" className="mb-3 block text-xs font-medium text-text-secondary">
              {t("createNameLabel")}
            </label>
            <Input
              className="h-12 rounded-md bg-background"
              id="organization-name"
              onChange={(event) => {
                setOrganizationName(event.target.value);
              }}
              placeholder={t("createNamePlaceholder")}
              value={organizationName}
            />
            <p className="mt-3 rounded-md bg-muted/60 px-3 py-3 text-xs text-muted-foreground">
              {organizationSlug || "workspace-slug"}
            </p>
          </div>
          <div className="mt-8 flex items-center justify-end gap-2">
            <Button
              className="h-11 rounded-md px-5"
              disabled={busyAction === "create"}
              onClick={() => setCreateOpen(false)}
              type="button"
              variant="outline"
            >
              {t("hideCreate")}
            </Button>
            <Button
              aria-busy={busyAction === "create"}
              className="h-11 min-w-28 rounded-md bg-foreground px-5 text-background hover:bg-foreground/90"
              disabled={busyAction === "create" || Boolean(busyId)}
              onClick={() => void createOrganization()}
              type="button"
            >
              {busyAction === "create" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {busyAction === "create" ? t("creating") : t("createBtn")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
